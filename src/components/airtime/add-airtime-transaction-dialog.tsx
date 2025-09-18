
'use client';

import { useState, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandList, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAirtime } from '@/context/airtime-context';
import { cn } from '@/lib/utils';

type AddAirtimeTransactionDialogProps = {
    provider: 'Moov' | 'Yas';
}

export function AddAirtimeTransactionDialog({ provider }: AddAirtimeTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { addTransaction, getStock, transactions } = useAirtime();
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const customerPhoneNumbers = useMemo(() => {
    const uniqueNumbers = new Set(transactions.map(t => t.phoneNumber).filter(Boolean));
    return Array.from(uniqueNumbers);
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const type = data.type as 'purchase' | 'sale' | 'commission';
    const amount = parseFloat(data.amount as string) || 0;

    if (type === 'sale') {
      const currentStock = getStock(provider);
      if (amount > currentStock) {
        toast({
          title: 'Stock Airtime Insuffisant',
          description: `Le stock ${provider} est de ${new Intl.NumberFormat('fr-FR').format(currentStock)} F. Vous ne pouvez pas vendre pour ${new Intl.NumberFormat('fr-FR').format(amount)} F.`,
          variant: 'destructive',
        });
        return;
      }
    }

    addTransaction({
        type: type,
        provider: provider,
        amount: amount,
        commission: data.commission ? parseFloat(data.commission as string) : 0,
        phoneNumber: phoneNumber,
        transactionId: (data.transactionId as string) || ''
    });

    toast({
        title: 'Transaction Airtime Ajoutée',
        description: `La nouvelle transaction pour ${provider} a été enregistrée.`,
    });
    setOpen(false);
    setPhoneNumber('');
  };
  
  const handleNumericInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
  };
  
   const handleSelectPhoneNumber = (number: string) => {
    setPhoneNumber(number);
    setPopoverOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle Transaction Airtime ({provider})</DialogTitle>
            <DialogDescription>
              Saisissez les détails de la transaction.
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
                        <SelectItem value="purchase">Achat</SelectItem>
                        <SelectItem value="sale">Vente</SelectItem>
                        <SelectItem value="commission">Commission sur Vente</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Montant</Label>
              <Input id="amount" name="amount" type="number" className="col-span-3" placeholder="0 (non requis pour commission)" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="text-right">Commission</Label>
              <Input id="commission" name="commission" type="number" className="col-span-3" placeholder="0" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Numéro Tél.</Label>
               <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="col-span-3">
                       <Command>
                          <CommandInput 
                            placeholder="Saisir ou chercher..."
                            value={phoneNumber}
                            onValueChange={handleNumericInput}
                            onFocus={() => setPopoverOpen(true)}
                          />
                        </Command>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                       <CommandList>
                          <CommandEmpty>Aucun numéro trouvé.</CommandEmpty>
                          <CommandGroup>
                            {customerPhoneNumbers.map((num) => (
                              <CommandItem
                                key={num}
                                value={num}
                                onSelect={() => handleSelectPhoneNumber(num)}
                              >
                                {num}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
