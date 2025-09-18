
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import type { Purchase } from '@/lib/types';
import { Switch } from '@/components/ui/switch';


export function EditPurchaseDialog({ purchase }: { purchase: Purchase }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updatePurchase } = useTransactions();

  const [quantity, setQuantity] = useState(purchase.quantity || 1);
  const [totalCost, setTotalCost] = useState(purchase.amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0 || totalCost < 0) {
      toast({ title: 'Données invalides', description: 'Veuillez saisir une quantité et un coût valides.', variant: 'destructive'});
      return;
    }

    const result = updatePurchase(purchase.id, { quantity, amount: totalCost });

    if (result.success) {
      toast({ title: 'Achat Modifié', description: result.message });
      setOpen(false);
    } else {
      toast({ title: 'Erreur', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l'Achat</DialogTitle>
            <DialogDescription>
              Ajustez la quantité ou le coût de l'achat pour <strong>{purchase.product}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit
              </Label>
              <Input id="product" value={purchase.product} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité Achetée
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalCost" className="text-right">
                Coût Total Achat
              </Label>
              <Input
                id="totalCost"
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(parseFloat(e.target.value))}
                className="col-span-3"
                required
                min="0"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                <Input id="status" value={purchase.status === 'paid' ? 'Payé' : 'Non Payé'} className="col-span-3" readOnly />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
