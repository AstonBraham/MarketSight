
'use client';

import type { StockMovement } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const columns: ColumnDef<StockMovement>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleString('fr-FR')}</span>
    }
  },
  {
    accessorKey: 'productName',
    header: 'Produit',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        
        if (type === 'in') {
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><ArrowUp className="mr-1 h-3 w-3" /> Entrée</Badge>
        }
        if (type === 'out') {
            return <Badge variant="destructive"><ArrowDown className="mr-1 h-3 w-3" /> Sortie</Badge>
        }
        return <Badge variant="secondary"><Settings2 className="mr-1 h-3 w-3" /> Ajustement</Badge>
    }
  },
  {
    accessorKey: 'quantity',
    header: 'Quantité',
    cell: ({ row }) => {
        const quantity = row.original.quantity;
        const sign = quantity > 0 ? '+' : '';
        const color = quantity > 0 ? 'text-green-600' : 'text-destructive';

        return <div className={`font-medium font-mono ${color}`}>{sign} {Math.abs(quantity)}</div>
    }
  },
   {
    accessorKey: 'balanceAfter',
    header: 'Solde',
    cell: ({ row }) => <span className="font-mono font-semibold">{row.getValue('balanceAfter')}</span>
  },
  {
    accessorKey: 'reason',
    header: 'Raison',
     cell: ({ row }) => {
        const movement = row.original;
        if (movement.relatedTransactionId && movement.reason.startsWith('Vente sur Facture')) {
            return (
                <Link href={`/invoices/${movement.relatedTransactionId}`} className="hover:underline text-blue-600">
                    {movement.reason}
                </Link>
            );
        }
        return movement.reason;
    }
  },
];
