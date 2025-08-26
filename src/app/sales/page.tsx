
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/sales/columns';
import { mockSales } from '@/lib/mock-data';

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion des Ventes" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Vente</Button>} />
       <Card>
        <CardHeader>
            <CardTitle>Ventes Récentes</CardTitle>
            <CardDescription>Liste des dernières transactions de vente.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={mockSales} columns={columns} />
        </CardContent>
       </Card>
    </div>
  );
}
