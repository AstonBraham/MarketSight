
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
import type { Sale } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export function EditSaleDialog({ sale }: { sale: Sale }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updateSale } = useTransactions();

  const [quantity, setQuantity] = useState(sale.quantity || 1);
  const [price, setPrice] = useState(sale.price || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0 || price < 0) {
      toast({ title: 'Données invalides', description: 'Veuillez saisir une quantité et un prix valides.', variant: 'destructive'});
      return;
    }

    const result = updateSale(sale.id, { quantity, price });

    if (result.success) {
      toast({ title: 'Vente Modifiée', description: result.message });
      setOpen(false);
    } else {
      toast({ title: 'Erreur', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier la vente
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier la Vente</DialogTitle>
            <DialogDescription>
              Ajustez la quantité ou le prix de la vente pour <strong>{sale.product}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit
              </Label>
              <Input id="product" value={sale.product} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
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
              <Label htmlFor="price" className="text-right">
                Prix Unitaire
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="col-span-3"
                required
                min="0"
              />
            </div>
            <div className="mt-2 text-right font-bold text-lg">
                Total : {new Intl.NumberFormat('fr-FR').format(quantity * price)} F
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
