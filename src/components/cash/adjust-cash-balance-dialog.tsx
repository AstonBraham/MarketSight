
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
import { SlidersHorizontal, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Textarea } from '../ui/textarea';

type AdjustCashBalanceDialogProps = {
    currentBalance: number;
}

export function AdjustCashBalanceDialog({ currentBalance }: AdjustCashBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { addAdjustment } = useTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjustmentAmount = parseFloat(amount);

    if (isNaN(adjustmentAmount) || adjustmentAmount === 0) {
        toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide et non nul.', variant: 'destructive' });
        return;
    }
    
    if (!date) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une date.', variant: 'destructive' });
      return;
    }
    
    if (!description) {
      toast({ title: 'Erreur', description: 'Veuillez saisir une description.', variant: 'destructive' });
      return;
    }

    addAdjustment({
        amount: adjustmentAmount,
        description: description,
        date: date.toISOString(),
        category: 'Ajustement'
    });

    toast({
        title: 'Caisse Ajustée',
        description: `Un ajustement de ${new Intl.NumberFormat('fr-FR').format(adjustmentAmount)} F a été appliqué.`,
    });
    setOpen(false);
    setAmount('');
    setDescription('');
    setDate(new Date());
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Ajuster la Caisse</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvel Ajustement de Caisse</DialogTitle>
            <DialogDescription>
              Enregistrez une correction manuelle du solde de caisse. Utilisez un montant positif pour une entrée, négatif pour une sortie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="date">Date de l'ajustement</Label>
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
                <Label htmlFor="amount">Montant de l'Ajustement</Label>
                <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    placeholder="Ex: 10000 ou -5000" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Raison de l'ajustement</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Ex: Correction erreur de caisse"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
             </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer l'Ajustement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
