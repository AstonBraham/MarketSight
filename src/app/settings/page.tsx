
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExcelImport } from '@/components/excel-import';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem, Sale, Expense, AirtimeTransaction, MobileMoneyTransaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';

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
  const { addExpense, expenseCategories, addExpenseCategory, addSale } = useTransactions();
  const { addTransaction: addAirtimeTransaction } = useAirtime();
  const { addTransaction: addMobileMoneyTransaction } = useMobileMoney();
  const { toast } = useToast();

  const handleProductImport = (data: any[]) => {
    try {
      const newItems: InventoryItem[] = data.map((row, index) => {
        if (!row['productName'] && !row['Nom du produit']) {
          throw new Error(`Ligne ${index + 2}: Le nom du produit est manquant.`);
        }
        if (!row['category'] && !row['Famille']) {
            throw new Error(`Ligne ${index + 2}: La catégorie est manquante pour le produit ${row['productName'] || row['Nom du produit']}.`);
        }
        return {
            id: `imported-${Date.now()}-${index}`,
            productName: row['productName'] || row['Nom du produit'],
            sku: row['sku'] || row['SKU'] || '',
            category: row['category'] || row['Famille'],
            brand: row['brand'] || row['Marque'] || '',
            reference: row['reference'] || row['Référence'] || '',
            inStock: parseInt(row['inStock'] || row['En Stock'] || '0', 10),
            inTransit: 0, // Not imported
            reorderLevel: parseInt(row['reorderLevel'] || row['Niveau de réapprovisionnement'] || '0', 10),
            supplier: row['supplier'] || row['Fournisseur'] || '',
            defaultPrice: parseFloat(row['defaultPrice'] || '0'),
            costPrice: parseFloat(row['costPrice'] || '0'),
            isQuickSale: false, // Default value
        }
      });

      addItems(newItems);
      
      toast({
        title: 'Importation Réussie',
        description: `${newItems.length} produits ont été ajoutés à l'inventaire.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur d\'importation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSalesImport = (data: any[]) => {
     try {
        data.forEach((row, index) => {
            if (!row['date'] || !row['productName'] || !row['quantity'] || !row['price']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, productName, quantity et price sont obligatoires.`);
            }
            addSale({
                date: new Date(row['date']).toISOString(),
                product: row['productName'],
                quantity: parseFloat(row['quantity']),
                price: parseFloat(row['price']),
                amount: parseFloat(row['quantity']) * parseFloat(row['price']),
                client: row['client'] || 'Client importé',
            });
        });
        toast({ title: 'Importation Réussie', description: `${data.length} ventes ont été ajoutées.` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

  const handleExpensesImport = (data: any[]) => {
      try {
        data.forEach((row, index) => {
            if (!row['date'] || !row['description'] || !row['amount'] || !row['category']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, description, amount et category sont obligatoires.`);
            }
            addExpense({
                date: new Date(row['date']).toISOString(),
                description: row['description'],
                amount: parseFloat(row['amount']),
                category: row['category'],
            });
        });
        toast({ title: 'Importation Réussie', description: `${data.length} dépenses ont été ajoutées.` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

  const handleVirtualTransactionsImport = (data: any[]) => {
     try {
        data.forEach((row, index) => {
             if (!row['date'] || !row['provider'] || !row['type'] || !row['amount']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, provider, type et amount sont obligatoires.`);
            }
            const provider = row['provider'];
            const transactionData = {
                date: new Date(row['date']).toISOString(),
                provider: provider,
                type: row['type'],
                amount: parseFloat(row['amount']),
                commission: parseFloat(row['commission'] || '0'),
                phoneNumber: row['phoneNumber'] || '',
            };

            if (['Moov', 'Yas'].includes(provider)) {
                addAirtimeTransaction(transactionData as Omit<AirtimeTransaction, 'id'>);
            } else if (['Mixx', 'Flooz'].includes(provider)) {
                addMobileMoneyTransaction(transactionData as Omit<MobileMoneyTransaction, 'id'>);
            }
        });
        toast({ title: 'Importation Réussie', description: `${data.length} transactions virtuelles ont été ajoutées.` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

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
            <CardDescription>Importez l'historique depuis un fichier Excel (.csv, .xlsx). Assurez-vous que les en-têtes de colonnes correspondent au format attendu.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ExcelImport title="Importer des Produits" onImport={handleProductImport} />
          <ExcelImport title="Importer des Ventes" onImport={handleSalesImport} />
          <ExcelImport title="Importer des Dépenses" onImport={handleExpensesImport} />
          <ExcelImport title="Importer des Opérations Virtuelles (Airtime & Mobile Money)" onImport={handleVirtualTransactionsImport} />
        </CardContent>
       </Card>
    </div>
  );
}
