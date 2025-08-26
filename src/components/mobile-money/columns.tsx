
'use client';

import type { MobileMoneyTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<MobileMoneyTransaction>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleString('fr-FR')}</span>
    }
  },
   {
    accessorKey: 'transactionId',
    header: 'ID Transaction',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        if (type === 'deposit') {
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><ArrowDown className="mr-1 h-3 w-3" /> Dépôt</Badge>
        }
        if (type === 'withdrawal') {
            return <Badge variant="destructive"><ArrowUp className="mr-1 h-3 w-3" /> Retrait</Badge>
        }
        return <Badge variant="secondary">Transfert</Badge>
    }
  },
  {
    accessorKey: 'provider',
    header: 'Opérateur',
    cell: ({ row }) => {
        const provider = row.getValue('provider') as string;
        const isFlooz = provider === 'Flooz';
        return <Badge variant="outline" className={cn(isFlooz ? "border-blue-500 text-blue-600" : "border-yellow-500 text-yellow-600")}>{provider}</Badge>
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
];
