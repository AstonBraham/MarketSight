
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
import { useTransactions } from '@/context/transaction-context';
import { Textarea } from '@/components/ui/textarea';

export function AddCashEntryDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { addAdjustment } = useTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide et positif.', variant: 'destructive' });
      return;
    }
     if (!description) {
      toast({ title: 'Erreur', description: 'Veuillez saisir une description.', variant: 'destructive' });
      return;
    }

    addAdjustment({
      amount: numericAmount,
      description: description,
      category: 'Encaissement'
    });

    toast({
      title: 'Encaissement Enregistré',
      description: `Une entrée de ${new Intl.NumberFormat('fr-FR').format(numericAmount)} F a été ajoutée.`,
    });
    setOpen(false);
    setAmount('');
    setDescription('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary"><PlusCircle className="mr-2 h-4 w-4" /> Nouvel Encaissement</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un Encaissement</DialogTitle>
            <DialogDescription>
              Enregistrez une entrée de fonds qui n'est pas liée à une vente (ex: apport du propriétaire).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    placeholder="Saisir le montant" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                />
             </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Ex: Apport du propriétaire" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required 
                />
             </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer l'Encaissement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
