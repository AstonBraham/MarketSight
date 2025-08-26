'use client';

import type { StockMovement } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, Settings2 } from 'lucide-react';

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
    accessorKey: 'productId',
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
        const type = row.original.type;
        const quantity = row.original.quantity;
        const sign = type === 'out' || quantity < 0 ? '-' : '+';
        const color = type === 'out' || quantity < 0 ? 'text-destructive' : 'text-green-600';

        return <div className={`font-medium ${color}`}>{sign} {Math.abs(quantity)}</div>
    }
  },
  {
    accessorKey: 'reason',
    header: 'Raison',
  },
];
