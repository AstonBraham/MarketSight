

'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { useMobileMoney } from '@/context/mobile-money-context';
import { AddMobileMoneyTransactionDialog } from '@/components/mobile-money/add-mobile-money-transaction-dialog';

export default function MobileMoneyMixxPage() {
    const { transactions, getBalance } = useMobileMoney();
    const mixxTransactions = transactions.filter(t => t.provider === 'Mixx');
    const mixxBalance = getBalance('Mixx');

     const dailyDeposits = mixxTransactions
        .filter(t => t.type === 'deposit' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const dailyWithdrawals = mixxTransactions
        .filter(t => t.type === 'withdrawal' && new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const dailyCommissions = mixxTransactions
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.commission, 0);


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Mobile Money Mixx" action={<AddMobileMoneyTransactionDialog provider="Mixx"/>}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Mixx</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('de-DE').format(mixxBalance)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+{new Intl.NumberFormat('de-DE').format(dailyDeposits)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-{new Intl.NumberFormat('de-DE').format(dailyWithdrawals)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{new Intl.NumberFormat('de-DE').format(dailyCommissions)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Opérations Mixx</CardTitle>
            <CardDescription>Historique des transactions pour Mixx.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={mixxTransactions} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
