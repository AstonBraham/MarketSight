'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { mockSales, mockPurchases, mockExpenses } from '@/lib/mock-data';
import { exportToCsv } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleExport = (name: string, data: any[]) => {
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
          <Button variant="outline" onClick={() => handleExport('rapport_ventes', mockSales)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Ventes
          </Button>
          <Button variant="outline" onClick={() => handleExport('rapport_achats', mockPurchases)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Achats
          </Button>
          <Button variant="outline" onClick={() => handleExport('rapport_depenses', mockExpenses)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter le Rapport des Dépenses
          </Button>
        </CardContent>
       </Card>
    </div>
  );
}
