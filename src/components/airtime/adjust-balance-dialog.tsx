
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
import { useAirtime } from '@/context/airtime-context';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Textarea } from '../ui/textarea';

type AdjustBalanceDialogProps = {
    provider: 'Moov' | 'Yas';
    currentBalance: number;
}

export function AdjustBalanceDialog({ provider, currentBalance }: AdjustBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { addTransaction } = useAirtime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjustmentAmount = parseFloat(amount);

    if (isNaN(adjustmentAmount) || adjustmentAmount === 0) {
        toast({ title: 'Erreur', description: 'Veuillez saisir un montant d\'ajustement valide et non nul.', variant: 'destructive' });
        return;
    }
     if (!date) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une date.', variant: 'destructive' });
      return;
    }
    if (!description) {
        toast({ title: 'Erreur', description: 'Veuillez saisir une description pour l\'ajustement.', variant: 'destructive' });
        return;
    }

    addTransaction({
        type: 'adjustment',
        provider,
        amount: adjustmentAmount,
        commission: 0,
        description: description,
        date: date.toISOString()
    });

    toast({
        title: 'Ajustement de Stock Enregistré',
        description: `Un ajustement de ${new Intl.NumberFormat('fr-FR').format(adjustmentAmount)} F a été appliqué au stock Airtime ${provider}.`,
    });
    setOpen(false);
    setAmount('');
    setDescription('');
    setDate(new Date());
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Ajuster le Solde</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajustement de Stock Airtime ({provider})</DialogTitle>
            <DialogDescription>
              Saisissez un montant pour corriger le stock. Utilisez un montant positif pour ajouter, négatif pour retirer.
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
                    placeholder="Ex: 5000 ou -2500" 
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
                    placeholder="Ex: Correction commission spéciale"
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
