
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandList, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';


export function AddInventoryItemDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { inventory, addItem } = useInventory();

  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [suggestedSku, setSuggestedSku] = useState('');

  useEffect(() => {
    if (open) {
      // Suggest a new SKU when the dialog opens
      setSuggestedSku(`SKU-${Date.now()}`);
    } else {
        // Reset form on close
        setCategory('');
        setSuggestedSku('');
    }
  }, [open]);

  const existingCategories = useMemo(() => {
    const categories = inventory.map(item => item.category);
    return [...new Set(categories)].sort(); // Unique, sorted list of categories
  }, [inventory]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = Object.fromEntries(formData.entries());

    const sku = (newItem.sku as string).trim();
    const reference = (newItem.reference as string).trim();
    
    if (!category) {
        toast({
            title: 'Champ manquant',
            description: 'Veuillez sélectionner ou saisir une famille pour l\'article.',
            variant: 'destructive',
        });
        return;
    }

    // Check for unique SKU and Reference
    if (sku && inventory.some(item => item.sku === sku)) {
      toast({
        title: 'SKU dupliqué',
        description: `Le SKU "${sku}" est déjà utilisé par un autre article.`,
        variant: 'destructive'
      });
      return;
    }
    if (reference && inventory.some(item => item.reference === reference)) {
      toast({
        title: 'Référence dupliquée',
        description: `La référence "${reference}" est déjà utilisée par un autre article.`,
        variant: 'destructive'
      });
      return;
    }


    addItem({
      id: `manual-${Date.now()}`,
      productName: newItem.productName as string,
      sku: sku,
      category: category,
      brand: newItem.brand as string,
      reference: reference,
      inStock: parseInt(newItem.inStock as string, 10) || 0,
      defaultPrice: parseFloat(newItem.defaultPrice as string) || 0,
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
              <Input id="productName" name="productName" className="col-span-3" placeholder="Nom du produit" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input id="sku" name="sku" defaultValue={suggestedSku} className="col-span-3" placeholder="Code SKU unique" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">Référence</Label>
              <Input id="reference" name="reference" className="col-span-3" placeholder="Référence fournisseur unique" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Famille</Label>
                 <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryPopoverOpen}
                        className="col-span-3 justify-between font-normal"
                      >
                        {category || "Sélectionner ou créer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                            placeholder="Chercher ou créer une famille..."
                            value={category}
                            onValueChange={setCategory}
                        />
                        <CommandList>
                            <CommandEmpty>
                                <div className="p-4 text-sm">
                                    Aucune famille trouvée.
                                    <Button size="sm" className="mt-2 w-full" onClick={() => setCategoryPopoverOpen(false)}>
                                        Créer "{category}"
                                    </Button>
                                </div>
                            </CommandEmpty>
                            <CommandGroup>
                            {existingCategories.map((cat) => (
                                <CommandItem
                                    key={cat}
                                    value={cat}
                                    onSelect={(currentValue) => {
                                        setCategory(currentValue === category ? "" : currentValue)
                                        setCategoryPopoverOpen(false)
                                    }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    category === cat ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {cat}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
              <Label htmlFor="inStock" className="text-right">Stock Initial</Label>
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
