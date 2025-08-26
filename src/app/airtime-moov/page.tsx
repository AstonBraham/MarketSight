
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { mockAirtimeTransactions } from '@/lib/mock-data';

export default function AirtimeMoovPage() {
  const moovTransactions = mockAirtimeTransactions.filter(t => t.provider === 'Moov');

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Airtime Moov" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Transaction</Button>} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Moov</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">5,500,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">450,000 F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">22,500 F</div>
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
