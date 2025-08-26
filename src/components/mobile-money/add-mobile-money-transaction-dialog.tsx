
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

type AddMobileMoneyTransactionDialogProps = {
    provider: 'Mixx' | 'Flooz';
}

export function AddMobileMoneyTransactionDialog({ provider }: AddMobileMoneyTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useMobileMoney();
  const [commission, setCommission] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    addTransaction({
        transactionId: data.transactionId as string,
        type: data.type as 'deposit' | 'withdrawal' | 'transfer',
        provider: provider,
        amount: parseFloat(data.amount as string),
        commission: commission, // Use state for commission
        phoneNumber: data.phoneNumber as string,
    });
    
    toast({
      title: 'Opération Ajoutée',
      description: `La nouvelle opération pour ${provider} a été enregistrée.`,
    });
    setOpen(false);
    setCommission(0);
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

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
                <Select name="type" required>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="deposit">Dépôt</SelectItem>
                        <SelectItem value="withdrawal">Retrait</SelectItem>
                        <SelectItem value="transfer">Transfert</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionId" className="text-right">ID Transaction</Label>
              <Input id="transactionId" name="transactionId" onChange={handleNumericInput} className="col-span-3" placeholder="Référence de la transaction" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder="Calcul automatique" value={commission} readOnly/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" onChange={handleNumericInput} className="col-span-3" placeholder="Numéro de téléphone" required/>
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
