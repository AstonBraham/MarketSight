
'use client';

import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteTransactionDialog } from '../delete-transaction-dialog';
import { useTransactions } from '@/context/transaction-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// Note: This needs a way to delete adjustments, which is not implemented yet in the context.
// For now, delete is disabled.
function ActionsCell({ row }: { row: { original: Transaction }}) {
    // const { removeAdjustment } = useTransactions();
    const transaction = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copier l'ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Modifier</DropdownMenuItem>
            <DropdownMenuItem disabled className="text-destructive">
                 <Trash2 className="mr-2 h-4 w-4" />
                 Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className="font-medium">{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('fr-FR').format(amount);

      return <div className="text-right font-mono text-green-600">+{formatted} F</div>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleDateString('fr-FR')}</span>
    }
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
  {
    id: 'actions',
    cell: ActionsCell,
  },
];
