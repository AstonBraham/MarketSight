
'use client';

import { useState, useEffect } from 'react';
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
import { SlidersHorizontal, CalendarIcon, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileMoney } from '@/context/mobile-money-context';
import type { MobileMoneyProvider } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Textarea } from '../ui/textarea';

type AdjustMobileMoneyBalanceDialogProps = {
    provider: MobileMoneyProvider;
    currentBalance: number;
}

const safeEvaluate = (expression: string): number | null => {
    if (!expression || !/^[\d\s\+\-\.]+$/.test(expression)) {
        return null;
    }
    try {
        const sanitized = expression.replace(/\s+/g, ' ');
        const result = new Function(`return ${sanitized}`)();
        if (typeof result === 'number' && isFinite(result)) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Safe evaluation failed:", error);
        return null;
    }
};

export function AdjustMobileMoneyBalanceDialog({ provider, currentBalance }: AdjustMobileMoneyBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calculation, setCalculation] = useState('');
  const { toast } = useToast();
  const { addTransaction } = useMobileMoney();

  useEffect(() => {
    if (calculation) {
      const result = safeEvaluate(calculation);
      if (result !== null) {
          setAmount(String(result));
      }
    }
  }, [calculation]);

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

    addTransaction({
        type: 'adjustment',
        provider,
        amount: adjustmentAmount,
        commission: 0,
        description: description,
        date: date.toISOString()
    });

    toast({
        title: 'Solde Ajusté',
        description: `Un ajustement de ${new Intl.NumberFormat('fr-FR').format(adjustmentAmount)} F a été appliqué au solde ${provider}.`,
    });
    setOpen(false);
    setAmount('');
    setDescription('');
    setCalculation('');
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
            <DialogTitle>Ajustement de Solde Mobile Money ({provider})</DialogTitle>
            <DialogDescription>
              Saisissez un montant pour corriger le solde. Utilisez un montant positif pour ajouter, négatif pour retirer.
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
                <Label htmlFor="calculation" className="flex items-center gap-2"><Calculator className="h-4 w-4 text-muted-foreground"/> Détail du calcul (optionnel)</Label>
                 <Input 
                    id="calculation" 
                    name="calculation"
                    placeholder="Ex: 100000 + 50000 - 10000"
                    value={calculation}
                    onChange={(e) => setCalculation(e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="amount">Montant de l'Ajustement</Label>
                <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    placeholder="Ex: 20000 ou -15000" 
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
                    placeholder="Ex: Frais de maintenance de compte"
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
