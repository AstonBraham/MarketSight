
'use client';

import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ShoppingCart, Truck, Banknote } from 'lucide-react';

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleDateString('fr-FR')}</span>
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        if (type === 'sale') return <Badge variant='default' className="bg-green-100 text-green-700 hover:bg-green-200"><ShoppingCart className="mr-1 h-3 w-3" />Vente</Badge>;
        if (type === 'purchase') return <Badge variant='destructive'><Truck className="mr-1 h-3 w-3" />Achat</Badge>;
        if (type === 'expense') return <Badge variant='secondary'><Banknote className="mr-1 h-3 w-3" />Dépense</Badge>;
        return <span>{type}</span>
    }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const type = row.original.type;
      const formatted = new Intl.NumberFormat('de-DE').format(amount);

      const isCredit = type === 'sale';
      const isDebit = type === 'purchase' || type === 'expense';

      return <div className={`text-right font-mono ${isCredit ? 'text-green-600' : ''} ${isDebit ? 'text-red-600' : ''}`}>{isDebit ? '-' : ''}{formatted} F</div>;
    },
  },
];
