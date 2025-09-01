
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { useAirtime } from '@/context/airtime-context';
import { AddAirtimeTransactionDialog } from '@/components/airtime/add-airtime-transaction-dialog';
import { useMemo, useState, useEffect } from 'react';
import { AdjustBalanceDialog } from '@/components/airtime/adjust-balance-dialog';


export default function AirtimeYasPage() {
    const { transactions, getStock } = useAirtime();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const yasTransactions = useMemo(() => transactions.filter(t => t.provider === 'Yas'), [transactions]);
    const yasStock = useMemo(() => getStock('Yas'), [getStock, transactions]);

    const totalPurchases = useMemo(() => {
      return yasTransactions
        .filter(t => t.type === 'purchase')
        .reduce((acc, t) => acc + t.amount, 0);
    }, [yasTransactions]);

    const totalSales = useMemo(() => {
      return yasTransactions
        .filter(t => t.type === 'sale')
        .reduce((acc, t) => acc + t.amount, 0);
    }, [yasTransactions]);

    const totalCommission = useMemo(() => {
      return totalPurchases * 0.05;
    }, [totalPurchases]);

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
    
  if (!isClient) {
    return null; // ou un skeleton/loader
  }

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
                <CardTitle className="text-sm font-medium">Achats (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(totalPurchases)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(totalSales)} F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge/Commission (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(totalCommission)} F</div>
                <p className="text-xs text-muted-foreground">Basé sur 5% des achats</p>
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
