

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
import { Edit, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileMoney } from '@/context/mobile-money-context';
import type { MobileMoneyTransaction, MobileMoneyTransactionType } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type EditMobileMoneyTransactionDialogProps = {
    transaction: MobileMoneyTransaction;
}

export function EditMobileMoneyTransactionDialog({ transaction }: EditMobileMoneyTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { updateTransaction } = useMobileMoney();
  
  const [type, setType] = useState<MobileMoneyTransactionType | ''>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount);
  const [commission, setCommission] = useState(transaction.commission);
  const [isCommissionManual, setIsCommissionManual] = useState(true);
  const [affectsCash, setAffectsCash] = useState(transaction.affectsCash ?? false);
  const [date, setDate] = useState<Date | undefined>(new Date(transaction.date));


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const transactionAmount = parseFloat(data.amount as string);

     if (!date) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner une date.', variant: 'destructive' });
        return;
    }

    updateTransaction(transaction.id, {
        date: date.toISOString(),
        transactionId: data.transactionId as string,
        type: type as MobileMoneyTransactionType,
        provider: transaction.provider,
        amount: transactionAmount,
        commission: parseFloat(data.commission as string) || 0,
        phoneNumber: (data.phoneNumber as string).replace(/\s+/g, ''),
        affectsCash: affectsCash
    });
    
    toast({
      title: 'Opération Modifiée',
      description: `L'opération pour ${transaction.provider} a été mise à jour.`,
    });
    setOpen(false);
  };

  const showCommissionField = type === 'deposit' || type === 'withdrawal';
  const showPhoneNumber = type !== 'collect_commission' && type !== 'purchase' && type !== 'virtual_return' && type !== 'adjustment' ;
  const showAffectsCashSwitch = type === 'transfer_to_pos' || type === 'transfer_from_pos';

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
            <DialogTitle>Modifier l'Opération Mobile Money ({transaction.provider})</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de l'opération.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="col-span-3 justify-start text-left font-normal"
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
              <Input id="transactionId" name="transactionId" className="col-span-3" placeholder="Référence de la transaction" required defaultValue={transaction.transactionId}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0" required value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} min="0"/>
            </div>
            <div className={cn("grid grid-cols-4 items-center gap-4", showCommissionField ? "grid" : "hidden")}>
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder={isCommissionManual ? "Saisie manuelle" : "Calcul automatique"} value={commission} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} readOnly={!isCommissionManual} required={showCommissionField}/>
            </div>
             {showPhoneNumber && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
                <Input id="phoneNumber" name="phoneNumber" defaultValue={transaction.phoneNumber} className="col-span-3" placeholder="Numéro du client ou PDV" />
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
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
