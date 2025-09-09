

'use client';

import type { Expense } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, CheckCircle, Edit, Lock } from 'lucide-react';
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
import { EditExpenseDialog } from './edit-expense-dialog';
import { useUser } from '@/context/user-context';


function ActionsCell({ row }: { row: { original: Expense }}) {
    const { removeExpense, getLastClosingDate } = useTransactions();
    const expense = row.original;
    const { user } = useUser();
    const lastClosingDate = getLastClosingDate();
    
    const isLocked = lastClosingDate && new Date(expense.date) <= lastClosingDate;
    const canEdit = user?.role === 'admin' || (user?.role === 'user' && !isLocked);

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
            {canEdit ? (
                <>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(expense.id)}>
                        Copier l'ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <EditExpenseDialog expense={expense} />
                    <DeleteTransactionDialog 
                        transactionId={expense.id}
                        onDelete={() => removeExpense(expense.id)}
                    />
                </>
            ) : (
                <DropdownMenuItem disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Verrouillé
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
}

export const columns: ColumnDef<Expense>[] = [
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

      return <div className="text-right font-mono text-destructive">-{formatted} F</div>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => {
        const category = row.getValue('category') as string;
        if (!category) return null;
        return <Badge variant="secondary">{category}</Badge>
    }
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
