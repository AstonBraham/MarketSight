
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
import { SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileMoney } from '@/context/mobile-money-context';
import type { MobileMoneyProvider } from '@/lib/types';

type AdjustMobileMoneyBalanceDialogProps = {
    provider: MobileMoneyProvider;
    currentBalance: number;
}

export function AdjustMobileMoneyBalanceDialog({ provider, currentBalance }: AdjustMobileMoneyBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [realBalance, setRealBalance] = useState('');
  const { toast } = useToast();
  const { addTransaction } = useMobileMoney();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const realBalanceValue = parseFloat(realBalance);

    if (isNaN(realBalanceValue)) {
        toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide.', variant: 'destructive' });
        return;
    }

    const adjustmentAmount = realBalanceValue - currentBalance;
    
    if (adjustmentAmount === 0) {
        toast({ title: 'Information', description: 'Aucun ajustement nécessaire, les soldes sont identiques.' });
        setOpen(false);
        return;
    }

    addTransaction({
        type: 'adjustment',
        provider,
        amount: adjustmentAmount,
        commission: 0,
        description: `Ajustement de solde ${provider}`,
    });

    toast({
        title: 'Solde Ajusté',
        description: `Un ajustement de ${new Intl.NumberFormat('fr-FR').format(adjustmentAmount)} F a été appliqué.`,
    });
    setOpen(false);
    setRealBalance('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Ajuster le Solde</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajuster le Solde Mobile Money ({provider})</DialogTitle>
            <DialogDescription>
              Saisissez le solde réel de la plateforme pour calculer et appliquer l'ajustement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="current-balance">Solde Actuel (calculé)</Label>
                <Input id="current-balance" value={new Intl.NumberFormat('fr-FR').format(currentBalance) + ' F'} readOnly />
             </div>
             <div className="space-y-2">
                <Label htmlFor="real-balance">Solde Réel (plateforme)</Label>
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
            <Button type="submit">Calculer et Ajuster</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
