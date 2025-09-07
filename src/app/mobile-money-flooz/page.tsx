
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { useMobileMoney } from '@/context/mobile-money-context';
import { AddMobileMoneyTransactionDialog } from '@/components/mobile-money/add-mobile-money-transaction-dialog';
import { AdjustMobileMoneyBalanceDialog } from '@/components/mobile-money/adjust-mobile-money-balance-dialog';
import { useMemo, useState, useEffect } from 'react';

export default function MobileMoneyFloozPage() {
    const { transactions, getBalance, getProcessedTransactions } = useMobileMoney();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const floozTransactions = transactions.filter(t => t.provider === 'Flooz');
    const floozBalance = getBalance('Flooz');

    const dailyDeposits = floozTransactions
        .filter(t => t.type === 'deposit' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const dailyWithdrawals = floozTransactions
        .filter(t => t.type === 'withdrawal' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const dailyCommissions = floozTransactions
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.commission, 0);

    const processedTransactions = useMemo(() => {
        return getProcessedTransactions('Flooz');
    }, [getProcessedTransactions, floozTransactions]);

  if (!isClient) {
    return null; 
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion Mobile Money Flooz" 
        action={
            <div className="flex items-center gap-2">
                <AdjustMobileMoneyBalanceDialog provider="Flooz" currentBalance={floozBalance} />
                <AddMobileMoneyTransactionDialog provider="Flooz" />
            </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Flooz</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(floozBalance)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+{new Intl.NumberFormat('fr-FR').format(dailyDeposits)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-{new Intl.NumberFormat('fr-FR').format(dailyWithdrawals)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(dailyCommissions)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Opérations Flooz</CardTitle>
            <CardDescription>Historique des transactions pour Flooz.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable 
              data={processedTransactions} 
              columns={columns} 
              filterColumn="phoneNumber" 
              filterPlaceholder="Filtrer par numéro..."
            />
        </CardContent>
      </Card>
    </div>
  );
}
