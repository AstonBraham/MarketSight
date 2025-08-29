
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useTransactions } from '@/context/transaction-context';
import { exportToCsv } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useMemo } from 'react';

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
    </div>
  );
}
