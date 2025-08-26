'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExcelImport } from '@/components/excel-import';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { addItems } = useInventory();
  const { toast } = useToast();

  const handleProductImport = (data: any[]) => {
    // A simplified mapping, assuming Excel columns match InventoryItem properties
    const newItems: InventoryItem[] = data.map((row, index) => ({
      id: `imported-${Date.now()}-${index}`,
      productName: row['productName'] || row['Nom du produit'] || 'N/A',
      sku: row['sku'] || row['SKU'] || 'N/A',
      category: row['category'] || row['Famille'] || 'N/A',
      brand: row['brand'] || row['Marque'],
      reference: row['reference'] || row['Référence'],
      inStock: parseInt(row['inStock'] || row['En Stock'] || '0', 10),
      inTransit: parseInt(row['inTransit'] || row['En Transit'] || '0', 10),
      reorderLevel: parseInt(row['reorderLevel'] || row['Niveau de réapprovisionnement'] || '0', 10),
      supplier: row['supplier'] || row['Fournisseur'] || 'N/A',
    }));

    addItems(newItems);
    
    toast({
      title: 'Importation Réussie',
      description: `${newItems.length} produits ont été ajoutés à l'inventaire.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Paramètres" />
       <Card>
        <CardHeader>
            <CardTitle>Importation de Données</CardTitle>
            <CardDescription>Importez des produits et fournisseurs depuis un fichier Excel (.csv, .xlsx).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ExcelImport title="Importer des Produits" onImport={handleProductImport} />
          <ExcelImport title="Importer des Fournisseurs" onImport={() => {
            toast({ title: "Info", description: "L'importation des fournisseurs n'est pas encore implémentée."})
          }} />
        </CardContent>
       </Card>
    </div>
  );
}
