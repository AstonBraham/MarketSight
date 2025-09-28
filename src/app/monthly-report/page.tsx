
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTransactions } from '@/context/transaction-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useInventory } from '@/context/inventory-context';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

export default function MonthlyReportPage() {
    const [isClient, setIsClient] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { sales, purchases, expenses, receipts, getAllTransactions } = useTransactions();
    const { inventory } = useInventory();
    const { transactions: airtimeTransactions } = useAirtime();
    const { transactions: mobileMoneyTransactions } = useMobileMoney();
    
    const monthInterval = { start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) };

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' F';
    
    const monthlyStats = useMemo(() => {
        const monthlySales = sales.filter(s => isWithinInterval(new Date(s.date), monthInterval));
        
        const monthlyAirtimeCommissions = airtimeTransactions
            .filter(t => isWithinInterval(new Date(t.date), monthInterval))
            .reduce((acc, t) => acc + t.commission, 0);

        const monthlyMMCommissions = mobileMoneyTransactions
            .filter(t => isWithinInterval(new Date(t.date), monthInterval))
            .reduce((acc, t) => acc + t.commission, 0);

        const merchandiseSales = monthlySales.filter(s => s.itemType !== 'Ticket Wifi').reduce((acc, s) => acc + s.amount, 0);
        const wifiSales = monthlySales.filter(s => s.itemType === 'Ticket Wifi').reduce((acc, s) => acc + s.amount, 0);
        
        const totalRevenue = merchandiseSales + wifiSales + monthlyAirtimeCommissions + monthlyMMCommissions;
        const totalMargin = monthlySales.reduce((acc, s) => acc + (s.margin || 0), 0) + monthlyAirtimeCommissions + monthlyMMCommissions;
        const totalExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), monthInterval)).reduce((acc, e) => acc + e.amount, 0);

        const allCashTransactions = getAllTransactions();
        const cashBalanceStartOfMonth = allCashTransactions.filter(t => new Date(t.date) < monthInterval.start).reduce((acc, t) => acc + t.amount, 0);
        
        const cashIn = allCashTransactions
            .filter(t => isWithinInterval(new Date(t.date), monthInterval) && t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);
            
        const cashOut = allCashTransactions
            .filter(t => isWithinInterval(new Date(t.date), monthInterval) && t.amount < 0)
            .reduce((acc, t) => acc + t.amount, 0);
            
        const cashBalanceEndOfMonth = cashBalanceStartOfMonth + cashIn + cashOut;

        const salesByCategory = monthlySales.reduce((acc, sale) => {
            const category = sale.itemType || 'Non classé';
            acc[category] = (acc[category] || 0) + sale.amount;
            return acc;
        }, {} as Record<string, number>);


        return {
            totalRevenue,
            totalMargin,
            totalExpenses,
            netResult: totalMargin - totalExpenses,
            breakdown: {
                'Ventes de Marchandises': merchandiseSales,
                'Ventes Wifi': wifiSales,
                'Commissions Airtime': monthlyAirtimeCommissions,
                'Commissions Mobile Money': monthlyMMCommissions,
            },
            cash: {
                start: cashBalanceStartOfMonth,
                in: cashIn,
                out: cashOut,
                end: cashBalanceEndOfMonth,
            },
            salesByCategory: Object.entries(salesByCategory)
                .map(([name, value]) => ({ name, value }))
                .sort((a,b) => b.value - a.value)
        };
    }, [currentMonth, sales, purchases, expenses, receipts, airtimeTransactions, mobileMoneyTransactions, getAllTransactions]);

    if (!isClient) {
        return null; // or a loading skeleton
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader
                title="Rapport Mensuel d'Activité"
                action={
                    <div className="flex items-center gap-2 print:hidden">
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-lg w-32 text-center capitalize">
                                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                            </span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimer
                        </Button>
                    </div>
                }
            />

            <Card className="w-full max-w-4xl mx-auto print:shadow-none print:border-none" id="report-content">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Rapport d'Activité de {format(currentMonth, 'MMMM yyyy', { locale: fr })}</CardTitle>
                    <CardDescription>
                        Synthèse de la période du {format(monthInterval.start, 'dd/MM/yyyy')} au {format(monthInterval.end, 'dd/MM/yyyy')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                            <p className="text-xl font-bold">{formatCurrency(monthlyStats.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Marge Brute</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyStats.totalMargin)}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Dépenses</p>
                            <p className="text-xl font-bold text-destructive">{formatCurrency(monthlyStats.totalExpenses)}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className={cn("text-sm font-medium")}>Résultat Net</p>
                            <p className={cn("text-xl font-bold", monthlyStats.netResult >= 0 ? "text-primary" : "text-destructive")}>{formatCurrency(monthlyStats.netResult)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Revenue Breakdown */}
                        <div className="space-y-4">
                            <Section title="Répartition du Chiffre d'Affaires">
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyStats.salesByCategory} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Section>
                        </div>
                       
                        {/* Cash Flow */}
                        <div className="space-y-4">
                             <Section title="Mouvements de Trésorerie">
                                <ReportRow label="Solde en début de mois" value={formatCurrency(monthlyStats.cash.start)} />
                                <ReportRow label="Total des entrées" value={formatCurrency(monthlyStats.cash.in)} className="text-green-600" />
                                <ReportRow label="Total des sorties" value={formatCurrency(monthlyStats.cash.out)} className="text-destructive" />
                                <Separator/>
                                <ReportRow label="Solde final théorique" value={formatCurrency(monthlyStats.cash.end)} className="font-bold text-lg text-primary" />
                            </Section>
                        </div>
                    </div>
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
