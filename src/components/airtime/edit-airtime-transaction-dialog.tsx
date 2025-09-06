
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
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAirtime } from '@/context/airtime-context';
import type { AirtimeTransaction } from '@/lib/types';
import { DropdownMenuItem } from '../ui/dropdown-menu';

type EditAirtimeTransactionDialogProps = {
    transaction: AirtimeTransaction;
}

export function EditAirtimeTransactionDialog({ transaction }: EditAirtimeTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updateTransaction } = useAirtime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    updateTransaction(transaction.id, {
        type: data.type as 'purchase' | 'sale' | 'commission',
        provider: transaction.provider,
        amount: parseFloat(data.amount as string) || 0,
        commission: data.commission ? parseFloat(data.commission as string) : 0,
        phoneNumber: data.phoneNumber as string,
        transactionId: data.transactionId as string
    });

    toast({
        title: 'Transaction Modifiée',
        description: `La transaction pour ${transaction.provider} a été mise à jour.`,
    });
    setOpen(false);
  };
  
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier Transaction Airtime ({transaction.provider})</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de la transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select name="type" required defaultValue={transaction.type}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="purchase">Achat</SelectItem>
                        <SelectItem value="sale">Vente</SelectItem>
                        <SelectItem value="commission">Commission sur Vente</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" defaultValue={transaction.amount} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder="0" defaultValue={transaction.commission} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" onChange={handleNumericInput} className="col-span-3" placeholder="Numéro de téléphone" defaultValue={transaction.phoneNumber} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionId" className="text-right">ID Transaction</Label>
              <Input id="transactionId" name="transactionId" onChange={handleNumericInput} className="col-span-3" placeholder="Référence de la transaction" defaultValue={transaction.transactionId} />
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
