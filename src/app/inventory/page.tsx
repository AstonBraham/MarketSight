

'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from '@/components/data-table/data-table';
import { columns as inventoryColumns } from '@/components/inventory/columns-inventory';
import { columns as movementsColumns } from '@/components/inventory/columns-movements';
import { columns as reorderColumns } from '@/components/inventory/columns-reorder';
import { mockStockMovements } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileCheck2, Truck } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { AddInventoryItemDialog } from '@/components/inventory/add-inventory-item-dialog';
import { useInventory } from '@/context/inventory-context';
import { AddPurchaseDialog } from '@/components/purchases/add-purchase-dialog';
import { useMemo } from 'react';
import Link from 'next/link';
import { useTransactions } from '@/context/transaction-context';
import type { InventoryItem } from '@/lib/types';


export default function InventoryPage() {
  const { user } = useUser();
  const { inventory } = useInventory();
  const { purchases, sales } = useTransactions();
  const isAdmin = user?.role === 'admin';
  
  const stockValue = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.inStock * (item.costPrice || 0)), 0);
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter(item => item.inStock <= 0).length;
  }, [inventory]);

  const totalPurchases = useMemo(() => {
    return purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
  }, [purchases]);
  
  const reorderList = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return inventory
        .filter(item => item.inStock <= item.reorderLevel)
        .map(item => {
            const recentSales = sales.filter(
                s => s.inventoryId === item.id && new Date(s.date) >= thirtyDaysAgo
            ).reduce((acc, s) => acc + (s.quantity || 0), 0);
            
            const averageDailySales = recentSales / 30;
            // Target 15 days of stock
            const targetStock = Math.ceil(averageDailySales * 15); 
            let quantityToOrder = targetStock - item.inStock;

            // If no sales, suggest ordering up to the reorder level
            if (quantityToOrder <= 0) {
              quantityToOrder = item.reorderLevel - item.inStock;
            }

            return {
                ...item,
                quantityToOrder: quantityToOrder > 0 ? Math.ceil(quantityToOrder) : 0,
            };
        })
        .filter(item => item.quantityToOrder > 0);
  }, [inventory, sales]);


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion de l'Inventaire" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur du Stock (CUMP)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(stockValue)} F</div>
                <p className="text-xs text-muted-foreground">Basé sur le coût d'achat moyen</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Achats</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalPurchases)} F</div>
            <p className="text-xs text-muted-foreground">
              Montant total de tous les achats enregistrés.
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits à commander</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{reorderList.length}</div>
                <p className="text-xs text-muted-foreground">Articles en dessous du stock d'alerte</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits en rupture</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{outOfStockItems}</div>
                <p className="text-xs text-muted-foreground">Articles avec un stock de 0</p>
            </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="inventory">
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="inventory">État des Stocks</TabsTrigger>
                <TabsTrigger value="reorder">À Commander ({reorderList.length})</TabsTrigger>
                {isAdmin && <TabsTrigger value="movements">Mouvements de Stock</TabsTrigger>}
            </TabsList>
            {isAdmin && (
              <div className="ml-auto flex items-center gap-2">
                  <AddPurchaseDialog />
                  <AddInventoryItemDialog />
                   <Link href="/inventory/physical-count">
                    <Button size="sm" variant="outline">
                        <FileCheck2 className="mr-2 h-4 w-4" />
                        Comptage Physique
                    </Button>
                  </Link>
              </div>
            )}
        </div>
        <TabsContent value="inventory">
            <Card>
                <CardHeader>
                <CardTitle>État Actuel des Stocks</CardTitle>
                <CardDescription>Consultez les quantités disponibles pour chaque produit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={inventory} columns={inventoryColumns} filterColumn="productName" filterPlaceholder="Filtrer par produit..."/>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="reorder">
            <Card>
                <CardHeader>
                <CardTitle>Liste de Réapprovisionnement</CardTitle>
                <CardDescription>Articles à commander en fonction du niveau d'alerte et des ventes moyennes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={reorderList} columns={reorderColumns} filterColumn="productName" filterPlaceholder="Filtrer par produit..."/>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="movements">
            <Card>
                <CardHeader>
                <CardTitle>Mouvements de Stock Récents</CardTitle>
                <CardDescription>Suivez les entrées, sorties et ajustements de votre inventaire.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={mockStockMovements} columns={movementsColumns} />
                </CardContent>
            </Card>
        </TabsContent>
       </Tabs>
    </div>
  );
}
