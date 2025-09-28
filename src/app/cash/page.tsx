
'use client';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/cash/columns';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { useTransactions } from '@/context/transaction-context';
import { useMemo, useState } from 'react';
import type { Transaction } from '@/lib/types';
import { AdjustCashBalanceDialog } from '@/components/cash/adjust-cash-balance-dialog';
import { AddCashEntryDialog } from '@/components/cash/add-cash-entry-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TransactionFilter = 'all' | 'sales' | 'purchases' | 'expenses' | 'receipts';

export default function CashPage() {
  const { getAllTransactions, getLastClosingDate } = useTransactions();
  const allTransactions = getAllTransactions();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const lastClosingDate = getLastClosingDate();
  
  const processedTransactions = useMemo(() => {
    let balance = 0;
    const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const withBalance: Transaction[] = sorted.map(t => {
      if (t.type === 'sale') {
        balance += t.amount;
      } else if (t.type === 'purchase' || t.type === 'expense') {
        balance -= Math.abs(t.amount);
      } else if (t.type === 'adjustment') {
        balance += t.amount;
      }
      return { ...t, balance };
    });

    return withBalance.reverse();
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') {
      return processedTransactions;
    }
    if (filter === 'sales') {
      return processedTransactions.filter(t => t.type === 'sale');
    }
    if (filter === 'purchases') {
      return processedTransactions.filter(t => t.type === 'purchase');
    }
    if (filter === 'expenses') {
      return processedTransactions.filter(t => t.type === 'expense');
    }
    if (filter === 'receipts') {
      return processedTransactions.filter(t => t.type === 'adjustment' && t.category === 'Encaissement' && t.amount > 0);
    }
    return processedTransactions;
  }, [processedTransactions, filter]);

  const currentBalance = processedTransactions.length > 0 ? processedTransactions[0].balance : 0;
  
  const dailyIncome = allTransactions
    .filter(t => (t.type === 'sale' || (t.type === 'adjustment' && t.amount > 0)) && (!lastClosingDate || new Date(t.date) > lastClosingDate))
    .reduce((acc, t) => acc + t.amount, 0);

  const dailyOutcome = allTransactions
    .filter(t => (t.type === 'purchase' || t.type === 'expense' || (t.type === 'adjustment' && t.amount < 0)) && (!lastClosingDate || new Date(t.date) > lastClosingDate))
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const netFlow = dailyIncome - dailyOutcome;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion de la Trésorerie" 
        action={
            <div className="flex items-center gap-2">
                <AdjustCashBalanceDialog currentBalance={currentBalance || 0} />
            </div>
        } 
      />
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde de Caisse</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(currentBalance || 0)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrées du Jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+{new Intl.NumberFormat('fr-FR').format(dailyIncome)} F</div>
                 <p className="text-xs text-muted-foreground">Total des ventes et encaissements</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sorties du Jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-{new Intl.NumberFormat('fr-FR').format(dailyOutcome)} F</div>
                 <p className="text-xs text-muted-foreground">Achats et dépenses</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flux Net</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netFlow >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(netFlow)} F</div>
                <p className="text-xs text-muted-foreground">Bénéfice du jour</p>
            </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <CashflowChart />
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Détail des Mouvements</CardTitle>
                        <CardDescription>Liste de toutes les transactions de caisse.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter" className="whitespace-nowrap">Filtrer par</Label>
                        <Select value={filter} onValueChange={(value) => setFilter(value as TransactionFilter)}>
                            <SelectTrigger id="filter" className="w-[180px]">
                                <SelectValue placeholder="Type d'opération" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                <SelectItem value="sales">Ventes</SelectItem>
                                <SelectItem value="purchases">Achats</SelectItem>
                                <SelectItem value="expenses">Dépenses</SelectItem>
                                <SelectItem value="receipts">Encaissements</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable data={filteredTransactions} columns={columns} />
            </CardContent>
       </Card>
      </div>
    </div>
  );
}
