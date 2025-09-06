
'use client';

import type { Sale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


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
            <div className="text-right font-bold text-green-600">
                +{new Intl.NumberFormat('fr-FR').format(row.original.amount)} F
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
    },
    {
        id: 'affectsCash',
        header: () => <div className="text-center">Impact Caisse</div>,
        cell: ({ row }) => {
        return (
            <div className="flex justify-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Cette opération a affecté la trésorerie.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
        }
    },
];
