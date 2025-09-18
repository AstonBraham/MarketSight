
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { columns as airtimeColumns } from '@/components/airtime/columns-airtime';
import { mockAirtimeTransactions } from '@/lib/mock-data';
import { useState, useEffect, useMemo } from 'react';
import type { AirtimeTransaction } from '@/lib/types';

type TransactionFilter = 'all' | 'purchase' | 'sale' | 'commission' | 'adjustment';

export default function AirtimePage() {
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'Moov' | 'Yas'>('all');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const filteredTransactions = useMemo(() => {
    return mockAirtimeTransactions
      .filter(t => providerFilter === 'all' || t.provider === providerFilter)
      .filter(t => filter === 'all' || t.type === filter);
  }, [filter, providerFilter]);


  if (!isClient) {
    return null; // ou un skeleton/loader
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion Airtime" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Transaction</Button>} />

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
                <CardTitle className="text-sm font-medium">Stock Airtime Yas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3,250,000 F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">750,000 F</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marge du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">37,500 F</div>
            </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="all" onValueChange={(value) => setProviderFilter(value as any)}>
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="all">Toutes les transactions</TabsTrigger>
                <TabsTrigger value="Moov">Moov</TabsTrigger>
                <TabsTrigger value="Yas">Yas</TabsTrigger>
            </TabsList>
             <TabsList className="ml-auto">
                <TabsTrigger value="all" onClick={() => setFilter('all')}>Toutes</TabsTrigger>
                <TabsTrigger value="purchase" onClick={() => setFilter('purchase')}>Achats</TabsTrigger>
                <TabsTrigger value="sale" onClick={() => setFilter('sale')}>Ventes</TabsTrigger>
                <TabsTrigger value="commission" onClick={() => setFilter('commission')}>Commissions</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value={providerFilter}>
            <Card>
                <CardHeader>
                <CardTitle>Transactions Airtime</CardTitle>
                <CardDescription>Suivi des achats et ventes de crédit téléphonique.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={filteredTransactions} columns={airtimeColumns} />
                </CardContent>
            </Card>
        </TabsContent>
       </Tabs>
    </div>
  );
}
