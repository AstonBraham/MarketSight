
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Zap, Receipt, Banknote } from 'lucide-react';
import { AddSaleDialog } from '@/components/sales/add-sale-dialog';
import Link from 'next/link';
import { useTransactions } from '@/context/transaction-context';
import { DataTable } from '@/components/data-table/data-table';
import type { Invoice, InventoryItem, Sale } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';
import { QuickSaleDialog } from '@/components/sales/quick-sale-dialog';
import { columns as invoiceColumns } from '@/components/invoices/columns-invoices';
import { columns as salesColumns } from '@/components/sales/columns-sales';


const QuickSaleItem = ({ item }: { item: InventoryItem }) => {
    return (
        <QuickSaleDialog item={item}>
            <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-3 gap-2 shadow-sm hover:shadow-md transition-shadow whitespace-normal text-center"
            >
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="text-sm leading-tight font-medium">{item.productName}</span>
                <span className="text-xs font-bold">{item.defaultPrice ? `${new Intl.NumberFormat('fr-FR').format(item.defaultPrice)} F` : 'Prix non défini'}</span>
            </Button>
        </QuickSaleDialog>
    )
}

export default function InvoicesPage() {
    const { invoices, sales } = useTransactions();
    const { inventory } = useInventory();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);
    
    const topSellingItems = useMemo(() => {
        if (!isClient) return [];
        const salesByItem: { [key: string]: number } = {};
        sales.forEach(sale => {
            if (sale.inventoryId && sale.quantity) {
                salesByItem[sale.inventoryId] = (salesByItem[sale.inventoryId] || 0) + sale.quantity;
            }
        });

        return Object.entries(salesByItem)
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
            .slice(0, 10)
            .map(([inventoryId]) => inventory.find(item => item.id === inventoryId))
            .filter((item): item is InventoryItem => !!item);
    }, [isClient, sales, inventory]);

    const totalInvoiced = useMemo(() => {
        if (!isClient) return 0;
        return invoices.reduce((acc, invoice) => acc + invoice.total, 0);
    }, [isClient, invoices]);

    const cashSales = useMemo(() => {
        if (!isClient) return [];
        return sales
            .filter(s => !s.invoiceId && s.itemType !== 'Ticket Wifi') // Exclure les ventes Wifi
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [isClient, sales]);

    const totalCashSales = useMemo(() => {
        if (!isClient) return 0;
        return cashSales.reduce((acc, sale) => acc + sale.amount, 0);
    }, [isClient, cashSales]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
        <PageHeader title="Ventes et Facturation" />

        <div className="grid gap-4 md:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Facturé</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)} F</div>
                <p className="text-xs text-muted-foreground">
                Montant total de toutes les factures émises.
                </p>
            </CardContent>
            </Card>
             <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes au Comptant (produits)</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCashSales)} F</div>
                <p className="text-xs text-muted-foreground">
                Total des ventes de produits au comptant (hors Wifi).
                </p>
            </CardContent>
            </Card>
      </div>
        
        <div className="flex gap-4">
            <AddSaleDialog />
            <Link href="/invoices/new">
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle Facture
                </Button>
            </Link>
        </div>

        {topSellingItems.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Ventes Rapides (Top 10 articles)</CardTitle>
                    <CardDescription>Cliquez sur un article pour enregistrer une vente rapide au comptant.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                   {topSellingItems.map(item => (
                       <QuickSaleItem key={item.id} item={item} />
                   ))}
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Ventes au comptant récentes</CardTitle>
                    <CardDescription>Liste des dernières ventes de produits au comptant (hors Wifi).</CardDescription>
                </CardHeader>
                <CardContent>
                <DataTable
                        columns={salesColumns}
                        data={cashSales}
                        filterColumn="product"
                        filterPlaceholder="Filtrer par produit..."
                    />
                </CardContent>
             </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Factures Récentes</CardTitle>
                    <CardDescription>Liste des dernières factures émises.</CardDescription>
                </CardHeader>
                <CardContent>
                <DataTable
                        columns={invoiceColumns}
                        data={invoices}
                        filterColumn="clientName"
                        filterPlaceholder="Filtrer par client..."
                    />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
