
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Boxes, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AutresPage() {

  // TODO: Replace with dedicated state management for this module
  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' F';
  const stockValue = 125000;
  const cashBalance = 75000;
  const salesToday = 25000;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader
        title="Module Autres (Têtes de Gondole)"
        action={
          <div className="flex gap-2">
            <Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Vente</Button>
            <Button variant="outline" disabled><PlusCircle className="mr-2 h-4 w-4" /> Nouvel Achat</Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
            <CardTitle>Synthèse du module "Autres"</CardTitle>
            <CardDescription>
                Suivi des articles promotionnels, saisonniers ou en tête de gondole. Ce module est indépendant du reste de l'application.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Caisse "Autres"</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
                         <p className="text-xs text-muted-foreground">Liquidités de ce module</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valeur du Stock "Autres"</CardTitle>
                         <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stockValue)}</div>
                         <p className="text-xs text-muted-foreground">Valeur des articles de ce module</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventes du jour "Autres"</CardTitle>
                         <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(salesToday)}</div>
                         <p className="text-xs text-muted-foreground">Ventes de ce module aujourd'hui</p>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
