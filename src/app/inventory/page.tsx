
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from '@/components/data-table/data-table';
import { columns as inventoryColumns } from '@/components/inventory/columns-inventory';
import { columns as movementsColumns } from '@/components/inventory/columns-movements';
import { mockInventory, mockStockMovements } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileCheck2 } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { AddInventoryItemDialog } from '@/components/inventory/add-inventory-item-dialog';

export default function InventoryPage() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion de l'Inventaire" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur du Stock</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12,450,000 F</div>
                <p className="text-xs text-muted-foreground">Basé sur le coût d'achat</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits en rupture</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Articles à commander</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Articles en transit</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">75</div>
                <p className="text-xs text-muted-foreground">Livraisons en attente</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Précision Inventaire</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">Après le dernier comptage</p>
            </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="inventory">
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="inventory">État des Stocks</TabsTrigger>
                <TabsTrigger value="movements">Mouvements de Stock</TabsTrigger>
            </TabsList>
            {isAdmin && (
              <div className="ml-auto flex items-center gap-2">
                  <AddInventoryItemDialog />
                  <Button size="sm" variant="outline">
                      <FileCheck2 className="mr-2 h-4 w-4" />
                      Comptage Physique
                  </Button>
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
                    <DataTable data={mockInventory} columns={inventoryColumns} filterColumn="productName" filterPlaceholder="Filtrer par produit..."/>
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
