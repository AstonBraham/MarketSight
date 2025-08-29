
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';


export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addPurchase } = useTransactions();
  const { inventory, updateItem } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleItemSelect = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    setSelectedItem(item || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || quantity <= 0) {
        toast({
            title: "Erreur de validation",
            description: "Veuillez sélectionner un produit et entrer une quantité valide.",
            variant: "destructive"
        });
        return;
    }
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const purchaseData = Object.fromEntries(formData.entries());
    const amount = parseFloat(purchaseData.amount as string);

    // Add purchase to transactions
    addPurchase({
      supplier: purchaseData.supplier as string,
      product: selectedItem.productName,
      description: `Achat de ${quantity} x ${selectedItem.productName}`,
      amount: amount
    });

    // Update inventory
    updateItem(selectedItem.id, {
        inStock: selectedItem.inStock + quantity
    });
    
    toast({
      title: 'Achat Ajouté',
      description: 'Le nouvel achat a été enregistré avec succès.',
    });

    // Reset form and close
    setSelectedItem(null);
    setQuantity(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvel Achat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvel Achat</DialogTitle>
            <DialogDescription>
              Saisissez les détails de la commande fournisseur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit
              </Label>
               <Select onValueChange={handleItemSelect}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                    {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                            {item.productName}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedItem && (
                 <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier" className="text-right">
                            Fournisseur
                        </Label>
                        <Input id="supplier" name="supplier" defaultValue={selectedItem.supplier} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantité
                        </Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Montant Total
                        </Label>
                        <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" required/>
                    </div>
                 </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!selectedItem}>Enregistrer l'Achat</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
