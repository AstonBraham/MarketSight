
'use client';

import type { CashClosing } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<CashClosing>[] = [
  {
    accessorKey: 'date',
    header: 'Date de clôture',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleString('fr-FR')}</span>
    }
  },
  {
    accessorKey: 'theoreticalBalance',
    header: () => <div className="text-right">Solde Théorique</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('theoreticalBalance'));
      const formatted = new Intl.NumberFormat('fr-FR').format(amount);
      return <div className="text-right font-mono">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'realBalance',
    header: () => <div className="text-right">Solde Réel</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('realBalance'));
      const formatted = new Intl.NumberFormat('fr-FR').format(amount);
      return <div className="text-right font-mono">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'variance',
    header: () => <div className="text-right">Écart</div>,
    cell: ({ row }) => {
      const variance = parseFloat(row.getValue('variance'));
      const formatted = new Intl.NumberFormat('fr-FR').format(variance);
      
      const colorClass = variance > 0 ? 'text-green-600' : variance < 0 ? 'text-destructive' : '';
      const sign = variance > 0 ? '+' : '';

      return <div className={cn("text-right font-mono font-bold", colorClass)}>{sign}{formatted} F</div>;
    },
  },
  {
    accessorKey: 'closedBy',
    header: 'Fermé par',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('closedBy')}</Badge>
  },
    {
    accessorKey: 'notes',
    header: 'Notes',
  },
];
