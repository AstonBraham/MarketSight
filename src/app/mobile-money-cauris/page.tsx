
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { useMobileMoney } from '@/context/mobile-money-context';
import { AddMobileMoneyTransactionDialog } from '@/components/mobile-money/add-mobile-money-transaction-dialog';
import { AdjustMobileMoneyBalanceDialog } from '@/components/mobile-money/adjust-mobile-money-balance-dialog';
import { useMemo, useState, useEffect } from 'react';

export default function MobileMoneyCaurisPage() {
    const { transactions, getBalance } = useMobileMoney();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const caurisTransactions = transactions.filter(t => t.provider === 'Cauris');
    const caurisBalance = getBalance('Cauris');

     const dailyDeposits = caurisTransactions
        .filter(t => t.type === 'deposit' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const dailyWithdrawals = caurisTransactions
        .filter(t => t.type === 'withdrawal' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.commission, 0);

    const dailyCommissions = caurisTransactions
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.commission, 0);
    
    const processedTransactions = useMemo(() => {
        let balance = 0;
        const sorted = [...caurisTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const withBalance = sorted.map(t => {
            if (t.type === 'deposit' || t.type === 'purchase' || t.type === 'collect_commission' || t.type === 'adjustment') {
                balance += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'virtual_return' || t.type === 'pos_transfer' || t.type === 'transfer') {
                balance -= t.amount;
            }
            return { ...t, balance };
        });

        return withBalance.reverse();
    }, [caurisTransactions]);

  if (!isClient) {
    return null; // ou un skeleton/loader
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion Mobile Money Cauris" 
        action={
            <div className="flex items-center gap-2">
                <AdjustMobileMoneyBalanceDialog provider="Cauris" currentBalance={caurisBalance} />
                <AddMobileMoneyTransactionDialog provider="Cauris"/>
            </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Cauris</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('fr-FR').format(caurisBalance)} F</div>
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
                <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('fr-FR').format(dailyCommissions)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Opérations Cauris</CardTitle>
            <CardDescription>Historique des transactions pour Cauris.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={processedTransactions} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
