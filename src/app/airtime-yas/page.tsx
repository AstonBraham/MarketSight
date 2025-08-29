

'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { useAirtime } from '@/context/airtime-context';
import { AddAirtimeTransactionDialog } from '@/components/airtime/add-airtime-transaction-dialog';
import { useMemo } from 'react';
import { AdjustBalanceDialog } from '@/components/airtime/adjust-balance-dialog';


export default function AirtimeYasPage() {
    const { transactions, getStock } = useAirtime();
    const yasTransactions = transactions.filter(t => t.provider === 'Yas');
    const yasStock = getStock('Yas');

    const dailySales = yasTransactions
      .filter(t => t.type === 'sale' && new Date(t.date).toDateString() === new Date().toDateString())
      .reduce((acc, t) => acc + t.amount, 0);

    const dailyMargin = yasTransactions
      .filter(t => t.type === 'sale' && new Date(t.date).toDateString() === new Date().toDateString())
      .reduce((acc, t) => acc + t.commission, 0);

    const processedTransactions = useMemo(() => {
        let balance = 0;
        const sorted = [...yasTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const withBalance = sorted.map(t => {
            if (t.type === 'purchase' || t.type === 'adjustment') {
                balance += t.amount;
            } else if (t.type === 'sale') {
                balance -= t.amount;
            }
            return { ...t, balance };
        });

        return withBalance.reverse();
    }, [yasTransactions]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion Airtime Yas" 
        action={
            <div className="flex items-center gap-2">
                <AdjustBalanceDialog provider="Yas" currentBalance={yasStock} />
                <AddAirtimeTransactionDialog provider="Yas" />
            </div>
        } 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Yas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(yasStock)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(dailySales)} F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(dailyMargin)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
            <CardTitle>Transactions Yas</CardTitle>
            <CardDescription>Historique des transactions pour Yas.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={processedTransactions} columns={airtimeColumns} />
            </CardContent>
        </Card>
    </div>
  );
}
