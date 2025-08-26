
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { mockAirtimeTransactions } from '@/lib/mock-data';

export default function AirtimeYasPage() {
    const yasTransactions = mockAirtimeTransactions.filter(t => t.provider === 'Yas');

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Airtime Yas" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Transaction</Button>} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Airtime Yas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3,250,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">300,000 F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-yellow-600">15,000 F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
            <CardTitle>Transactions Yas</CardTitle>
            <CardDescription>Historique des transactions pour Yas.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={yasTransactions} columns={airtimeColumns} />
            </CardContent>
        </Card>
    </div>
  );
}
