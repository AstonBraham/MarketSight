
'use client';

import { useState, useTransition, useMemo } from 'react';
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
import { PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getExpenseCategory } from '@/app/expenses/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import type { Transaction } from '@/lib/types';

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { addExpense, getAllTransactions } = useTransactions();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const currentBalance = useMemo(() => {
    const allTransactions = getAllTransactions();
    let balance = 0;
    const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(t => {
      if (t.type === 'sale') {
        balance += t.amount;
      } else if (t.type === 'purchase' || t.type === 'expense') {
        balance -= t.amount;
      } else if (t.type === 'adjustment') {
        balance += t.amount;
      }
    });
    return balance;
  }, [getAllTransactions, open]); // Recalculate when dialog opens


  const handleCategorize = async () => {
    if (!description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une description.',
        variant: 'destructive',
      });
      return;
    }
    const formData = new FormData();
    formData.append('description', description);
    
    startTransition(async () => {
      const result = await getExpenseCategory(formData);
      if (result.error) {
        toast({
          title: 'Erreur IA',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.data?.category) {
        setCategory(result.data.category);
        toast({
          title: 'Catégorisation Réussie',
          description: `Catégorie suggérée : ${result.data.category}`,
        });
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (!description || !category || isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Données invalides', description: 'Veuillez remplir tous les champs correctement.', variant: 'destructive'});
      return;
    }

    if (numericAmount > currentBalance) {
      toast({
        title: 'Solde de caisse insuffisant',
        description: `Votre solde de caisse est de ${new Intl.NumberFormat('fr-FR').format(currentBalance)} F. Vous ne pouvez pas enregistrer une dépense de ${new Intl.NumberFormat('fr-FR').format(numericAmount)} F.`,
        variant: 'destructive',
      });
      return;
    }

    addExpense({
      description,
      category,
      amount: numericAmount,
    });
    
    toast({
      title: 'Dépense Ajoutée',
      description: 'La nouvelle dépense a été enregistrée et déduite de la trésorerie.',
    });
    setOpen(false);
    // Reset form
    setDescription('');
    setCategory('');
    setAmount('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une dépense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle Dépense</DialogTitle>
            <DialogDescription>
              Saisissez les détails de la dépense. Utilisez l'IA pour la
              catégoriser automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Ex: Facture électricité Janvier 2025"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
             <Button type="button" variant="outline" size="sm" onClick={handleCategorize} disabled={isPending || !description}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Catégoriser avec l'IA
            </Button>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} className="col-span-3" placeholder="Ex: Utilitaires" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
