
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
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';

export function AddInventoryItemDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addItem } = useInventory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newItem = Object.fromEntries(formData.entries());
    
    addItem({
      id: `manual-${Date.now()}`,
      productName: newItem.productName as string,
      sku: newItem.sku as string,
      category: newItem.category as string,
      brand: newItem.brand as string,
      reference: newItem.reference as string,
      inStock: parseInt(newItem.inStock as string, 10),
      defaultPrice: parseFloat(newItem.defaultPrice as string),
      inTransit: 0,
      reorderLevel: 10, // Default reorder level
      supplier: newItem.supplier as string,
    });
    
    toast({
      title: 'Article Ajouté',
      description: 'Le nouvel article a été ajouté à l\'inventaire.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvel Article</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouvel article à ajouter à l'inventaire.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">Nom</Label>
              <Input id="productName" name="productName" className="col-span-3" placeholder="Nom du produit" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input id="sku" name="sku" className="col-span-3" placeholder="Code SKU" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">Référence</Label>
              <Input id="reference" name="reference" className="col-span-3" placeholder="Référence fournisseur" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Famille</Label>
              <Input id="category" name="category" className="col-span-3" placeholder="Catégorie de l'article" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marque</Label>
              <Input id="brand" name="brand" className="col-span-3" placeholder="Marque de l'article" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Fournisseur</Label>
              <Input id="supplier" name="supplier" className="col-span-3" placeholder="Nom du fournisseur" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inStock" className="text-right">Stock</Label>
              <Input id="inStock" name="inStock" type="number" defaultValue="0" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultPrice" className="text-right">Prix de vente</Label>
              <Input id="defaultPrice" name="defaultPrice" type="number" placeholder="0" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
