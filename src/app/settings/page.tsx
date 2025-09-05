
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ExcelImport } from '@/components/excel-import';
import type { InventoryItem, Sale, Expense, AirtimeTransaction, MobileMoneyTransaction, MobileMoneyProvider, Invoice, CashClosing, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { Save, Upload, BrainCircuit, Trash2, FileCheck2 } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


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

function BackupAndRestore() {
  const { toast } = useToast();
  // Get all data sources
  const inventoryData = useInventory();
  const transactionData = useTransactions();
  const airtimeData = useAirtime();
  const mobileMoneyData = useMobileMoney();

  const handleBackup = () => {
    try {
      const allData = {
        inventory: inventoryData.inventory,
        transactions: transactionData.transactions,
        invoices: transactionData.invoices,
        cashClosings: transactionData.cashClosings,
        airtimeTransactions: airtimeData.transactions,
        mobileMoneyTransactions: mobileMoneyData.transactions,
        backupDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      link.download = `jokermarket_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sauvegarde Réussie',
        description: 'Toutes les données ont été sauvegardées dans un fichier JSON.'
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur de Sauvegarde',
        description: 'Une erreur est survenue lors de la sauvegarde des données.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Le fichier est invalide.");
        
        const data = JSON.parse(text);

        // Validate data structure
        if (!data.inventory || !data.transactions || !data.airtimeTransactions || !data.mobileMoneyTransactions) {
             throw new Error("Le fichier de sauvegarde est corrompu ou invalide.");
        }
        
        // Restore data using context setters
        inventoryData.setInventory(data.inventory);
        transactionData.setTransactions(data.transactions);
        transactionData.setInvoices(data.invoices || []);
        transactionData.setCashClosings(data.cashClosings || []);
        airtimeData.setTransactions(data.airtimeTransactions);
        mobileMoneyData.setTransactions(data.mobileMoneyTransactions);

        toast({
            title: 'Restauration Réussie',
            description: `Données restaurées depuis la sauvegarde du ${new Date(data.backupDate).toLocaleString('fr-FR')}.`,
        });

      } catch (error: any) {
        toast({
          title: 'Erreur de Restauration',
          description: error.message || "Impossible de lire le fichier de sauvegarde.",
          variant: 'destructive',
        });
      } finally {
        // Reset file input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
     <Card>
        <CardHeader>
            <CardTitle>Sauvegarde et Restauration</CardTitle>
            <CardDescription>Sauvegardez toutes les données de l'application dans un fichier, ou restaurez depuis une sauvegarde précédente.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button onClick={handleBackup}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les Données
            </Button>
            <Button asChild variant="outline">
                <label htmlFor="restore-input">
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurer une Sauvegarde
                    <input id="restore-input" type="file" accept=".json" className="sr-only" onChange={handleRestore} />
                </label>
            </Button>
        </CardContent>
    </Card>
  )
}

function MaintenanceActions() {
    const { toast } = useToast();
    const { clearInventory } = useInventory();
    const { clearCashTransactions, clearInvoices, clearCashClosings } = useTransactions();
    const { clearAirtimeTransactions } = useAirtime();
    const { clearMobileMoneyTransactions } = useMobileMoney();
    
    const handleClearAllData = () => {
        try {
            clearInventory();
            clearCashTransactions();
            clearInvoices();
            clearCashClosings();
            clearAirtimeTransactions();
            clearMobileMoneyTransactions();

            toast({
                title: 'Données Effacées',
                description: "Toutes les données de l'application ont été réinitialisées.",
                variant: 'default',
            });
        } catch (error) {
             toast({
                title: 'Erreur',
                description: "Une erreur est survenue lors de la suppression des données.",
                variant: 'destructive',
            });
        }
    }
    
    const createClearAction = (
        clearFunction: () => void, 
        title: string
    ) => () => {
        try {
            clearFunction();
            toast({ title: "Opération réussie", description: `${title} ont été effacées.` });
        } catch (error) {
            toast({ title: "Erreur", description: `Impossible de vider les ${title.toLowerCase()}.`, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions de maintenance</CardTitle>
                <CardDescription>Actions irréversibles pour la gestion des données de l'application. Il est fortement recommandé de faire une sauvegarde avant toute suppression.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline">Vider l'inventaire</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Vider l'inventaire ?</AlertDialogTitle><AlertDialogDescription>Tous les produits seront supprimés. Les transactions ne seront pas affectées.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={createClearAction(clearInventory, "L'inventaire")}>Confirmer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline">Vider les transactions de caisse</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Vider les transactions de caisse ?</AlertDialogTitle><AlertDialogDescription>Toutes les ventes, achats et dépenses seront supprimés.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={createClearAction(clearCashTransactions, "Transactions de caisse")}>Confirmer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline">Vider les données Airtime</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Vider les données Airtime ?</AlertDialogTitle><AlertDialogDescription>Toutes les transactions Airtime (Moov et Yas) seront supprimées.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={createClearAction(clearAirtimeTransactions, "Données Airtime")}>Confirmer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline">Vider les données Mobile Money</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Vider les données Mobile Money ?</AlertDialogTitle><AlertDialogDescription>Toutes les transactions Mobile Money (Flooz, Mixx, Coris) seront supprimées.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={createClearAction(clearMobileMoneyTransactions, "Données Mobile Money")}>Confirmer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Tout Réinitialiser
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Toutes vos données (produits, ventes, achats, dépenses, airtime, mobile money, etc.) seront définitivement effacées.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90">
                            Oui, tout supprimer
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}


export default function SettingsPage() {
  const { addItems, itemCategories, addCategory: addInventoryCategory, setInventory, calculateAndSetReorderLevels, inventory, applyPhysicalCount } = useInventory();
  const { addBulkSales, addBulkExpenses, clearWifiSales, addExpenseCategory, expenseCategories, setTransactions, setInvoices, setCashClosings, addBulkAdjustments, sales } = useTransactions();
  const { addBulkTransactions: addBulkAirtime, setTransactions: setAirtimeTransactions } = useAirtime();
  const { addBulkTransactions: addBulkMobileMoney, setTransactions: setMobileMoneyTransactions } = useMobileMoney();
  const { toast } = useToast();
  
  const toISODate = (date: any): string => {
    if (date instanceof Date) {
        return date.toISOString();
    }
    if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    }
     if (typeof date === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + date * 86400000);
      if(!isNaN(jsDate.getTime())) {
        return jsDate.toISOString();
      }
    }
    console.warn(`Could not parse date: ${date}. Using current date as fallback.`);
    return new Date().toISOString(); 
  };

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
            productName: String(row['productName'] || row['Nom du produit'] || '').trim(),
            sku: String(row['sku'] || row['SKU'] || '').trim(),
            category: String(row['category'] || row['Famille'] || '').trim(),
            brand: String(row['brand'] || row['Marque'] || '').trim(),
            reference: String(row['reference'] || row['Référence'] || '').trim(),
            inStock: parseInt(row['inStock'] || row['En Stock'] || '0', 10),
            inTransit: 0, // Not imported
            reorderLevel: parseInt(row['reorderLevel'] || '0', 10), // Default to 0, will be calculated later
            supplier: String(row['supplier'] || row['Fournisseur'] || '').trim(),
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
        const newSales = data.map((row, index) => {
            const line = index + 2;
            const identifier = String(row['sku_ou_reference'] || '').trim();

            if (!row['date'] || !identifier || !row['quantity'] || !row['price']) {
                throw new Error(`Ligne ${line}: Les colonnes date, sku_ou_reference, quantity et price sont obligatoires.`);
            }

            const item = inventory.find(i => 
                (i.sku && i.sku.trim() === identifier) || 
                (i.reference && i.reference.trim() === identifier)
            );


            if (!item) {
                throw new Error(`Ligne ${line}: Article avec SKU/Référence "${identifier}" non trouvé dans l'inventaire.`);
            }
            
            return {
                date: toISODate(row['date']),
                product: item.productName,
                reference: item.reference,
                itemType: item.category,
                quantity: parseFloat(row['quantity']),
                price: parseFloat(row['price']),
                amount: parseFloat(row['quantity']) * parseFloat(row['price']),
                client: row['client'] || 'Client importé',
            };
        });
        addBulkSales(newSales);
        toast({ title: 'Importation Réussie', description: `${data.length} ventes ont été ajoutées.` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

  const handleReceiptsImport = (data: any[]) => {
    try {
      const newAdjustments: Omit<Transaction, 'id' | 'type' | 'category'>[] = data.map((row, index) => {
          if (!row['date'] || !row['description'] || !row['amount']) {
              throw new Error(`Ligne ${index + 2}: Les colonnes date, description, et amount sont obligatoires.`);
          }
          const amount = parseFloat(row['amount']);
          if (isNaN(amount) || amount <= 0) {
            throw new Error(`Ligne ${index + 2}: Le montant doit être un nombre positif.`);
          }
          return {
              date: toISODate(row['date']),
              description: row['description'],
              amount: amount,
          };
      });
      addBulkAdjustments(newAdjustments);
      toast({ title: 'Importation Réussie', description: `${data.length} encaissements ont été ajoutés.` });
    } catch (error: any) {
       toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

  const handleWifiSalesImport = (data: any[]) => {
    try {
      clearWifiSales();

      const newSales = data.map((row, index) => {
        const line = index + 2;
        if (!row['date'] || !row['productName'] || !row['quantity'] || !row['price']) {
          throw new Error(`Ligne ${line}: Les colonnes date, productName, quantity et price sont obligatoires.`);
        }
        
        const quantity = parseFloat(row['quantity']);
        const price = parseFloat(row['price']);
        const amount = row['amount'] ? parseFloat(row['amount']) : quantity * price;

        if (isNaN(quantity) || isNaN(price) || isNaN(amount)) {
            throw new Error(`Ligne ${line}: quantity, price, ou amount contiennent des valeurs non valides.`);
        }

        return {
          date: toISODate(row['date']),
          product: row['productName'],
          quantity: quantity,
          price: price,
          amount: amount,
          client: row['client'] || 'Client Wifi',
          itemType: 'Ticket Wifi',
        };
      });

      addBulkSales(newSales);
      
      toast({ title: 'Importation Réussie', description: `Les anciennes données WiFi ont été purgées et ${data.length} nouvelles ventes ont été ajoutées.` });
    } catch (error: any) {
      toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }

  const handleExpensesImport = (data: any[]) => {
      try {
        const newExpenses = data.map((row, index) => {
            if (!row['date'] || !row['description'] || !row['amount'] || !row['category']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, description, amount et category sont obligatoires.`);
            }
            return {
                date: toISODate(row['date']),
                description: row['description'],
                amount: parseFloat(row['amount']),
                category: row['category'],
            };
        });
        addBulkExpenses(newExpenses);
        toast({ title: 'Importation Réussie', description: `${data.length} dépenses ont été ajoutées.` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }
  
  const handleAirtimeImport = (provider: 'Moov' | 'Yas') => (data: any[]) => {
      try {
        addBulkAirtime([], provider); // Clear existing data for this provider
        const newTransactions = data.map((row, index) => {
             if (!row['date'] || !row['type'] || !row['amount']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, type et amount sont obligatoires.`);
            }
            return {
                date: toISODate(row['date']),
                provider: provider,
                type: row['type'],
                amount: parseFloat(row['amount']),
                commission: parseFloat(row['commission'] || '0'),
                phoneNumber: String(row['phoneNumber'] || row['Numéro Tél.'] || ''),
                transactionId: row['transactionId'] || '',
            };
        });
        
        addBulkAirtime(newTransactions as Omit<AirtimeTransaction, 'id' | 'date'>[]);
        toast({ title: 'Importation Réussie', description: `${data.length} transactions pour ${provider} ont été ajoutées (anciennes données purgées).` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }
  
  const handleMobileMoneyImport = (provider: MobileMoneyProvider) => (data: any[]) => {
       try {
        addBulkMobileMoney([], provider); // Clear existing data for this provider
        const newTransactions = data.map((row, index) => {
             if (!row['date'] || !row['type'] || !row['amount']) {
                throw new Error(`Ligne ${index + 2}: Les colonnes date, type et amount sont obligatoires.`);
            }
            return {
                date: toISODate(row['date']),
                provider: provider,
                type: row['type'],
                amount: parseFloat(row['amount']),
                commission: parseFloat(row['commission'] || '0'),
                phoneNumber: row['phoneNumber'] || '',
                transactionId: row['transactionId'] || '',
            };
        });
        addBulkMobileMoney(newTransactions as Omit<MobileMoneyTransaction, 'id' | 'date'>[]);
        toast({ title: 'Importation Réussie', description: `${data.length} transactions pour ${provider} ont été ajoutées (anciennes données purgées).` });
    } catch (error: any) {
         toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  }
  
  const handleReorderLevelCalculation = () => {
    calculateAndSetReorderLevels(sales, 3); // Calculate for a 3-day buffer
    toast({
        title: 'Calcul Terminé',
        description: 'Les niveaux de réapprovisionnement ont été mis à jour pour tous les articles en fonction de l\'historique des ventes.'
    })
  }

  const handlePhysicalCountImport = (data: any[]) => {
    try {
        const countData = data.map((row, index) => {
            const line = index + 2;
            const identifier = String(row['sku_ou_reference'] || '').trim();
            const realStock = row['stock_reel'];

            if (!identifier || realStock === undefined || realStock === null) {
                throw new Error(`Ligne ${line}: Les colonnes sku_ou_reference et stock_reel sont obligatoires.`);
            }
            return { identifier, realStock: parseInt(String(realStock), 10) };
        });

        const { updatedCount, notFoundCount } = applyPhysicalCount(countData);

        toast({
            title: 'Importation du comptage terminée',
            description: `${updatedCount} articles mis à jour. ${notFoundCount} articles non trouvés.`,
        });
    } catch (error: any) {
        toast({ title: 'Erreur d\'importation', description: error.message, variant: 'destructive' });
    }
  };


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Paramètres" />
      
      <BackupAndRestore />
      <MaintenanceActions />

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
            <CardTitle>Importation et Actions intelligentes</CardTitle>
            <CardDescription>Importez l'historique depuis un fichier Excel (.csv, .xlsx) et utilisez les outils pour automatiser la configuration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ExcelImport title="Importer des Produits" onImport={handleProductImport} />
          <ExcelImport title="Importer des Ventes" onImport={handleSalesImport} />
          <ExcelImport title="Importer des Dépenses" onImport={handleExpensesImport} />
          <ExcelImport title="Importer un Comptage Physique" onImport={handlePhysicalCountImport} icon={<FileCheck2 />} />
          <div className="p-4 border rounded-lg space-y-4 bg-background/50 flex flex-col justify-center items-start">
             <h3 className="font-medium">Niveaux de Réapprovisionnement</h3>
             <p className="text-sm text-muted-foreground">Après avoir importé vos produits et vos ventes, cliquez ici pour calculer automatiquement les stocks d'alerte.</p>
            <Button onClick={handleReorderLevelCalculation} variant="secondary">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Calculer les niveaux
            </Button>
          </div>
          <ExcelImport title="Importer des Encaissements" onImport={handleReceiptsImport} />
          <ExcelImport title="Importer Ventes Wifi" onImport={handleWifiSalesImport} />
          <ExcelImport title="Importer Airtime Moov" onImport={handleAirtimeImport('Moov')} />
          <ExcelImport title="Importer Airtime Yas" onImport={handleAirtimeImport('Yas')} />
          <ExcelImport title="Importer Mobile Money Flooz" onImport={handleMobileMoneyImport('Flooz')} />
          <ExcelImport title="Importer Mobile Money Mixx" onImport={handleMobileMoneyImport('Mixx')} />
          <ExcelImport title="Importer Mobile Money Coris" onImport={handleMobileMoneyImport('Coris')} />
        </CardContent>
       </Card>
    </div>
  );
}
