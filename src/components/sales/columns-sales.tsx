
'use client';

import type { Sale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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


export const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleString('fr-FR'),
    },
    {
        accessorKey: 'product',
        header: 'Produit',
    },
    {
        accessorKey: 'quantity',
        header: () => <div className="text-right">Qté</div>,
        cell: ({ row }) => <div className="text-right">{row.original.quantity}</div>,
    },
    {
        accessorKey: 'price',
        header: () => <div className="text-right">Prix Unitaire</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {new Intl.NumberFormat('fr-FR').format(row.original.price || 0)} F
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: () => <div className="text-right">Montant Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-bold">
                {new Intl.NumberFormat('fr-FR').format(row.original.amount)} F
            </div>
        ),
    },
    {
        accessorKey: 'client',
        header: 'Client',
    },
    {
        accessorKey: 'itemType',
        header: 'Famille',
        cell: ({row}) => <Badge variant="outline">{row.original.itemType}</Badge>
    }
];
