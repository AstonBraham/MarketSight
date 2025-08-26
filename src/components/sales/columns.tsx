
'use client';

import type { Sale } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleDateString('fr-FR')}</span>
    }
  },
  {
    accessorKey: 'product',
    header: 'Désignation',
  },
  {
    accessorKey: 'client',
    header: 'Client',
  },
  {
    accessorKey: 'reference',
    header: 'Référence article',
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Prix</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('fr-FR').format(price);
      return <div className="text-right font-mono">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Quantité</div>,
    cell: ({ row }) => {
      const quantity = parseInt(row.getValue('quantity'));
      return <div className="text-right font-mono">{quantity}</div>;
    }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        currencyDisplay: 'code'
      }).format(amount).replace('XOF', 'F');

      return <div className="text-right font-mono text-green-600">{formatted}</div>;
    },
  },
    {
    accessorKey: 'itemType',
    header: 'Type d\'article',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
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
            <DropdownMenuItem>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem>Modifier</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
