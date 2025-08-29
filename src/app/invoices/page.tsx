
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddSaleDialog } from '@/components/sales/add-sale-dialog';
import Link from 'next/link';
import { useTransactions } from '@/context/transaction-context';
import { DataTable } from '@/components/data-table/data-table';
import type { Invoice } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'id',
        header: 'N° Facture',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('fr-FR'),
    },
    {
        accessorKey: 'clientName',
        header: 'Client',
    },
    {
        accessorKey: 'total',
        header: () => <div className="text-right">Montant Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {new Intl.NumberFormat('fr-FR').format(row.original.total)} F
            </div>
        ),
    },
];

export default function InvoicesPage() {
    const { invoices } = useTransactions();
    const router = useRouter();

    const handleRowClick = (row: any) => {
        router.push(`/invoices/${row.original.id}`);
    }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
        <PageHeader title="Ventes et Facturation" />
        
        <div className="flex gap-4">
            <AddSaleDialog />
            <Link href="/invoices/new">
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle Facture
                </Button>
            </Link>
        </div>


        <Card>
            <CardHeader>
                <CardTitle>Factures Récentes</CardTitle>
                <CardDescription>Liste des dernières factures et ventes au comptant.</CardDescription>
            </CardHeader>
            <CardContent>
               <DataTable
                    columns={columns}
                    data={invoices}
                    filterColumn="clientName"
                    filterPlaceholder="Filtrer par client..."
                />
            </CardContent>
        </Card>
    </div>
  );
}
