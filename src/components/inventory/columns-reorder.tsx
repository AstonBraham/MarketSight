
'use client';

import type { InventoryItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ReorderItem extends InventoryItem {
    quantityToOrder: number;
}

export const columns: ColumnDef<ReorderItem>[] = [
  {
    accessorKey: 'productName',
    header: 'Produit',
    cell: ({ row }) => {
        const item = row.original;
        return (
            <Link href={`/inventory/${item.id}`} className="hover:underline font-medium">
                {item.productName}
            </Link>
        )
    }
  },
   {
    accessorKey: 'supplier',
    header: 'Fournisseur',
    cell: ({ row }) => row.original.supplier || 'N/A'
  },
  {
    accessorKey: 'inStock',
    header: () => <div className="text-center">Stock Actuel</div>,
    cell: ({ row }) => {
        const inStock = row.original.inStock;
        return <div className="text-center font-bold text-destructive">{inStock}</div>
    }
  },
  {
    accessorKey: 'reorderLevel',
    header: () => <div className="text-center">Niveau d'Alerte</div>,
    cell: ({ row }) => {
        const reorderLevel = row.original.reorderLevel;
        return <div className="text-center">{reorderLevel}</div>
    }
  },
  {
    accessorKey: 'quantityToOrder',
    header: () => <div className="text-center">Qté à Commander</div>,
    cell: ({ row }) => {
        const quantityToOrder = row.original.quantityToOrder;
        return <div className="text-center font-bold text-blue-600">{quantityToOrder}</div>
    }
  },
];
