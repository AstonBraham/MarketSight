
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { mockMobileMoneyTransactions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function MobileMoneyPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Mobile Money" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Opération</Button>}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Total</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1,850,000 F</div>
                <p className="text-xs text-muted-foreground">Tous comptes confondus</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+350,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-120,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12,500 F</div>
                <p className="text-xs text-muted-foreground">Gains de la journée</p>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Opérations Mobile Money</CardTitle>
            <CardDescription>Liste des dépôts, retraits et transferts.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={mockMobileMoneyTransactions} columns={columns} />
        </CardContent>
       </Card>
    </div>
  );
}
