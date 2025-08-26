
'use client';

import type { AirtimeTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<AirtimeTransaction>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleString('fr-FR')}</span>
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        if (type === 'purchase') {
            return <Badge variant="secondary">Achat</Badge>
        }
        return <Badge variant="default">Vente</Badge>
    }
  },
  {
    accessorKey: 'provider',
    header: 'Fournisseur',
     cell: ({ row }) => {
        const provider = row.getValue('provider') as string;
        const isMoov = provider === 'Moov';
        return <Badge variant="outline" className={cn(isMoov ? "border-blue-500 text-blue-600" : "border-yellow-500 text-yellow-600")}>{provider}</Badge>
    }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('de-DE').format(amount);

      return <div className="text-right font-mono">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'commission',
    header: () => <div className="text-right">Commission</div>,
    cell: ({ row }) => {
      const commission = row.original.commission;
      if (!commission) return null;
      const formatted = new Intl.NumberFormat('de-DE').format(commission);

      return <div className="text-right font-mono text-green-600">{formatted} F</div>;
    },
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
