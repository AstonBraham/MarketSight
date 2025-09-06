
'use client';

import type { AirtimeTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUp, ArrowDown, SlidersHorizontal, Trash2, CheckCircle, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DeleteTransactionDialog } from '../delete-transaction-dialog';
import { useAirtime } from '@/context/airtime-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


function ActionsCell({ row }: { row: { original: AirtimeTransaction }}) {
    const { removeTransaction } = useAirtime();
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
          <DropdownMenuItem disabled>
            Voir les détails
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteTransactionDialog 
            transactionId={transaction.id} 
            onDelete={() => removeTransaction(transaction.id)} 
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
}

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
        if (type === 'adjustment') {
            return <Badge variant="outline" className="border-orange-500 text-orange-600"><SlidersHorizontal className="mr-1 h-3 w-3"/>Ajustement</Badge>
        }
        if (type === 'commission') {
            return <Badge variant="default" className="bg-teal-500 hover:bg-teal-600"><HandCoins className="mr-1 h-3 w-3" /> Commission</Badge>
        }
        return <Badge variant="default">Vente</Badge>
    }
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Numéro / Description',
    cell: ({row}) => {
        const transaction = row.original;
        return <span>{transaction.phoneNumber || transaction.description}</span>
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
      const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(amount));
      const isCredit = row.original.type === 'purchase' || (row.original.type === 'adjustment' && amount > 0);
      const isDebit = row.original.type === 'sale' || (row.original.type === 'adjustment' && amount < 0);

      const sign = isCredit ? '+' : '-';
      
      let colorClass = '';
      if(isCredit) colorClass = 'text-green-600';
      if(isDebit) colorClass = 'text-red-600';
      if(row.original.type === 'adjustment') colorClass = 'text-orange-600';
      if(row.original.type === 'commission') return null;


      return <div className={cn("text-right font-mono", colorClass)}>{sign}{formatted} F</div>;
    },
  },
  {
    accessorKey: 'commission',
    header: () => <div className="text-right">Commission</div>,
    cell: ({ row }) => {
      const commission = row.original.commission;
      if (!commission) return null;
      const formatted = new Intl.NumberFormat('fr-FR').format(commission);

      return <div className="text-right font-mono text-green-600">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'balance',
    header: () => <div className="text-right">Solde</div>,
    cell: ({ row }) => {
      const balance = row.original.balance;
      if (balance === undefined) return null;
      const formatted = new Intl.NumberFormat('fr-FR').format(balance);
      return <div className="text-right font-mono font-semibold">{formatted} F</div>;
    },
  },
  {
    id: 'affectsCash',
    header: () => <div className="text-center">Impact Caisse</div>,
    cell: ({ row }) => {
      const type = row.original.type;
      if (type !== 'sale' && type !== 'purchase' && type !== 'commission') return null;

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
