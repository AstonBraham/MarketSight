
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExcelImport } from '@/components/excel-import';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function CategoryManager({ title, categories, onAddCategory }: { title: string, categories: string[], onAddCategory: (category: string) => void }) {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory && !categories.includes(newCategory)) {
      onAddCategory(newCategory);
      setNewCategory('');
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-background/50">
      <h3 className="font-medium">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
      </div>
      <div className="flex items-center gap-2">
        <Input 
          placeholder="Nouvelle catégorie..." 
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={handleAdd}>Ajouter</Button>
      </div>
    </div>
  );
}


export default function SettingsPage() {
  const { addItems, itemCategories, addCategory: addInventoryCategory } = useInventory();
  const { expenseCategories, addExpenseCategory } = useTransactions();
  const { toast } = useToast();

  const handleProductImport = (data: any[]) => {
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
            <CardTitle>Gestion des Catégories</CardTitle>
            <CardDescription>Ajoutez ou modifiez les familles d'articles et les catégories de dépenses.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <CategoryManager 
            title="Familles d'articles (Inventaire)" 
            categories={itemCategories}
            onAddCategory={(cat) => {
              addInventoryCategory(cat);
              toast({ title: 'Famille ajoutée', description: `La famille "${cat}" a été ajoutée.`});
            }}
          />
          <CategoryManager 
            title="Catégories de dépenses" 
            categories={expenseCategories}
            onAddCategory={(cat) => {
              addExpenseCategory(cat);
              toast({ title: 'Catégorie ajoutée', description: `La catégorie "${cat}" a été ajoutée.`});
            }}
          />
        </CardContent>
       </Card>

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
