
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AutresImportExportPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Import/Export du Module Autres" />
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalité en cours de développement</CardTitle>
          <CardDescription>
            L'importation et l'exportation des données spécifiques au module "Autres" seront bientôt disponibles ici.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
