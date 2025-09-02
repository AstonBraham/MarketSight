
'use client';

import type { Invoice } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

function ActionsCell({ row }: { row: { original: Invoice }}) {
    const router = useRouter();
    const invoice = row.original;

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
              Voir la facture
            </DropdownMenuItem>
             <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.id)}
            >
              Copier l'ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-destructive">Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
}

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'id',
        header: 'N° Facture',
        cell: ({ row }) => {
            const router = useRouter();
            return (
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/invoices/${row.original.id}`)}>
                    {row.original.id}
                </Button>
            )
        }
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
     {
        id: 'actions',
        cell: ActionsCell,
    },
];
