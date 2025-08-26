
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { mockMobileMoneyTransactions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function MobileMoneyMixxPage() {
    const mixxTransactions = mockMobileMoneyTransactions.filter(t => t.provider === 'Mixx');

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Mobile Money Mixx" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Opération</Button>}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Mixx</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1,000,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+200,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-50,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">5,000 F</div>
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
