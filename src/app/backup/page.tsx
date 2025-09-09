
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';
import { useTransactions } from '@/context/transaction-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useAuditLog } from '@/context/audit-log-context';
import { Save, Upload } from 'lucide-react';


function BackupAndRestore() {
  const { toast } = useToast();
  const { logAction } = useAuditLog();
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
      logAction('BACKUP_DATA', 'Sauvegarde complète des données de l\'application.');

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
        logAction('RESTORE_DATA', 'Restauration des données depuis un fichier de sauvegarde.');

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
            <CardDescription>Sauvegardez toutes les données de l'application dans un fichier, ou restaurez l'application depuis une sauvegarde précédente.</CardDescription>
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
         <CardFooter>
            <p className="text-sm text-muted-foreground">
                La restauration remplacera toutes les données actuelles par celles du fichier de sauvegarde. Assurez-vous d'avoir sauvegardé vos données récentes avant de restaurer.
            </p>
        </CardFooter>
    </Card>
  )
}


export default function BackupPage() {
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Sauvegarde et Restauration" />
            <BackupAndRestore />
        </div>
    )
}
