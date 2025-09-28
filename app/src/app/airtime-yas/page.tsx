
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { useAirtime } from '@/context/airtime-context';
import { AddAirtimeTransactionDialog } from '@/components/airtime/add-airtime-transaction-dialog';
import { useMemo, useState, useEffect } from 'react';
import { AdjustBalanceDialog } from '@/components/airtime/adjust-balance-dialog';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTransactions } from '@/context/transaction-context';


export default function AirtimeYasPage() {
    const { transactions, getStock, getProcessedTransactions } = useAirtime();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const yasTransactions = useMemo(() => isClient ? transactions.filter(t => t.provider === 'Yas') : [], [isClient, transactions]);
    const yasStock = useMemo(() => isClient ? getStock('Yas') : 0, [isClient, getStock]);

    const totalPurchases = useMemo(() => {
      if (!isClient) return 0;
      return yasTransactions
        .filter(t => t.type === 'purchase')
        .reduce((acc, t) => acc + t.amount, 0);
    }, [isClient, yasTransactions]);

    const totalSales = useMemo(() => {
      if (!isClient) return 0;
      return yasTransactions
        .filter(t => t.type === 'sale')
        .reduce((acc, t) => acc + t.amount, 0);
    }, [isClient, yasTransactions]);

    const { averageDailySales, remainingDays } = useMemo(() => {
        if (!isClient) return { averageDailySales: 0, remainingDays: Infinity };
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
        const recentSales = yasTransactions.filter(
          (t) => t.type === 'sale' && new Date(t.date) >= thirtyDaysAgo
        );
        const totalRecentSales = recentSales.reduce((acc, t) => acc + t.amount, 0);
        const averageDailySales = totalRecentSales / 30;
        const remainingDays = averageDailySales > 0 ? yasStock / averageDailySales : Infinity;
    
        return { averageDailySales, remainingDays };
    }, [isClient, yasTransactions, yasStock]);

    const totalCommission = useMemo(() => {
      if (!isClient) return 0;
      return totalPurchases * 0.05;
    }, [isClient, totalPurchases]);

    const processedTransactions = useMemo(() => {
        if (!isClient) return [];
        return getProcessedTransactions('Yas');
    }, [isClient, getProcessedTransactions, transactions]);

    const isStockLow = isClient && remainingDays <= 3;
    
  if (!isClient) {
    return null;
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Yas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('fr-FR').format(yasStock)} F</div>
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
                <p className="text-xs text-muted-foreground">À titre indicatif (5% des achats)</p>
            </CardContent>
        </Card>
      </div>

      {isStockLow && (
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerte de Stock Bas</AlertTitle>
              <AlertDescription>
                Votre stock de crédit Yas est bas. Il est recommandé de passer une nouvelle commande auprès de votre fournisseur.
              </AlertDescription>
          </Alert>
      )}

       <Card>
            <CardHeader>
            <CardTitle>Transactions Yas</CardTitle>
            <CardDescription>Historique des transactions pour Yas.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable 
                  data={processedTransactions} 
                  columns={airtimeColumns} 
                  filterColumn="phoneNumber" 
                  filterPlaceholder="Filtrer par numéro..." 
                />
            </CardContent>
        </Card>
    </div>
  );
}
