
'use client';

import type { InventoryItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
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

function ActionsCell({ row }: { row: any }) {
    const { user } = useUser();
    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
        return null;
    }

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
            <DropdownMenuItem>
              <ArrowUp className="mr-2 h-4 w-4" />
              Entrée de stock
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowDown className="mr-2 h-4 w-4" />
              Sortie de stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Modifier le produit</DropdownMenuItem>
            <DropdownMenuItem>Voir les mouvements</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'productName',
    header: 'Produit',
    cell: ({ row }) => {
        const item = row.original;
        return (
            <div className="flex flex-col">
                <span className="font-medium">{item.productName}</span>
                <span className="text-xs text-muted-foreground">
                  {item.sku} {item.reference && `| ${item.reference}`}
                </span>
            </div>
        )
    }
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
  },
];
