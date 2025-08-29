
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Zap } from 'lucide-react';
import { AddSaleDialog } from '@/components/sales/add-sale-dialog';
import Link from 'next/link';
import { useTransactions } from '@/context/transaction-context';
import { DataTable } from '@/components/data-table/data-table';
import type { Invoice, InventoryItem } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/inventory-context';
import { useToast } from '@/hooks/use-toast';

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'id',
        header: 'N° Facture',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString('fr-FR'),
    },
    {
        accessorKey: 'clientName',
        header: 'Client',
    },
    {
        accessorKey: 'total',
        header: () => <div className="text-right">Montant Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {new Intl.NumberFormat('fr-FR').format(row.original.total)} F
            </div>
        ),
    },
];

const QuickSaleItem = ({ item }: { item: InventoryItem }) => {
    const { addSale } = useTransactions();
    const { updateItem } = useInventory();
    const { toast } = useToast();

    const handleQuickSale = () => {
        if (item.inStock < 1) {
            toast({
                title: "Stock insuffisant",
                description: `Le stock pour ${item.productName} est épuisé.`,
                variant: "destructive"
            });
            return;
        }

        const saleAmount = item.defaultPrice || 0;

        addSale({
            client: 'Client Rapide',
            product: item.productName,
            reference: item.reference,
            itemType: item.category,
            price: saleAmount,
            quantity: 1,
            amount: saleAmount,
        });

        updateItem(item.id, {
            inStock: item.inStock - 1
        });

        toast({
            title: "Vente Rapide Réussie",
            description: `1 x ${item.productName} vendu pour ${saleAmount} F.`
        });
    }

    return (
        <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center justify-center p-2 gap-2"
            onClick={handleQuickSale}
        >
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-center text-xs leading-tight">{item.productName}</span>
            <span className="text-xs font-bold">{item.defaultPrice ? `${new Intl.NumberFormat('fr-FR').format(item.defaultPrice)} F` : 'Prix non défini'}</span>
        </Button>
    )
}

export default function InvoicesPage() {
    const { invoices } = useTransactions();
    const { inventory } = useInventory();
    const router = useRouter();

    const handleRowClick = (row: any) => {
        router.push(`/invoices/${row.original.id}`);
    }
    
    const quickSaleItems = inventory.filter(item => item.isQuickSale);


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
        <PageHeader title="Ventes et Facturation" />
        
        <div className="flex gap-4">
            <AddSaleDialog />
            <Link href="/invoices/new">
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle Facture
                </Button>
            </Link>
        </div>

        {quickSaleItems.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Ventes Rapides</CardTitle>
                    <CardDescription>Cliquez sur un article pour enregistrer une vente rapide au comptant.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                   {quickSaleItems.map(item => (
                       <QuickSaleItem key={item.id} item={item} />
                   ))}
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Factures Récentes</CardTitle>
                <CardDescription>Liste des dernières factures et ventes au comptant.</CardDescription>
            </CardHeader>
            <CardContent>
               <DataTable
                    columns={columns}
                    data={invoices}
                    filterColumn="clientName"
                    filterPlaceholder="Filtrer par client..."
                />
            </CardContent>
        </Card>
    </div>
  );
}
