
'use client';

import type { MobileMoneyTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, Repeat, ShoppingCart, Send, Undo2, HandCoins } from 'lucide-react';
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
        switch (type) {
            case 'deposit':
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><ArrowDown className="mr-1 h-3 w-3" /> Dépôt</Badge>
            case 'withdrawal':
                return <Badge variant="destructive"><ArrowUp className="mr-1 h-3 w-3" /> Retrait</Badge>
            case 'transfer':
                 return <Badge variant="secondary"><Repeat className="mr-1 h-3 w-3" /> Transfert</Badge>
            case 'purchase':
                return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700"><ShoppingCart className="mr-1 h-3 w-3" /> Achat virtuel</Badge>
            case 'pos_transfer':
                return <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600"><Send className="mr-1 h-3 w-3" /> Transfert PDV</Badge>
            case 'virtual_return':
                 return <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600"><Undo2 className="mr-1 h-3 w-3" /> Retour virtuel</Badge>
            case 'collect_commission':
                 return <Badge variant="secondary" className="bg-teal-500 hover:bg-teal-600"><HandCoins className="mr-1 h-3 w-3" /> Collecte Commission</Badge>
            default:
                return <Badge variant="secondary">{type}</Badge>
        }
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
      const formatted = new Intl.NumberFormat('fr-FR').format(amount);

      return <div className="text-right font-mono">{formatted} F</div>;
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
];
