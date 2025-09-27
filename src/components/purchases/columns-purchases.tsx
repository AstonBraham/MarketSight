
'use client';

import type { Purchase } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { EditPurchaseDialog } from './edit-purchase-dialog';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';


function ActionsCell({ row }: { row: { original: Purchase }}) {
    const purchase = row.original;
    const { user } = useUser();
    
    if (user?.role !== 'admin') {
      return null;
    }

    return (
        <EditPurchaseDialog purchase={purchase} />
    );
}

export const columns: ColumnDef<Purchase>[] = [
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
    accessorKey: 'supplier',
    header: 'Fournisseur',
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Qté</div>,
    cell: ({ row }) => <div className="text-right font-mono">{row.original.quantity}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('fr-FR').format(amount);
      return <div className="text-right font-mono font-semibold">{formatted} F</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
        const status = row.original.status;
        const isPaid = status === 'paid';
        return (
            <Badge variant={isPaid ? "default" : "secondary"} className={cn(isPaid && 'bg-green-600')}>
                {isPaid ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                {isPaid ? 'Payé' : 'Non Payé'}
            </Badge>
        )
    }
  },
  {
    id: 'actions',
    cell: ActionsCell,
  },
];
