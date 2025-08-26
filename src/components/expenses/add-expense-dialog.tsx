'use client';

import { useState, useTransition } from 'react';
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

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

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
    // Logic to save the expense
    console.log('Expense saved');
    toast({
      title: 'Dépense Ajoutée',
      description: 'La nouvelle dépense a été enregistrée avec succès.',
    });
    setOpen(false);
    // Reset form
    setDescription('');
    setCategory('');
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
              />
            </div>
             <Button type="button" variant="outline" size="sm" onClick={handleCategorize} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Catégoriser avec l'IA
            </Button>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} className="col-span-3" placeholder="Ex: Utilitaires" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="col-span-3"
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
