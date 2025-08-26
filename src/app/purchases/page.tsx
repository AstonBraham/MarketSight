import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion des Achats" action={<Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvel Achat</Button>} />
       <Card>
        <CardHeader>
            <CardTitle>Achats Récents</CardTitle>
            <CardDescription>Liste des dernières commandes fournisseurs.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">La table des achats sera affichée ici.</p>
        </CardContent>
       </Card>
    </div>
  );
}
