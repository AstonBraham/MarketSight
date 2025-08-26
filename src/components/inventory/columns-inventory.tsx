
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
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'reference',
    header: 'Référence',
  },
  {
    accessorKey: 'category',
    header: 'Famille',
  },
    {
    accessorKey: 'brand',
    header: 'Marque',
  },
  {
    accessorKey: 'inStock',
    header: 'En Stock',
    cell: ({ row }) => {
        const inStock = row.original.inStock;
        const reorderLevel = row.original.reorderLevel;
        const isLow = inStock <= reorderLevel;
        return (
            <div className="flex items-center gap-2">
                <span className={isLow ? 'text-destructive font-bold' : ''}>{inStock}</span>
                {isLow && <Badge variant="destructive">Bas</Badge>}
            </div>
        )
    }
  },
  {
    accessorKey: 'inTransit',
    header: 'En Transit',
  },
  {
    id: 'available',
    header: 'Disponible',
    cell: ({ row }) => {
        const available = row.original.inStock + row.original.inTransit;
        return <div className="font-semibold">{available}</div>
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
