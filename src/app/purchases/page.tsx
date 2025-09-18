
'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/purchases/columns-purchases';
import { AddPurchaseDialog } from '@/components/purchases/add-purchase-dialog';
import { useTransactions } from '@/context/transaction-context';
import { Truck, CreditCard } from 'lucide-react';

export default function PurchasesPage() {
  const { purchases } = useTransactions();
  
  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases]);

  const totalPurchases = useMemo(() => {
    return purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
  }, [purchases]);
  
  const unpaidPurchasesValue = useMemo(() => {
    return purchases
      .filter(p => p.status === 'unpaid')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [purchases]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Achats Fournisseurs" action={<AddPurchaseDialog />} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Achats</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalPurchases)} F</div>
            <p className="text-xs text-muted-foreground">
              Montant total de tous les achats enregistrés.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achats non réglés</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{new Intl.NumberFormat('fr-FR').format(unpaidPurchasesValue)} F</div>
            <p className="text-xs text-muted-foreground">
              Total des achats en attente de paiement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des achats</CardTitle>
           <CardDescription>
            Voici la liste détaillée de tous vos achats fournisseurs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={sortedPurchases} columns={columns} filterColumn="product" filterPlaceholder="Filtrer par produit..." />
        </CardContent>
      </Card>
    </div>
  );
}
