
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function EditInventoryItemDialog({ item, isIcon = true, trigger }: { item: InventoryItem, isIcon?: boolean, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { inventory, updateItem } = useInventory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updatedData = Object.fromEntries(formData.entries());
    
    // Convert string numbers to actual numbers
    const numericFields = ['inStock', 'inTransit', 'reorderLevel', 'defaultPrice', 'unitsPerParent'];
    numericFields.forEach(field => {
      if (updatedData[field]) {
        updatedData[field] = parseFloat(updatedData[field] as string);
      }
    });

     if (updatedData.parentItemId === 'none') {
        updatedData.parentItemId = undefined;
    }
    
    updateItem(item.id, updatedData as Partial<InventoryItem>);
    
    toast({
      title: 'Article Modifié',
      description: `L'article ${item.productName} a été mis à jour.`,
    });
    setOpen(false);
  };
  
  // Filter out the current item from the list of potential parents
  const potentialParents = inventory.filter(p => p.id !== item.id && !p.parentItemId);

  const dialogTrigger = trigger ? (
      <div onClick={() => setOpen(true)}>{trigger}</div>
  ) : isIcon ? (
      <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Modifier</span>
      </Button>
  ) : (
      <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Modifier l'Article
      </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
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

            <div className="my-2 border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm">Gestion des Packs</h4>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parentItemId" className="text-right">Article Parent (Pack)</Label>
                    <Select name="parentItemId" defaultValue={item.parentItemId || 'none'}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Sélectionner un article parent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Aucun</SelectItem>
                            {potentialParents.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.productName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unitsPerParent" className="text-right">Unités par Parent</Label>
                    <Input id="unitsPerParent" name="unitsPerParent" type="number" defaultValue={item.unitsPerParent} className="col-span-3" placeholder="Ex: 12" />
                </div>
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
