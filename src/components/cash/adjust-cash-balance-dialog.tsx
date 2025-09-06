
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

type AdjustCashBalanceDialogProps = {
    currentBalance: number;
}

export function AdjustCashBalanceDialog({ currentBalance }: AdjustCashBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [realBalance, setRealBalance] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { addAdjustment } = useTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const realBalanceValue = parseFloat(realBalance);

    if (isNaN(realBalanceValue)) {
        toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide.', variant: 'destructive' });
        return;
    }
    
    if (!date) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une date.', variant: 'destructive' });
      return;
    }

    const adjustmentAmount = realBalanceValue - currentBalance;
    
    if (adjustmentAmount === 0) {
        toast({ title: 'Information', description: 'Aucun ajustement nécessaire, les soldes sont identiques.' });
        setOpen(false);
        return;
    }

    addAdjustment({
        amount: adjustmentAmount,
        description: 'Ajustement de caisse',
        date: date.toISOString(),
    });

    toast({
        title: 'Caisse Ajustée',
        description: `Un ajustement de ${new Intl.NumberFormat('fr-FR').format(adjustmentAmount)} F a été appliqué.`,
    });
    setOpen(false);
    setRealBalance('');
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
            <DialogTitle>Ajuster le Solde de Caisse</DialogTitle>
            <DialogDescription>
              Saisissez le solde physique réel de la caisse pour enregistrer un ajustement.
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
                <Label htmlFor="current-balance">Solde Actuel (calculé)</Label>
                <Input id="current-balance" value={new Intl.NumberFormat('fr-FR').format(currentBalance) + ' F'} readOnly />
             </div>
             <div className="space-y-2">
                <Label htmlFor="real-balance">Solde Réel (physique)</Label>
                <Input 
                    id="real-balance" 
                    name="realBalance" 
                    type="number" 
                    placeholder="Saisir le solde réel" 
                    value={realBalance}
                    onChange={(e) => setRealBalance(e.target.value)}
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
