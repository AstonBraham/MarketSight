
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';


export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { addPurchase } = useTransactions();
  const { inventory, updateItem } = useInventory();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);

  const selectedItem = inventory.find(i => i.id === selectedItemId);

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setPopoverOpen(false);
  };
  
  const handleReset = () => {
    setSelectedItemId(null);
    setQuantity(1);
    setTotalCost(0);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || quantity <= 0 || totalCost <= 0) {
        toast({
            title: "Erreur de validation",
            description: "Veuillez sélectionner un produit et entrer une quantité et un coût valides.",
            variant: "destructive"
        });
        return;
    }

    // Add purchase to transactions
    addPurchase({
      supplier: selectedItem.supplier,
      product: selectedItem.productName,
      description: `Achat de ${quantity} x ${selectedItem.productName}`,
      amount: totalCost
    });

    // --- CUMP Calculation ---
    const oldStock = selectedItem.inStock;
    const oldCostPrice = selectedItem.costPrice || 0;
    const oldStockValue = oldStock * oldCostPrice;

    const purchaseValue = totalCost;
    const newStock = oldStock + quantity;

    const newCostPrice = (oldStockValue + purchaseValue) / newStock;
    // --- End CUMP Calculation ---


    // Update inventory
    updateItem(selectedItem.id, {
        inStock: newStock,
        costPrice: newCostPrice,
    });
    
    toast({
      title: 'Achat Ajouté',
      description: 'Le nouvel achat a été enregistré et le stock mis à jour.',
    });

    handleReset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) handleReset();
        setOpen(isOpen);
    }}>
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
              Saisissez les détails de la commande fournisseur. Le stock et le coût unitaire (CUMP) seront mis à jour.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit
              </Label>
               <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className="col-span-3 justify-between"
                        >
                            {selectedItem ? selectedItem.productName : "Sélectionner un produit..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                        <CommandInput placeholder="Rechercher un produit..." />
                        <CommandList>
                            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                            <CommandGroup>
                            {inventory.map((item) => (
                                <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => handleItemSelect(item.id)}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedItemId === item.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.productName}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            {selectedItem && (
                 <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier" className="text-right">
                            Fournisseur
                        </Label>
                        <Input id="supplier" name="supplier" defaultValue={selectedItem.supplier} className="col-span-3" readOnly />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantité Achetée
                        </Label>
                        <Input id="quantity" name="quantity" type="number" className="col-span-3" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)} min="1" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Coût Total Achat
                        </Label>
                        <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" value={totalCost} onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)} required/>
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
