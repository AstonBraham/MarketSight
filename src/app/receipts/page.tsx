
'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/receipts/columns';
import { AddCashEntryDialog } from '@/components/cash/add-cash-entry-dialog';
import { useTransactions } from '@/context/transaction-context';
import { Download } from 'lucide-react';

export default function ReceiptsPage() {
  const { receipts } = useTransactions();
  
  const totalReceipts = useMemo(() => {
    return receipts.reduce((acc, receipt) => acc + receipt.amount, 0);
  }, [receipts]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Encaissements" action={<AddCashEntryDialog />} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Encaissements</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalReceipts)} F</div>
            <p className="text-xs text-muted-foreground">
              Montant total de tous les encaissements enregistrés.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des encaissements</CardTitle>
           <CardDescription>
            Voici la liste détaillée de tous vos encaissements (hors ventes).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={receipts} columns={columns} filterColumn="description" filterPlaceholder="Filtrer par description..." />
        </CardContent>
      </Card>
    </div>
  );
}
