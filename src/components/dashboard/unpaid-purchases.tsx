'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/context/transaction-context';
import { CreditCard, Truck, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/user-context';
import { EditPurchaseDialog } from '../purchases/edit-purchase-dialog';
import type { Purchase } from '@/lib/types';


export function UnpaidPurchases() {
  const { purchases, payPurchase } = useTransactions();
  const { toast } = useToast();
  const { user } = useUser();
  const unpaidPurchases = purchases.filter(p => p.status === 'unpaid');

  const handlePay = (purchaseId: string, amount: number) => {
    payPurchase(purchaseId);
    toast({
        title: "Achat Réglé",
        description: `L'achat a été marqué comme payé.`,
    });
  }

  if (unpaidPurchases.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Achats non réglés</CardTitle>
        <CardDescription>
          Liste des achats à crédit en attente de paiement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {unpaidPurchases.map((purchase) => (
          <div key={purchase.id} className="flex items-center">
            <div className="p-3 rounded-full bg-secondary">
              <Truck className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{purchase.description}</p>
              <p className="text-xs text-muted-foreground">{purchase.supplier} &bull; {new Date(purchase.date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium">{new Intl.NumberFormat('fr-FR').format(purchase.amount)} F</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                <CreditCard className="mr-1 h-3 w-3" />
                                Payer l'achat
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer le paiement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action marquera l'achat comme payé et créera une transaction de sortie de caisse de <strong>{new Intl.NumberFormat('fr-FR').format(purchase.amount)} F</strong>.
                                L'action est irréversible.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handlePay(purchase.id, purchase.amount)}>
                                Confirmer et Payer
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 {user?.role === 'admin' && (
                    <EditPurchaseDialog purchase={purchase as Purchase} />
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
