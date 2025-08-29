
'use client';

import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ShoppingCart, Truck, Banknote, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        if (type === 'adjustment') return <Badge variant="outline" className="border-orange-500 text-orange-600"><SlidersHorizontal className="mr-1 h-3 w-3"/>Ajustement</Badge>
        return <span>{type}</span>
    }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const type = row.original.type;
      const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(amount));

      const isCredit = type === 'sale' || (type === 'adjustment' && amount > 0);
      const isDebit = type === 'purchase' || type === 'expense' || (type === 'adjustment' && amount < 0);
      
      let colorClass = '';
      if(isCredit) colorClass = 'text-green-600';
      if(isDebit) colorClass = 'text-red-600';
      if(row.original.type === 'adjustment') colorClass = 'text-orange-600';

      const sign = amount >= 0 ? '+' : '-';

      return <div className={cn("text-right font-mono", colorClass)}>{sign}{formatted} F</div>;
    },
  },
  {
    accessorKey: 'balance',
    header: () => <div className="text-right">Solde Caisse</div>,
    cell: ({ row }) => {
      const balance = row.original.balance;
      if (balance === undefined) return null;
      const formatted = new Intl.NumberFormat('fr-FR').format(balance);
      return <div className="text-right font-mono font-semibold">{formatted} F</div>;
    },
  },
];
