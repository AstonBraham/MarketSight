
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { mockMobileMoneyTransactions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function MobileMoneyFloozPage() {
    const floozTransactions = mockMobileMoneyTransactions.filter(t => t.provider === 'Flooz');
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Mobile Money Flooz" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Opération</Button>}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Flooz</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">850,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+150,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-70,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">7,500 F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Opérations Flooz</CardTitle>
            <CardDescription>Historique des transactions pour Flooz.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={floozTransactions} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
