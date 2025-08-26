

'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { useAirtime } from '@/context/airtime-context';
import { AddAirtimeTransactionDialog } from '@/components/airtime/add-airtime-transaction-dialog';

export default function AirtimeMoovPage() {
  const { transactions, getStock } = useAirtime();
  const moovTransactions = transactions.filter(t => t.provider === 'Moov');
  const moovStock = getStock('Moov');

  const dailySales = moovTransactions
    .filter(t => t.type === 'sale' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + t.amount, 0);
  
  const dailyMargin = moovTransactions
    .filter(t => t.type === 'sale' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + t.commission, 0);


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Airtime Moov" action={<AddAirtimeTransactionDialog provider="Moov" />} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Moov</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(moovStock)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(dailySales)} F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(dailyMargin)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
            <CardTitle>Transactions Moov</CardTitle>
            <CardDescription>Historique des transactions pour Moov.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={moovTransactions} columns={airtimeColumns} />
            </CardContent>
        </Card>
    </div>
  );
}
