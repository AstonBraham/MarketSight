
'use client';

import { useState, useEffect } from 'react';
import type { InventoryItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/user-context';
import { EditInventoryItemDialog } from './edit-inventory-item-dialog';
import { DeleteInventoryItemDialog } from './delete-inventory-item-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';


function ActionsCell({ row }: { row: any }) {
    const { user } = useUser();
    const [isClient, setIsClient] = useState(false);
    const item = row.original as InventoryItem;

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <EditInventoryItemDialog item={item} />
            <DeleteInventoryItemDialog itemId={item.id} />
        </div>
      );
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'productName',
    header: 'Produit',
    cell: ({ row }) => {
        const item = row.original;
        const { user } = useUser();
        
        if(user?.role !== 'admin') {
            return <span className="font-medium">{item.productName}</span>
        }

        return (
            <Link href={`/inventory/${item.id}`} className="hover:underline font-medium">
                {item.productName}
            </Link>
        )
    }
  },
  {
    accessorKey: 'category',
    header: 'Famille',
  },
  {
    accessorKey: 'inStock',
    header: () => <div className="text-center">En Stock</div>,
    cell: ({ row }) => {
        const inStock = row.original.inStock;
        const reorderLevel = row.original.reorderLevel;
        const isLow = inStock <= reorderLevel;
        return (
            <div className={cn("flex items-center justify-center gap-2", isLow ? 'text-destructive font-bold' : '')}>
                <span>{inStock}</span>
                {isLow && <Badge variant="destructive" className="hidden lg:inline-flex">Bas</Badge>}
            </div>
        )
    }
  },
  {
    accessorKey: 'reorderLevel',
    header: () => <div className="text-center">Niveau Alerte</div>,
    cell: ({ row }) => {
        const reorderLevel = row.original.reorderLevel;
        return <div className="text-center">{reorderLevel}</div>
    }
  },
  {
    accessorKey: 'costPrice',
    header: () => <div className="text-right">Coût Unitaire (CUMP)</div>,
    cell: ({ row }) => {
        const costPrice = row.original.costPrice;
        if (costPrice === undefined || costPrice === null) return null;
        const formatted = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(costPrice);
        return <div className="text-right font-mono">{formatted} F</div>
    }
  },
  {
    id: 'stockValue',
    header: () => <div className="text-right">Valeur Stock</div>,
    cell: ({ row }) => {
        const item = row.original;
        const value = item.inStock * (item.costPrice || 0);
        const formatted = new Intl.NumberFormat('fr-FR').format(value);
        return <div className="text-right font-mono font-semibold">{formatted} F</div>
    }
  },
  {
    accessorKey: 'supplier',
    header: 'Fournisseur',
  },
  {
    id: 'actions',
    cell: ActionsCell,
    header: () => <div className="text-right">Actions</div>,
  },
];
