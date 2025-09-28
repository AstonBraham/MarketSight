

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileMoney } from '@/context/mobile-money-context';
import type { MobileMoneyTransactionType, MobileMoneyProvider } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/context/transaction-context';

type AddMobileMoneyTransactionDialogProps = {
    provider: MobileMoneyProvider;
}

export function AddMobileMoneyTransactionDialog({ provider }: AddMobileMoneyTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addTransaction, getBalance } = useMobileMoney();
  
  const [type, setType] = useState<MobileMoneyTransactionType | ''>('');
  const [amount, setAmount] = useState(0);
  const [commission, setCommission] = useState(0);
  const [isCommissionManual, setIsCommissionManual] = useState(false);
  const [affectsCash, setAffectsCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (!open) {
        // Reset form state when dialog closes
        setAmount(0);
        setCommission(0);
        setType('');
        setAffectsCash(false);
        setIsCommissionManual(false);
        setPhoneNumber('');
        setTransactionId('');
    }
  }, [open]);

  useEffect(() => {
    if (type === 'deposit' || type === 'withdrawal') {
      let calculatedCommission = 0;
      let manual = false;

      if (provider === 'Mixx' && type === 'deposit') {
        if (amount <= 499) calculatedCommission = 0;
        else if (amount <= 5000) calculatedCommission = 14;
        else if (amount <= 15000) calculatedCommission = 36;
        else if (amount <= 20000) calculatedCommission = 73;
        else if (amount <= 50000) calculatedCommission = 73;
        else if (amount <= 100000) calculatedCommission = 146;
        else if (amount <= 200000) calculatedCommission = 219;
        else { manual = true; }
      } else if (provider === 'Mixx' && type === 'withdrawal') {
        if (amount <= 499) calculatedCommission = 21;
        else if (amount <= 5000) calculatedCommission = 21;
        else if (amount <= 15000) calculatedCommission = 65;
        else if (amount <= 20000) calculatedCommission = 65;
        else if (amount <= 50000) calculatedCommission = 146;
        else if (amount <= 100000) calculatedCommission = 329;
        else if (amount <= 200000) { 
            manual = true;
            calculatedCommission = 0; // "X" means manual input
        } else { 
            manual = true;
        }
      } else {
        manual = true;
      }
      
      setIsCommissionManual(manual);
      if (!manual) {
        setCommission(calculatedCommission);
      } else {
        if (commission === calculatedCommission) {
          setCommission(0);
        }
      }

    } else {
        setCommission(0);
        setIsCommissionManual(false);
    }
  }, [amount, type, provider]);


  const handleFinalSubmit = () => {
    const currentBalance = getBalance(provider);

    if (type === 'withdrawal' || type === 'transfer_to_pos') {
        if (amount > currentBalance) {
            toast({
                title: 'Solde virtuel insuffisant',
                description: `Le solde ${provider} est de ${new Intl.NumberFormat('fr-FR').format(currentBalance)} F. Opération impossible.`,
                variant: 'destructive',
            });
            return;
        }
    }

    addTransaction({
        transactionId: transactionId,
        type: type as MobileMoneyTransactionType,
        provider: provider,
        amount: amount,
        commission: commission || 0,
        phoneNumber: phoneNumber.replace(/\s+/g, ''),
        affectsCash: affectsCash
    });
    
    toast({
      title: 'Opération Ajoutée',
      description: `La nouvelle opération pour ${provider} a été enregistrée.`,
    });
    setOpen(false);
  };
  
  const formIsInvalid = !type || !transactionId || !amount;

  const showCommissionField = type === 'deposit' || type === 'withdrawal';
  const showPhoneNumber = type !== 'collect_commission' && type !== 'purchase' && type !== 'virtual_return' && type !== 'adjustment' ;
  const showAffectsCashSwitch = type === 'transfer_to_pos' || type === 'transfer_from_pos';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Opération</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Nouvelle Opération Mobile Money ({provider})</DialogTitle>
            <DialogDescription>
              Saisissez les détails de l'opération.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select name="type" required value={type} onValueChange={(value) => setType(value as any)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="deposit">Dépôt</SelectItem>
                        <SelectItem value="withdrawal">Retrait</SelectItem>
                        <SelectItem value="purchase">Achat de virtuel</SelectItem>
                        <SelectItem value="virtual_return">Retour de virtuel</SelectItem>
                        <SelectItem value="transfer_from_pos">Transfert depuis PDV</SelectItem>
                        <SelectItem value="transfer_to_pos">Transfert vers PDV</SelectItem>
                        <SelectItem value="collect_commission">Collecte Commission</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionId" className="text-right">ID Transaction</Label>
              <Input id="transactionId" name="transactionId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="col-span-3" placeholder="Référence de la transaction" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" required value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} min="0"/>
            </div>
            <div className={cn("grid grid-cols-4 items-center gap-4", showCommissionField ? "grid" : "hidden")}>
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder={isCommissionManual ? "Saisie manuelle" : "Calcul automatique"} value={commission || ''} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} readOnly={!isCommissionManual} required={showCommissionField}/>
            </div>
             {showPhoneNumber && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
                <Input id="phoneNumber" name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="col-span-3" placeholder="Numéro du client ou PDV" />
              </div>
             )}
            {showAffectsCashSwitch && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="affectsCash" className="text-right col-span-3">Mouvement de trésorerie ?</Label>
                    <Switch id="affectsCash" checked={affectsCash} onCheckedChange={setAffectsCash} />
                </div>
            )}
          </div>
          <DialogFooter>
             {showAffectsCashSwitch ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={formIsInvalid}>Enregistrer</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmation de l'opération</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette opération <span className="font-bold">{affectsCash ? "AFFECTERA" : "N'AFFECTERA PAS"}</span> la trésorerie.
                        <br/>
                        Voulez-vous continuer ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFinalSubmit}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button type="button" onClick={handleFinalSubmit} disabled={formIsInvalid}>Enregistrer</Button>
              )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
