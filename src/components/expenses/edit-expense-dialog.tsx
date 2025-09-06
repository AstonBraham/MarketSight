
'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { Edit, Sparkles, Loader2, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getExpenseCategory } from '@/app/expenses/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import type { Expense } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function EditExpenseDialog({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { updateExpense } = useTransactions();

  const [category, setCategory] = useState(expense.category || '');
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [date, setDate] = useState<Date | undefined>(new Date(expense.date));


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
    if (!description || !category || isNaN(numericAmount) || numericAmount <= 0 || !date) {
      toast({ title: 'Données invalides', description: 'Veuillez remplir tous les champs correctement.', variant: 'destructive'});
      return;
    }

    updateExpense(expense.id, {
      description,
      category,
      amount: numericAmount,
      date: date.toISOString(),
    });
    
    toast({
      title: 'Dépense Modifiée',
      description: 'La dépense a été mise à jour.',
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier la Dépense</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de la dépense.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={fr}
                    />
                    </PopoverContent>
                </Popover>
             </div>
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
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
