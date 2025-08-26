import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExcelImport } from '@/components/excel-import';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Paramètres" />
       <Card>
        <CardHeader>
            <CardTitle>Importation de Données</CardTitle>
            <CardDescription>Importez des produits et fournisseurs depuis un fichier Excel (.csv, .xlsx).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ExcelImport title="Importer des Produits" />
          <ExcelImport title="Importer des Fournisseurs" />
        </CardContent>
       </Card>
    </div>
  );
}
