
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Download } from 'lucide-react';
import { useTransactions } from '@/context/transaction-context';
import { exportToCsv } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useMemo } from 'react';

const IMPORT_TEMPLATES = {
  products: [{ productName: '', sku: '', category: '', brand: '', reference: '', inStock: 0, reorderLevel: 10, supplier: '', defaultPrice: 0, costPrice: 0 }],
  sales: [{ date: '', sku_ou_reference: '', quantity: 0, price: 0, client: '' }],
  expenses: [{ date: '', description: '', amount: 0, category: '' }],
  receipts: [{ date: '', description: '', amount: 0 }],
  wifi: [{ date: '', productName: '', quantity: 0, price: 0, amount: 0, client: '' }],
  airtime: [{ date: '', type: '', amount: 0, commission: 0, phoneNumber: '', transactionId: '' }],
  mobile_money: [
    { date: '2024-08-28', type: 'deposit', transactionId: 'DEP123', amount: 5000, commission: 15, phoneNumber: '91234567' },
    { date: '2024-08-28', type: 'withdrawal', transactionId: 'WITH456', amount: 10000, commission: 30, phoneNumber: '98765432' },
    { date: '2024-08-28', type: 'purchase', transactionId: 'PUR789', amount: 100000, commission: 0, phoneNumber: '' },
    { date: '2024-08-28', type: 'transfer_to_pos', transactionId: 'TTP101', amount: 50000, commission: 0, phoneNumber: 'PDV_02' },
    { date: '2024-08-28', type: 'transfer_from_pos', transactionId: 'TFP102', amount: 25000, commission: 0, phoneNumber: 'PDV_03' },
    { date: '2024-08-28', type: 'virtual_return', transactionId: 'VR103', amount: 15000, commission: 0, phoneNumber: '' },
    { date: '2024-08-28', type: 'collect_commission', transactionId: 'CC104', amount: 5500, commission: 0, phoneNumber: '' },
    { date: '2024-08-28', type: 'adjustment', transactionId: 'ADJ105', amount: -50, commission: 0, phoneNumber: 'Erreur de saisie' },
  ],
  physical_count: [{ sku_ou_reference: '', stock_reel: 0 }],
};


export default function ReportsPage() {
  const { toast } = useToast();
  const { sales, purchases, expenses } = useTransactions();
  const { inventory } = useInventory();
  const { transactions: airtimeTransactions } = useAirtime();
  const { transactions: mobileMoneyTransactions } = useMobileMoney();

  const wifiSales = useMemo(() => {
    return sales.filter(s => s.itemType === 'Ticket Wifi');
  }, [sales]);

  const handleExport = (name: string, data: any[]) => {
    if (data.length === 0) {
      toast({
        title: 'Exportation annulée',
        description: 'Il n\'y a aucune donnée à exporter.',
        variant: 'destructive'
      });
      return;
    }
    exportToCsv(`${name}.csv`, data);
    toast({
      title: 'Exportation Réussie',
      description: `Le fichier ${name}.csv a été téléchargé.`,
    });
  };

  const handleDownloadTemplate = (name: string, data: any[]) => {
    exportToCsv(`modele_import_${name}.csv`, data);
    toast({
      title: 'Modèle Téléchargé',
      description: `Le fichier modele_import_${name}.csv est prêt.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Rapports et Exports" />
       <Card>
        <CardHeader>
            <CardTitle>Exportation des Données</CardTitle>
            <CardDescription>Générez des rapports et exportez-les au format CSV pour Excel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" onClick={() => handleExport('rapport_ventes', sales)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Ventes
          </Button>
          <Button variant="outline" onClick={() => handleExport('rapport_achats', purchases)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Achats
          </Button>
          <Button variant="outline" onClick={() => handleExport('rapport_depenses', expenses)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Dépenses
          </Button>
           <Button variant="outline" onClick={() => handleExport('etat_inventaire', inventory)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter l'État de l'Inventaire
          </Button>
          <Button variant="outline" onClick={() => handleExport('rapport_ventes_wifi', wifiSales)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter les Ventes Wifi
          </Button>
           <Button variant="outline" onClick={() => handleExport('transactions_airtime', airtimeTransactions)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter les Transactions Airtime
          </Button>
           <Button variant="outline" onClick={() => handleExport('transactions_mobile_money', mobileMoneyTransactions)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Mobile Money
          </Button>
        </CardContent>
       </Card>

      <Card>
        <CardHeader>
            <CardTitle>Télécharger les modèles d'importation</CardTitle>
            <CardDescription>Téléchargez des fichiers CSV avec les bons en-têtes pour préparer vos données avant de les importer depuis la page Paramètres.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="secondary" onClick={() => handleDownloadTemplate('produits', IMPORT_TEMPLATES.products)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Produits
          </Button>
          <Button variant="secondary" onClick={() => handleDownloadTemplate('ventes', IMPORT_TEMPLATES.sales)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Ventes
          </Button>
          <Button variant="secondary" onClick={() => handleDownloadTemplate('depenses', IMPORT_TEMPLATES.expenses)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Dépenses
          </Button>
          <Button variant="secondary" onClick={() => handleDownloadTemplate('encaissements', IMPORT_TEMPLATES.receipts)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Encaissements
          </Button>
           <Button variant="secondary" onClick={() => handleDownloadTemplate('wifi', IMPORT_TEMPLATES.wifi)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Ventes Wifi
          </Button>
          <Button variant="secondary" onClick={() => handleDownloadTemplate('airtime', IMPORT_TEMPLATES.airtime)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Airtime
          </Button>
           <Button variant="secondary" onClick={() => handleDownloadTemplate('mobile_money', IMPORT_TEMPLATES.mobile_money)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Mobile Money
          </Button>
          <Button variant="secondary" onClick={() => handleDownloadTemplate('inventaire_physique', IMPORT_TEMPLATES.physical_count)}>
            <Download className="mr-2 h-4 w-4" />
            Modèle pour Comptage Physique
          </Button>
        </CardContent>
       </Card>

    </div>
  );
}
