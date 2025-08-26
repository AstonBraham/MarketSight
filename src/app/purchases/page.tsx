

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/purchases/columns';
import { AddPurchaseDialog } from '@/components/purchases/add-purchase-dialog';
import { useTransactions } from '@/context/transaction-context';

export default function PurchasesPage() {
  const { purchases } = useTransactions();
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion des Achats" action={<AddPurchaseDialog />} />
       <Card>
        <CardHeader>
            <CardTitle>Achats Récents</CardTitle>
            <CardDescription>Liste des dernières commandes fournisseurs.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable data={purchases} columns={columns} />
        </CardContent>
       </Card>
    </div>
  );
}

