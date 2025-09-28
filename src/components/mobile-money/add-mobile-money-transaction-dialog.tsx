
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
  const { addAdjustment } = useTransactions();
  
  const [type, setType] = useState<MobileMoneyTransactionType | ''>('');
  const [amount, setAmount] = useState(0);
  const [commission, setCommission] = useState(0);
  const [isCommissionManual, setIsCommissionManual] = useState(false);
  const [affectsCash, setAffectsCash] = useState(false);

  useEffect(() => {
    if (!open) {
        // Reset form state when dialog closes
        setAmount(0);
        setCommission(0);
        setType('');
        setAffectsCash(false);
        setIsCommissionManual(false);
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
        // If we switch to manual, don't reset a user-entered commission
        if (commission === calculatedCommission) {
          setCommission(0);
        }
      }

    } else {
        setCommission(0);
        setIsCommissionManual(false);
    }
  }, [amount, type, provider]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const transactionAmount = parseFloat(data.amount as string);
    const currentBalance = getBalance(provider);

    if (type === 'withdrawal' || type === 'transfer_to_pos') {
        if (transactionAmount > currentBalance) {
            toast({
                title: 'Solde virtuel insuffisant',
                description: `Le solde ${provider} est de ${new Intl.NumberFormat('fr-FR').format(currentBalance)} F. Opération impossible.`,
                variant: 'destructive',
            });
            return;
        }
    }

    addTransaction({
        transactionId: data.transactionId as string,
        type: type as MobileMoneyTransactionType,
        provider: provider,
        amount: transactionAmount,
        commission: parseFloat(data.commission as string) || 0,
        phoneNumber: (data.phoneNumber as string || '').replace(/\s+/g, ''),
        affectsCash: affectsCash
    });
    
    toast({
      title: 'Opération Ajoutée',
      description: `La nouvelle opération pour ${provider} a été enregistrée.`,
    });
    setOpen(false);
  };

  const showCommissionField = type === 'deposit' || type === 'withdrawal';
  const showPhoneNumber = type !== 'collect_commission' && type !== 'purchase' && type !== 'virtual_return' && type !== 'adjustment' ;
  const showAffectsCashSwitch = type === 'transfer_to_pos' || type === 'transfer_from_pos';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Opération</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
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
              <Input id="transactionId" name="transactionId" className="col-span-3" placeholder="Référence de la transaction" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" required onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} min="0"/>
            </div>
            <div className={cn("grid grid-cols-4 items-center gap-4", showCommissionField ? "grid" : "hidden")}>
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder={isCommissionManual ? "Saisie manuelle" : "Calcul automatique"} value={commission} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} readOnly={!isCommissionManual} required={showCommissionField}/>
            </div>
             {showPhoneNumber && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
                <Input id="phoneNumber" name="phoneNumber" className="col-span-3" placeholder="Numéro du client ou PDV" />
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
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
