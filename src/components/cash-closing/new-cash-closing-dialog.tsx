
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { PlusCircle, AlertTriangle, CheckCircle, MinusCircle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';
import { useUser } from '@/context/user-context';
import { Textarea } from '@/components/ui/textarea';

type NewCashClosingDialogProps = {
    currentTheoreticalBalance: number;
}

export function NewCashClosingDialog({ currentTheoreticalBalance }: NewCashClosingDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { addCashClosing } = useTransactions();
  const [realBalance, setRealBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [calculation, setCalculation] = useState('');


  const variance = useMemo(() => {
    const real = parseFloat(realBalance);
    if (isNaN(real)) return 0;
    return real - currentTheoreticalBalance;
  }, [realBalance, currentTheoreticalBalance]);
  
  useEffect(() => {
    if (calculation) {
      try {
        const sum = calculation.split('+').reduce((acc, val) => acc + (parseFloat(val.trim()) || 0), 0);
        setRealBalance(String(sum));
      } catch (e) {
        // Silently fail as user might be typing
      }
    }
  }, [calculation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
        toast({ title: 'Erreur', description: 'Utilisateur non identifié.', variant: 'destructive' });
        return;
    }
    const realBalanceValue = parseFloat(realBalance);
    if (isNaN(realBalanceValue)) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant réel valide.', variant: 'destructive' });
      return;
    }

    addCashClosing({
        theoreticalBalance: currentTheoreticalBalance,
        realBalance: realBalanceValue,
        variance,
        notes,
        closedBy: user.name,
    });
    
    toast({
      title: 'Caisse Clôturée',
      description: `L'arrêté de caisse a été enregistré. Un ajustement de ${variance} F a été créé si nécessaire.`,
    });

    setRealBalance('');
    setNotes('');
    setCalculation('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Faire l'arrêté de caisse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvel Arrêté de Caisse</DialogTitle>
            <DialogDescription>
              Clôturez la journée en comparant le solde théorique au solde physique de la caisse.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="theoretical-balance">Solde Théorique (calculé)</Label>
                <Input id="theoretical-balance" value={`${new Intl.NumberFormat('fr-FR').format(currentTheoreticalBalance)} F`} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="calculation" className="flex items-center gap-2"><Calculator className="h-4 w-4 text-muted-foreground"/> Détail du comptage (optionnel)</Label>
                <Input
                    id="calculation"
                    placeholder="Ex: 50000 + 10000 + 5000 + ..."
                    value={calculation}
                    onChange={(e) => setCalculation(e.target.value)}
                 />
            </div>
            <div className="space-y-2">
                <Label htmlFor="real-balance">Solde Réel (physique)</Label>
                <Input 
                    id="real-balance" 
                    type="number"
                    placeholder="Saisir le montant compté"
                    value={realBalance}
                    onChange={(e) => setRealBalance(e.target.value)}
                    required
                 />
            </div>
            {realBalance && (
                <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${variance === 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                    {variance === 0 && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {variance > 0 && <MinusCircle className="h-5 w-5 text-green-600" />}
                    {variance < 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
                    <div>
                        <p className="font-bold">Écart : {new Intl.NumberFormat('fr-FR').format(variance)} F</p>
                        <p className="text-xs">
                            {variance === 0 && "Les comptes sont bons."}
                            {variance > 0 && "Il y a un excédent de caisse."}
                            {variance < 0 && "Il y a un manquant en caisse."}
                        </p>
                    </div>
                </div>
            )}
             <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                    id="notes" 
                    placeholder="Ex: Erreur de rendu de monnaie sur la vente X..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!realBalance}>Valider et Clôturer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
