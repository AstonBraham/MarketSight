
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
import type { InventoryItem } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';

export function EditInventoryItemDialog({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updateItem } = useInventory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updatedData = Object.fromEntries(formData.entries());
    
    // Convert string numbers to actual numbers
    const numericFields = ['inStock', 'inTransit', 'reorderLevel', 'defaultPrice'];
    numericFields.forEach(field => {
      if (updatedData[field]) {
        updatedData[field] = parseFloat(updatedData[field] as string);
      }
    });
    
    updateItem(item.id, updatedData);
    
    toast({
      title: 'Article Modifié',
      description: `L'article ${item.productName} a été mis à jour.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'article ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">Nom</Label>
              <Input id="productName" name="productName" defaultValue={item.productName} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input id="sku" name="sku" defaultValue={item.sku} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">Référence</Label>
              <Input id="reference" name="reference" defaultValue={item.reference} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Famille</Label>
              <Input id="category" name="category" defaultValue={item.category} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marque</Label>
              <Input id="brand" name="brand" defaultValue={item.brand} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Fournisseur</Label>
              <Input id="supplier" name="supplier" defaultValue={item.supplier} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inStock" className="text-right">Stock</Label>
              <Input id="inStock" name="inStock" type="number" defaultValue={item.inStock} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultPrice" className="text-right">Prix de vente</Label>
              <Input id="defaultPrice" name="defaultPrice" type="number" defaultValue={item.defaultPrice} className="col-span-3" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
