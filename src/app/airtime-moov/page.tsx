
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { useAirtime } from '@/context/airtime-context';
import { AddAirtimeTransactionDialog } from '@/components/airtime/add-airtime-transaction-dialog';
import type { AirtimeTransaction } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { AdjustBalanceDialog } from '@/components/airtime/adjust-balance-dialog';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AirtimeMoovPage() {
  const { transactions, getStock, getProcessedTransactions } = useAirtime();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const moovTransactions = useMemo(() => transactions.filter(t => t.provider === 'Moov'), [transactions]);
  const moovStock = useMemo(() => getStock('Moov'), [getStock, transactions]);
  
  const totalPurchases = useMemo(() => {
    return moovTransactions
      .filter(t => t.type === 'purchase')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [moovTransactions]);
  
  const totalSales = useMemo(() => {
    return moovTransactions
      .filter(t => t.type === 'sale')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [moovTransactions]);
  
  const { averageDailySales, remainingDays } = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = moovTransactions.filter(
      (t) => t.type === 'sale' && new Date(t.date) >= thirtyDaysAgo
    );
    const totalRecentSales = recentSales.reduce((acc, t) => acc + t.amount, 0);
    const averageDailySales = totalRecentSales / 30;
    const remainingDays = averageDailySales > 0 ? moovStock / averageDailySales : Infinity;

    return { averageDailySales, remainingDays };
  }, [moovTransactions, moovStock]);

  const totalCommission = useMemo(() => {
    return totalPurchases * 0.05;
  }, [totalPurchases]);

  const processedTransactions = useMemo(() => {
    return getProcessedTransactions('Moov');
  }, [getProcessedTransactions, moovTransactions]);

  const isStockLow = remainingDays <= 7;


  if (!isClient) {
    return null; // ou un skeleton/loader
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion Airtime Moov" 
        action={
            <div className="flex items-center gap-2">
                <AdjustBalanceDialog provider="Moov" currentBalance={moovStock} />
                <AddAirtimeTransactionDialog provider="Moov" />
            </div>
        } 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Moov</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(moovStock)} F</div>
            </CardContent>
        </Card>
        <Card className={cn(isStockLow && 'border-destructive')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jours de stock restants</CardTitle>
            <AlertTriangle className={cn("h-4 w-4 text-muted-foreground", isStockLow && "text-destructive")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", isStockLow && "text-destructive")}>
              {isFinite(remainingDays) ? `${Math.floor(remainingDays)} jour(s)` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Basé sur les ventes des 30 derniers jours.</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achats (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(totalPurchases)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(totalSales)} F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge/Commission (Total)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(totalCommission)} F</div>
                 <p className="text-xs text-muted-foreground">À titre indicatif (5% des achats)</p>
            </CardContent>
        </Card>
      </div>
      
      {isStockLow && (
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerte de Stock Bas</AlertTitle>
              <AlertDescription>
                Votre stock de crédit Moov est bas. Il est recommandé de passer une nouvelle commande auprès de votre fournisseur.
              </AlertDescription>
          </Alert>
      )}

       <Card>
            <CardHeader>
            <CardTitle>Transactions Moov</CardTitle>
            <CardDescription>Historique des transactions pour Moov.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={processedTransactions} columns={airtimeColumns} />
            </CardContent>
        </Card>
    </div>
  );
}
