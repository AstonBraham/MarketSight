
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
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';


export function QuickSaleDialog({ item, children }: { item: InventoryItem, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addSale } = useTransactions();
  
  const price = item.defaultPrice || 0;
  const total = price * quantity;

  const handleSubmit = () => {
    
    if (quantity <= 0) {
        toast({
            title: "Quantité invalide",
            description: "Veuillez entrer une quantité supérieure à zéro.",
            variant: "destructive"
        });
        return;
    }
    
    if (quantity > item.inStock) {
         toast({
            title: "Stock insuffisant",
            description: `Le stock pour ${item.productName} est de ${item.inStock}. Vous ne pouvez pas en vendre ${quantity}.`,
            variant: "destructive"
        });
        return;
    }

    addSale({
      client: 'Client Rapide',
      product: item.productName,
      reference: item.reference,
      itemType: item.category,
      price: price,
      quantity: quantity,
      amount: total,
      inventoryId: item.id,
    });
    
    toast({
      title: 'Vente Rapide Réussie',
      description: `${quantity} x ${item.productName} vendu(s) pour ${new Intl.NumberFormat('fr-FR').format(total)} F.`,
    });

    setQuantity(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="text-yellow-500" /> Vente Rapide
          </DialogTitle>
          <DialogDescription>
            Confirmez la quantité à vendre pour <strong>{item.productName}</strong>. (Stock actuel: {item.inStock})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                  Prix Unitaire
              </Label>
              <Input id="price" name="price" type="text" className="col-span-3" value={`${new Intl.NumberFormat('fr-FR').format(price)} F`} readOnly/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                  Quantité
              </Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                className="col-span-3" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} 
                min="1" 
                max={item.inStock} 
                required
              />
          </div>
          <div className="text-right font-bold text-lg pr-4">
            Total : {new Intl.NumberFormat('fr-FR').format(total)} F
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>Valider la Vente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
