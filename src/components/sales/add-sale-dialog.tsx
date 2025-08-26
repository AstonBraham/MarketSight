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

export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const saleData = Object.fromEntries(formData.entries());
    
    console.log('Nouvelle vente:', saleData);
    
    toast({
      title: 'Vente Ajoutée',
      description: 'La nouvelle vente a été enregistrée avec succès.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle Vente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle Vente</DialogTitle>
            <DialogDescription>
              Saisissez les détails de la transaction de vente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Input id="client" name="client" className="col-span-3" placeholder="Nom du client" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Désignation
              </Label>
              <Input id="product" name="product" className="col-span-3" placeholder="Nom du produit" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Référence
              </Label>
              <Input id="reference" name="reference" className="col-span-3" placeholder="Référence article" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemType" className="text-right">
                Type d'article
              </Label>
              <Input id="itemType" name="itemType" className="col-span-3" placeholder="Ex: Boisson" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix
              </Label>
              <Input id="price" name="price" type="number" className="col-span-3" placeholder="0" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
              </Label>
              <Input id="quantity" name="quantity" type="number" className="col-span-3" placeholder="1" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer la Vente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
