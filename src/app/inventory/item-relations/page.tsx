
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Edit, MoreHorizontal, PackageOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditInventoryItemDialog } from '@/components/inventory/edit-inventory-item-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ItemRelation extends InventoryItem {
    parentItem?: InventoryItem;
}

const ActionsCell = ({ row }: { row: { original: ItemRelation } }) => {
    const { breakPack } = useInventory();
    const { toast } = useToast();
    const item = row.original;
    const parentItem = item.parentItem;

    const handleBreakPack = () => {
        if (!parentItem) return;
        const result = breakPack(parentItem.id, 1);
        if (result.success) {
            toast({ title: 'Pack cassé', description: `1 pack de ${parentItem.productName} a été converti en ${item.unitsPerParent} unités de ${item.productName}.` });
        } else {
            toast({ title: 'Erreur', description: result.message, variant: 'destructive' });
        }
    };

    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <EditInventoryItemDialog item={item} isIcon={false} trigger={
                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Modifier la relation</span>
                            </button>
                        } />
                    </DropdownMenuItem>
                    {parentItem && (
                         <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <PackageOpen className="mr-2 h-4 w-4" />
                                Casser 1 Pack
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {parentItem && (
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Casser un pack de "{parentItem.productName}" ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action décrémentera le stock du pack de 1 et incrémentera le stock de l'unité ({item.productName}) de {item.unitsPerParent}. Êtes-vous sûr ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBreakPack}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            )}
        </AlertDialog>
    );
};

const columns: ColumnDef<ItemRelation>[] = [
    {
        accessorKey: 'productName',
        header: 'Article Unitaire',
        cell: ({ row }) => (
             <Link href={`/inventory/${row.original.id}`} className="hover:underline font-medium text-blue-600">
                {row.original.productName}
            </Link>
        )
    },
    {
        id: 'relation',
        header: '',
        cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground" />
    },
    {
        accessorKey: 'parentItem.productName',
        header: 'Article Parent (Pack)',
        cell: ({ row }) => {
            const parent = row.original.parentItem;
            if (!parent) return <span className="text-muted-foreground">Aucun</span>;
            return (
                 <Link href={`/inventory/${parent.id}`} className="hover:underline font-medium">
                    {parent.productName}
                </Link>
            )
        }
    },
     {
        accessorKey: 'unitsPerParent',
        header: () => <div className='text-center'>Unités / Pack</div>,
        cell: ({ row }) => <div className="text-center font-mono font-bold">{row.original.unitsPerParent || 'N/A'}</div>
    },
    {
        accessorKey: 'inStock',
        header: () => <div className="text-right">Stock Unités</div>,
        cell: ({ row }) => <div className="text-right font-mono">{row.original.inStock}</div>,
    },
     {
        accessorKey: 'parentItem.inStock',
        header: () => <div className="text-right">Stock Packs</div>,
        cell: ({ row }) => {
            const stock = row.original.parentItem?.inStock;
            return <div className="text-right font-mono">{stock !== undefined ? stock : 'N/A'}</div>
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ActionsCell,
    },
];

export default function ItemRelationsPage() {
    const { inventory } = useInventory();

    const relations = useMemo(() => {
        return inventory
            .filter(item => item.parentItemId)
            .map(item => ({
                ...item,
                parentItem: inventory.find(p => p.id === item.parentItemId)
            }));
    }, [inventory]);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader 
                title="Gestion des Relations Pack/Unité"
                action={
                    <Link href="/inventory">
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'inventaire</Button>
                    </Link>
                }
            />
            <Card>
                <CardHeader>
                    <CardTitle>Relations entre Articles</CardTitle>
                    <CardDescription>
                       Ce tableau montre tous les articles (unités) qui sont liés à un article parent (pack/carton) pour la gestion automatique des stocks.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={relations} columns={columns} />
                </CardContent>
            </Card>
        </div>
    );
}
