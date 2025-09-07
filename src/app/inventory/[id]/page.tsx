
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInventory } from '@/context/inventory-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import type { StockMovement } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { EditInventoryItemDialog } from '@/components/inventory/edit-inventory-item-dialog';

const columns: ColumnDef<StockMovement>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleString('fr-FR'),
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as StockMovement['type'];
            const variant = type === 'in' ? 'default' : type === 'out' ? 'destructive' : 'secondary';
            const text = type === 'in' ? 'Entrée' : type === 'out' ? 'Sortie' : 'Ajustement';
            return <Badge variant={variant}>{text}</Badge>;
        }
    },
    {
        accessorKey: 'quantity',
        header: 'Quantité',
        cell: ({ row }) => {
            const quantity = row.getValue('quantity') as number;
            const sign = quantity > 0 ? '+' : '';
            const color = quantity > 0 ? 'text-green-600' : 'text-destructive';
            return <span className={cn('font-mono font-medium', color)}>{sign}{quantity}</span>
        }
    },
    {
        accessorKey: 'balanceAfter',
        header: 'Solde',
        cell: ({ row }) => <span className="font-mono font-semibold">{row.getValue('balanceAfter')}</span>
    },
    {
        accessorKey: 'reason',
        header: 'Raison / Transaction',
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

export default function InventoryItemDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getInventoryItem, getInventoryMovements } = useInventory();
    const { user } = useUser();
    const isAdmin = user?.role === 'admin';
    const id = params.id as string;
    
    const item = getInventoryItem(id);
    const movements = getInventoryMovements(id);

    if (!item) {
        return (
            <div className="flex flex-col gap-8 p-4 md:p-8">
                <PageHeader title="Article introuvable" />
                <p>L'article que vous recherchez n'existe pas ou a été supprimé.</p>
                <Button onClick={() => router.push('/inventory')}>Retour à l'inventaire</Button>
            </div>
        );
    }
    
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return 'N/A';
        return new Intl.NumberFormat('fr-FR').format(value) + ' F';
    }
    const stockValue = item.inStock * (item.costPrice || 0);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader 
                title={item.productName}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/inventory')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'inventaire
                        </Button>
                        {isAdmin && <EditInventoryItemDialog item={item} isIcon={false} />}
                    </div>
                } 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations sur l'article</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">SKU</span> <span className="font-medium">{item.sku || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Référence</span> <span className="font-medium">{item.reference || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Famille</span> <span className="font-medium">{item.category}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Marque</span> <span className="font-medium">{item.brand || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Fournisseur</span> <span className="font-medium">{item.supplier || 'N/A'}</span></div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Données de Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Stock Actuel</span> <span className="font-bold text-xl">{item.inStock}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Niveau d'Alerte</span> <span className="font-medium">{item.reorderLevel}</span></div>
                             <div className="flex justify-between"><span className="text-muted-foreground">Coût Unitaire (CUMP)</span> <span className="font-mono">{formatCurrency(item.costPrice)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Valeur du Stock</span> <span className="font-mono font-bold">{formatCurrency(stockValue)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Prix de Vente</span> <span className="font-mono">{formatCurrency(item.defaultPrice)}</span></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des Mouvements de Stock</CardTitle>
                            <CardDescription>Suivez toutes les entrées, sorties et ajustements pour cet article.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable data={movements} columns={columns} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
