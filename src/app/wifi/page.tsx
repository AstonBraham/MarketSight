
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from '@/components/data-table/data-table';
import { useTransactions } from '@/context/transaction-context';
import { useToast } from '@/hooks/use-toast';
import type { Sale } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';

const WIFI_TICKETS = [
  { name: 'Ticket 50F', price: 50 },
  { name: 'Ticket 100F', price: 100 },
  { name: 'Ticket 200F', price: 200 },
  { name: 'Ticket 500F', price: 500 },
  { name: 'Ticket 3000F', price: 3000 },
];

export const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleString('fr-FR'),
    },
    {
        accessorKey: 'product',
        header: 'Type de Ticket',
    },
    {
        accessorKey: 'quantity',
        header: 'Quantité',
    },
    {
        accessorKey: 'price',
        header: () => <div className="text-right">Prix Unitaire</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {new Intl.NumberFormat('fr-FR').format(row.original.price || 0)} F
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: () => <div className="text-right">Montant Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-bold">
                {new Intl.NumberFormat('fr-FR').format(row.original.amount)} F
            </div>
        ),
    },
];

export default function WifiPage() {
  const { addSale, sales } = useTransactions();
  const { toast } = useToast();
  const [selectedTicketPrice, setSelectedTicketPrice] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const selectedTicket = WIFI_TICKETS.find(t => t.price === parseInt(selectedTicketPrice, 10));
  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

  const wifiSales = useMemo(() => {
    return sales.filter(s => s.itemType === 'Ticket Wifi');
  }, [sales]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || quantity <= 0) {
      toast({
        title: 'Veuillez remplir tous les champs',
        description: 'Sélectionnez un type de ticket et une quantité valide.',
        variant: 'destructive',
      });
      return;
    }

    addSale({
      product: selectedTicket.name,
      price: selectedTicket.price,
      quantity: quantity,
      amount: totalAmount,
      client: 'Client Wifi',
      itemType: 'Ticket Wifi',
    });

    toast({
      title: 'Vente de ticket enregistrée',
      description: `${quantity} x ${selectedTicket.name} pour un total de ${totalAmount} F.`,
    });

    // Reset form
    setSelectedTicketPrice('');
    setQuantity(1);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Vente Tickets Wifi" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Vente</CardTitle>
              <CardDescription>Enregistrez une nouvelle vente de ticket Wifi.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-type">Type de Ticket</Label>
                  <Select value={selectedTicketPrice} onValueChange={setSelectedTicketPrice} required>
                    <SelectTrigger id="ticket-type">
                      <SelectValue placeholder="Sélectionner un ticket..." />
                    </SelectTrigger>
                    <SelectContent>
                      {WIFI_TICKETS.map(ticket => (
                        <SelectItem key={ticket.price} value={String(ticket.price)}>
                          {ticket.name} - {ticket.price} F
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} 
                    min="1"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                 <div className="text-2xl font-bold self-end">
                    Total: {new Intl.NumberFormat('fr-FR').format(totalAmount)} F
                  </div>
                <Button type="submit" className="w-full">Enregistrer la Vente</Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Ventes Wifi</CardTitle>
              <CardDescription>Liste de toutes les ventes de tickets enregistrées.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={wifiSales} columns={columns} filterColumn="product" filterPlaceholder="Filtrer par ticket..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
