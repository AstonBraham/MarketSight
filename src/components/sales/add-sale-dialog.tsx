
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


export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addSale } = useTransactions();
  const { inventory, updateItem } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleItemSelect = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    setSelectedItem(item || null);
  };
  
  const handleNumericInput = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setter(parseFloat(value));
    } else if (value === '') {
        setter(0);
    }
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
    
    if (quantity > selectedItem.inStock) {
         toast({
            title: "Stock insuffisant",
            description: `Le stock pour ${selectedItem.productName} est de ${selectedItem.inStock}.`,
            variant: "destructive"
        });
        return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const saleData = Object.fromEntries(formData.entries());
    const amount = price * quantity;

    // Add sale to transactions
    addSale({
      client: saleData.client as string,
      product: selectedItem.productName,
      reference: selectedItem.reference,
      itemType: selectedItem.category,
      price: price,
      quantity: quantity,
      amount: amount
    });

    // Update inventory
    updateItem(selectedItem.id, {
        ...selectedItem,
        inStock: selectedItem.inStock - quantity
    });
    
    toast({
      title: 'Vente Ajoutée',
      description: 'La nouvelle vente a été enregistrée avec succès.',
    });

    // Reset form and close
    setSelectedItem(null);
    setQuantity(1);
    setPrice(0);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Vente au comptant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Vente au comptant</DialogTitle>
            <DialogDescription>
              Enregistrez une vente rapide pour un seul type de produit.
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
                            {item.productName} ({item.inStock} en stock)
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedItem && (
                 <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Prix
                        </Label>
                        <Input id="price" name="price" type="number" className="col-span-3" value={price} onChange={handleNumericInput(setPrice)} placeholder="0" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantité
                        </Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" max={selectedItem.inStock} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="client" className="text-right">
                            Client
                        </Label>
                        <Input id="client" name="client" className="col-span-3" placeholder="Nom du client" defaultValue="Client Comptant" required/>
                    </div>
                 </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!selectedItem}>Enregistrer la Vente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

