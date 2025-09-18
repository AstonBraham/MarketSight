
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem, StockMovement } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockCardData extends InventoryItem {
    initialStock: number;
    totalIn: number;
    totalOut: number;
    totalAdjustments: number;
    stockValue: number;
}

const columns: ColumnDef<StockCardData>[] = [
    {
        accessorKey: 'productName',
        header: 'Article',
        cell: ({ row }) => (
             <Link href={`/inventory/${row.original.id}`} className="hover:underline font-medium text-blue-600">
                {row.original.productName}
            </Link>
        )
    },
    {
        accessorKey: 'initialStock',
        header: () => <div className="text-center">Solde Initial</div>,
        cell: ({ row }) => <div className="text-center font-mono">{row.getValue('initialStock')}</div>,
    },
    {
        accessorKey: 'totalIn',
        header: () => <div className="text-center">Entrées</div>,
        cell: ({ row }) => <div className="text-center font-mono text-green-600">+{row.getValue('totalIn')}</div>,
    },
    {
        accessorKey: 'totalOut',
        header: () => <div className="text-center">Sorties</div>,
        cell: ({ row }) => <div className="text-center font-mono text-destructive">-{row.getValue('totalOut')}</div>,
    },
    {
        accessorKey: 'totalAdjustments',
        header: () => <div className="text-center">Ajustements</div>,
        cell: ({ row }) => {
            const adj = row.getValue('totalAdjustments') as number;
            const sign = adj > 0 ? '+' : '';
            return <div className={cn("text-center font-mono", adj > 0 ? 'text-green-600' : adj < 0 ? 'text-destructive' : '')}>{sign}{adj}</div>;
        },
    },
    {
        accessorKey: 'inStock',
        header: () => <div className="text-center">Solde Final</div>,
        cell: ({ row }) => <div className="text-center font-mono font-bold">{row.original.inStock}</div>,
    },
    {
        accessorKey: 'stockValue',
        header: () => <div className="text-right">Valeur du Stock</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('stockValue'));
            const formatted = new Intl.NumberFormat('fr-FR').format(amount);
            return <div className="text-right font-mono font-bold text-primary">{formatted} F</div>;
        }
    },
];

export default function StockCardPage() {
    const { inventory, stockMovements } = useInventory();

    const stockCardData = useMemo(() => {
        return inventory.map(item => {
            const movements = stockMovements.filter(m => m.inventoryId === item.id);
            
            const totalIn = movements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.quantity, 0);
            const totalOut = Math.abs(movements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.quantity, 0));
            const totalAdjustments = movements.filter(m => m.type === 'adjustment').reduce((acc, m) => acc + m.quantity, 0);
            
            // Correct calculation: FinalStock = InitialStock + In - Out + Adjustments
            // So: InitialStock = FinalStock - In + Out - Adjustments
            const initialStock = item.inStock - totalIn + totalOut - totalAdjustments;

            return {
                ...item,
                initialStock,
                totalIn,
                totalOut,
                totalAdjustments,
                stockValue: item.inStock * (item.costPrice || 0),
            };
        });
    }, [inventory, stockMovements]);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader 
                title="Fiche de Stock (Réconciliation)"
                action={
                    <Link href="/inventory">
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'inventaire</Button>
                    </Link>
                }
            />
            <Card>
                <CardHeader>
                    <CardTitle>Synthèse des Mouvements par Article</CardTitle>
                    <CardDescription>
                       Ce tableau réconcilie tous les mouvements de stock pour chaque article, depuis le début des enregistrements.
                       Le Solde Final doit correspondre à : Solde Initial + Entrées - Sorties + Ajustements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={stockCardData} columns={columns} filterColumn="productName" filterPlaceholder="Filtrer par article..." />
                </CardContent>
            </Card>
        </div>
    );
}
