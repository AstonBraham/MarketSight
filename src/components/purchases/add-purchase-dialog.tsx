
'use client';

import { useState, useMemo } from 'react';
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
import { PlusCircle, ChevronsUpDown, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { addPurchase } = useTransactions();
  const { inventory } = useInventory();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [isPaid, setIsPaid] = useState(true);

  const selectedItem = inventory.find(i => i.id === selectedItemId);
  
  const finalTotalCost = totalCost + additionalCosts;
  const unitCost = quantity > 0 ? finalTotalCost / quantity : 0;

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setPopoverOpen(false);
  };
  
  const handleReset = () => {
    setSelectedItemId(null);
    setQuantity(1);
    setTotalCost(0);
    setAdditionalCosts(0);
    setIsPaid(true);
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

    addPurchase({
      supplier: selectedItem.supplier,
      product: selectedItem.productName,
      description: `Achat de ${quantity} x ${selectedItem.productName}`,
      amount: totalCost,
      additionalCosts: additionalCosts,
      status: isPaid ? 'paid' : 'unpaid',
      inventoryId: selectedItem.id,
      quantity: quantity
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

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>
                            Saisissez le **coût total** pour l'ensemble des articles achetés, pas le coût unitaire.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Coût d'achat (Total)
                        </Label>
                        <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" value={totalCost} onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)} required/>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="additionalCosts" className="text-right">
                            Coûts additionnels
                        </Label>
                        <Input id="additionalCosts" name="additionalCosts" type="number" className="col-span-3" placeholder="Transport, douane, etc." value={additionalCosts} onChange={(e) => setAdditionalCosts(parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="rounded-md bg-muted p-3 text-right">
                        <p className="text-sm text-muted-foreground">Coût de revient total : <span className="font-bold text-foreground">{new Intl.NumberFormat('fr-FR').format(finalTotalCost)} F</span></p>
                        <p className="text-sm text-muted-foreground">Coût de revient unitaire : <span className="font-bold text-foreground">{new Intl.NumberFormat('fr-FR').format(unitCost)} F</span></p>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 pt-4">
                        <Label htmlFor="isPaid" className="text-right col-span-3">
                            Payer maintenant (mouvementer la trésorerie)
                        </Label>
                        <Switch id="isPaid" checked={isPaid} onCheckedChange={setIsPaid} />
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
