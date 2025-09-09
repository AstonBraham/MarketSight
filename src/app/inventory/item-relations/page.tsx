
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ItemRelation extends InventoryItem {
    parentItem?: InventoryItem;
}

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
        header: 'Unités / Pack',
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
