
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
        <PageHeader title="Ventes et Facturation" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Vente</Button>} />

        <Card>
            <CardHeader>
                <CardTitle>Ventes Récentes</CardTitle>
                <CardDescription>Liste des dernières factures et ventes au comptant.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Le module de facturation est en cours de développement.</p>
            </CardContent>
        </Card>
    </div>
  );
}
