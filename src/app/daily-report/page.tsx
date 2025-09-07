
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTransactions } from '@/context/transaction-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useInventory } from '@/context/inventory-context';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="space-y-2 text-sm">{children}</div>
    </div>
);

const ReportRow = ({ label, value, className }: { label: string; value: string | number; className?: string }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-medium", className)}>{value}</span>
    </div>
);

export default function DailyReportPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { sales, purchases, expenses, receipts, getAllTransactions } = useTransactions();
    const { inventory } = useInventory();
    const { transactions: airtimeTransactions, getStock: getAirtimeStock } = useAirtime();
    const { transactions: mobileMoneyTransactions, getBalance: getMobileMoneyBalance } = useMobileMoney();
    
    const todayInterval = { start: startOfDay(new Date()), end: endOfDay(new Date()) };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' F';

    const dailyStats = useMemo(() => {
        const dailySales = sales.filter(s => isWithinInterval(new Date(s.date), todayInterval));
        const dailyAirtimeCommissions = airtimeTransactions
            .filter(t => t.type === 'commission' && isWithinInterval(new Date(t.date), todayInterval))
            .reduce((acc, t) => acc + t.commission, 0);
        const dailyMMCommissions = mobileMoneyTransactions
            .filter(t => isWithinInterval(new Date(t.date), todayInterval))
            .reduce((acc, t) => acc + t.commission, 0);

        const merchandiseSales = dailySales.filter(s => s.itemType !== 'Ticket Wifi').reduce((acc, s) => acc + s.amount, 0);
        const wifiSales = dailySales.filter(s => s.itemType === 'Ticket Wifi').reduce((acc, s) => acc + s.amount, 0);
        
        const airtimeSales = airtimeTransactions
            .filter(t => t.type === 'sale' && isWithinInterval(new Date(t.date), todayInterval))
            .reduce((acc, t) => acc + t.amount, 0);

        const totalRevenue = merchandiseSales + wifiSales + airtimeSales + dailyAirtimeCommissions + dailyMMCommissions;
        const totalMargin = dailySales.reduce((acc, s) => acc + (s.margin || 0), 0) + dailyAirtimeCommissions + dailyMMCommissions;
        const totalExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), todayInterval)).reduce((acc, e) => acc + e.amount, 0);

        const dailyPurchases = purchases.filter(p => p.status === 'paid' && isWithinInterval(new Date(p.date), todayInterval));
        const dailyReceipts = receipts.filter(r => isWithinInterval(new Date(r.date), todayInterval));

        const allCashTransactions = getAllTransactions();
        const cashBalanceStartOfDay = allCashTransactions.filter(t => new Date(t.date) < todayInterval.start).reduce((acc, t) => {
            if (t.type === 'sale') return acc + t.amount;
            if (t.type === 'purchase' || t.type === 'expense') return acc - t.amount;
            if (t.type === 'adjustment') return acc + t.amount;
            return acc;
        }, 0);
        
        const cashIn = dailySales.reduce((acc, s) => acc + s.amount, 0) + dailyReceipts.reduce((acc, r) => acc + r.amount, 0);
        const cashOut = totalExpenses + dailyPurchases.reduce((acc, p) => acc + p.amount, 0);
        const cashBalanceEndOfDay = cashBalanceStartOfDay + cashIn - cashOut;
        
        const reorderList = inventory
            .filter(item => item.inStock <= item.reorderLevel)
            .map(item => ({
                ...item,
                cost: item.costPrice || 0,
            }))
            .filter(item => item.inStock < item.reorderLevel);

        const reorderValue = reorderList.reduce((acc, item) => {
            const qtyToOrder = item.reorderLevel - item.inStock > 0 ? item.reorderLevel - item.inStock : 0;
            return acc + (qtyToOrder * item.cost);
        }, 0);

        return {
            totalRevenue,
            totalMargin,
            totalExpenses,
            netResult: totalMargin - totalExpenses,
            reorderList,
            reorderValue,
            breakdown: {
                'Ventes de Marchandises': merchandiseSales,
                'Ventes Wifi': wifiSales,
                'Ventes Airtime': airtimeSales,
                'Commissions Airtime': dailyAirtimeCommissions,
                'Commissions Mobile Money': dailyMMCommissions,
            },
            cash: {
                startOfDay: cashBalanceStartOfDay,
                in: cashIn,
                out: cashOut,
                endOfDay: cashBalanceEndOfDay,
            },
            operations: {
                purchases: dailyPurchases,
                expenses: expenses.filter(e => isWithinInterval(new Date(e.date), todayInterval)),
                receipts: dailyReceipts,
            },
            virtualBalances: {
                airtimeMoov: getAirtimeStock('Moov'),
                airtimeYas: getAirtimeStock('Yas'),
                mmFlooz: getMobileMoneyBalance('Flooz'),
                mmMixx: getMobileMoneyBalance('Mixx'),
                mmCoris: getMobileMoneyBalance('Coris'),
            }
        };
    }, [isClient, sales, purchases, expenses, receipts, airtimeTransactions, mobileMoneyTransactions, getAllTransactions, inventory]);

    if (!isClient) {
        return null; // or a loading skeleton
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader
                title="Rapport Journalier"
                action={
                    <Button onClick={handlePrint} className="print:hidden">
                        <Printer className="mr-2 h-4 w-4" /> Imprimer le Rapport
                    </Button>
                }
            />

            <Card className="w-full max-w-4xl mx-auto print:shadow-none print:border-none" id="report-content">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Rapport Quotidien d'Activité</CardTitle>
                    <CardDescription>
                        Synthèse de la journée du {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                            <p className="text-xl font-bold">{formatCurrency(dailyStats.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Marge Brute</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(dailyStats.totalMargin)}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Dépenses</p>
                            <p className="text-xl font-bold text-destructive">{formatCurrency(dailyStats.totalExpenses)}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className={cn("text-sm font-medium")}>Résultat Net</p>
                            <p className={cn("text-xl font-bold", dailyStats.netResult >= 0 ? "text-primary" : "text-destructive")}>{formatCurrency(dailyStats.netResult)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Revenue Breakdown */}
                        <div className="space-y-4">
                            <Section title="Répartition du Chiffre d'Affaires">
                                {Object.entries(dailyStats.breakdown).map(([key, value]) => (
                                    <ReportRow key={key} label={key} value={formatCurrency(value)} />
                                ))}
                            </Section>
                             <Section title="Soldes des Portefeuilles Virtuels">
                                <ReportRow label="Airtime Moov" value={formatCurrency(dailyStats.virtualBalances.airtimeMoov)} />
                                <ReportRow label="Airtime Yas" value={formatCurrency(dailyStats.virtualBalances.airtimeYas)} />
                                <ReportRow label="Mobile Money Flooz" value={formatCurrency(dailyStats.virtualBalances.mmFlooz)} />
                                <ReportRow label="Mobile Money Mixx" value={formatCurrency(dailyStats.virtualBalances.mmMixx)} />
                                <ReportRow label="Mobile Money Coris" value={formatCurrency(dailyStats.virtualBalances.mmCoris)} />
                            </Section>
                        </div>
                       
                        {/* Cash Flow */}
                        <div className="space-y-4">
                             <Section title="Mouvements de Trésorerie">
                                <ReportRow label="Solde en début de journée" value={formatCurrency(dailyStats.cash.startOfDay)} />
                                <ReportRow label="Total des entrées" value={formatCurrency(dailyStats.cash.in)} className="text-green-600" />
                                <ReportRow label="Total des sorties" value={formatCurrency(dailyStats.cash.out)} className="text-destructive" />
                                <Separator />
                                <ReportRow label="Solde final théorique" value={formatCurrency(dailyStats.cash.endOfDay)} className="font-bold text-lg text-primary" />
                            </Section>

                             <Section title="Détail des Opérations">
                                <h4 className="font-semibold text-muted-foreground">Dépenses du jour</h4>
                                {dailyStats.operations.expenses.length > 0 ? (
                                    dailyStats.operations.expenses.map(e => <ReportRow key={e.id} label={e.description} value={formatCurrency(e.amount)} />)
                                ) : <p className="text-sm text-muted-foreground italic">Aucune dépense.</p>}
                                <h4 className="font-semibold text-muted-foreground pt-2">Achats réglés du jour</h4>
                                {dailyStats.operations.purchases.length > 0 ? (
                                    dailyStats.operations.purchases.map(p => <ReportRow key={p.id} label={p.description} value={formatCurrency(p.amount)} />)
                                ) : <p className="text-sm text-muted-foreground italic">Aucun achat réglé.</p>}
                             </Section>
                        </div>
                    </div>
                    
                    {dailyStats.reorderList.length > 0 && (
                        <Section title="Liste de Réapprovisionnement">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Article</TableHead>
                                        <TableHead className="text-center">Stock Actuel</TableHead>
                                        <TableHead className="text-center">Qté à Commander</TableHead>
                                        <TableHead className="text-right">Coût Estimé</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyStats.reorderList.map(item => {
                                        const qtyToOrder = item.reorderLevel - item.inStock > 0 ? item.reorderLevel - item.inStock : 0;
                                        const estimatedCost = qtyToOrder * item.cost;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-center text-destructive font-bold">{item.inStock}</TableCell>
                                                <TableCell className="text-center font-bold text-blue-600">{qtyToOrder}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(estimatedCost)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                            <Separator />
                            <div className="flex justify-end pt-2">
                                <div className="font-bold text-lg">
                                    Valeur Totale de la Commande : <span className="font-mono text-primary">{formatCurrency(dailyStats.reorderValue)}</span>
                                </div>
                            </div>
                        </Section>
                    )}

                </CardContent>
                 <style jsx global>{`
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print\\:hidden {
                            display: none;
                        }
                        .print\\:shadow-none {
                            box-shadow: none;
                        }
                        .print\\:border-none {
                            border: none;
                        }
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    }
                `}</style>
            </Card>
        </div>
    );
}
