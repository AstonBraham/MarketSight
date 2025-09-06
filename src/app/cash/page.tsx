
'use client';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/cash/columns';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { useTransactions } from '@/context/transaction-context';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { AdjustCashBalanceDialog } from '@/components/cash/adjust-cash-balance-dialog';
import { AddCashEntryDialog } from '@/components/cash/add-cash-entry-dialog';

export default function CashPage() {
  const { getAllTransactions } = useTransactions();
  const allTransactions = getAllTransactions();
  
  const processedTransactions = useMemo(() => {
    let balance = 0;
    const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const withBalance: Transaction[] = sorted.map(t => {
      if (t.type === 'sale') {
        balance += t.amount;
      } else if (t.type === 'purchase' || t.type === 'expense') {
        balance -= t.amount;
      } else if (t.type === 'adjustment') {
        balance += t.amount;
      }
      return { ...t, balance };
    });

    return withBalance.reverse();
  }, [allTransactions]);

  const currentBalance = processedTransactions.length > 0 ? processedTransactions[0].balance : 0;
  
  const today = new Date().toDateString();
  const dailyIncome = allTransactions
    .filter(t => (t.type === 'sale' || (t.type === 'adjustment' && t.amount > 0)) && new Date(t.date).toDateString() === today)
    .reduce((acc, t) => acc + t.amount, 0);

  const dailyOutcome = allTransactions
    .filter(t => (t.type === 'purchase' || t.type === 'expense' || (t.type === 'adjustment' && t.amount < 0)) && new Date(t.date).toDateString() === today)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const netFlow = dailyIncome - dailyOutcome;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion de la Trésorerie" 
        action={
            <div className="flex items-center gap-2">
                <AddCashEntryDialog />
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
                 <p className="text-xs text-muted-foreground">Total des ventes</p>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Détail des Mouvements</CardTitle>
                <CardDescription>Liste de toutes les transactions de caisse.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={processedTransactions} columns={columns} />
            </CardContent>
       </Card>
      </div>
    </div>
  );
}
