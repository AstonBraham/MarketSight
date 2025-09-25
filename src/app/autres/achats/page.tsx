
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AutresAchatsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Achats du Module Autres" />
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalité en cours de développement</CardTitle>
          <CardDescription>
            La gestion des achats spécifiques au module "Autres" sera bientôt disponible ici.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
