
'use client';

import type { Transaction, AirtimeTransaction, MobileMoneyTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ShoppingCart, Truck, Banknote, SlidersHorizontal, Smartphone, Send, Repeat, HandCoins, Wifi, Receipt, FileCheck2, SquareArrowOutUpRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

type HistoryTransaction = Transaction & { 
    source?: string, 
    link?: string, 
    phoneNumber?: string, 
    transactionId?: string,
    affectsCash?: boolean,
};


const getIconAndStyle = (type: string) => {
    switch (type) {
        case 'sale': return { icon: <ShoppingCart className="mr-1 h-3 w-3" />, style: 'bg-green-100 text-green-700 hover:bg-green-200' };
        case 'Vente Wifi': return { icon: <Wifi className="mr-1 h-3 w-3" />, style: 'bg-sky-100 text-sky-700 hover:bg-sky-200' };
        case 'Vente Airtime': return { icon: <Smartphone className="mr-1 h-3 w-3" />, style: 'bg-blue-100 text-blue-700 hover:bg-blue-200' };
        case 'Facture': return { icon: <Receipt className="mr-1 h-3 w-3" />, style: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' };
        
        case 'purchase': return { icon: <Truck className="mr-1 h-3 w-3" />, style: 'bg-red-100 text-red-700 hover:bg-red-200' };
        case 'Achat Airtime': return { icon: <Smartphone className="mr-1 h-3 w-3" />, style: 'bg-red-100 text-red-700 hover:bg-red-200' };
        
        case 'expense': return { icon: <Banknote className="mr-1 h-3 w-3" />, style: 'bg-orange-100 text-orange-700 hover:bg-orange-200' };
        
        case 'deposit': return { icon: <ArrowDown className="mr-1 h-3 w-3" />, style: 'bg-teal-100 text-teal-700 hover:bg-teal-200' };
        case 'withdrawal': return { icon: <ArrowUp className="mr-1 h-3 w-3" />, style: 'bg-pink-100 text-pink-700 hover:bg-pink-200' };
        case 'MM Purchase': return { icon: <ShoppingCart className="mr-1 h-3 w-3" />, style: 'bg-blue-100 text-blue-700 hover:bg-blue-200' };
        case 'MM Commission': return { icon: <HandCoins className="mr-1 h-3 w-3" />, style: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' };
        case 'MM Transfer': return { icon: <Repeat className="mr-1 h-3 w-3" />, style: 'bg-purple-100 text-purple-700 hover:bg-purple-200' };
        
        case 'adjustment': return { icon: <SlidersHorizontal className="mr-1 h-3 w-3" />, style: 'border-orange-500 text-orange-600' };
        case 'closing': return { icon: <FileCheck2 className="mr-1 h-3 w-3" />, style: 'border-gray-500 text-gray-600' };

        default: return { icon: null, style: 'bg-gray-100 text-gray-700' };
    }
}


export const columns: ColumnDef<HistoryTransaction>[] = [
  {
    accessorKey: 'date',
    header: 'Heure',
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <span>{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
    }
  },
   {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const source = row.original.source;
      if (!source) return <Badge variant="secondary">Caisse</Badge>;

      let style = 'border-gray-500';
      if (source.includes('Moov')) style = 'border-blue-500 text-blue-600';
      else if (source.includes('Yas')) style = 'border-yellow-500 text-yellow-600';
      else if (source.includes('Flooz')) style = 'border-blue-500 text-blue-600';
      else if (source.includes('Mixx')) style = 'border-yellow-500 text-yellow-600';
      else if (source.includes('Coris')) style = 'border-red-500 text-red-600';

      return <Badge variant="outline" className={cn('whitespace-nowrap', style)}>{source}</Badge>;
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const { icon, style } = getIconAndStyle(type);
        return <Badge variant='default' className={cn('whitespace-nowrap', style)}>{icon}{type}</Badge>;
    }
  },
  {
    accessorKey: 'description',
    header: 'Description & Détails',
     cell: ({ row }) => {
        const transaction = row.original;
        const description = transaction.description;
        const link = transaction.link;
        const phoneNumber = transaction.phoneNumber;
        const transactionId = transaction.transactionId;
        
        return (
            <div>
                <div className="flex items-center">
                   <span className="font-medium">{description}</span>
                    {link && (
                        <Button asChild variant="link" size="icon" className="h-5 w-5 ml-1">
                            <Link href={link} target="_blank">
                                <SquareArrowOutUpRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    )}
                </div>
                 {(phoneNumber || transactionId) && (
                    <div className="text-xs text-muted-foreground font-mono">
                        {phoneNumber && <span>{phoneNumber}</span>}
                        {phoneNumber && transactionId && <span> / </span>}
                        {transactionId && <span>{transactionId}</span>}
                    </div>
                )}
            </div>
        )
     }
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(amount));

      const isCredit = amount >= 0;
      const colorClass = isCredit ? 'text-green-600' : 'text-red-600';
      const sign = isCredit ? '+' : '-';

      return <div className={cn("text-right font-mono font-semibold", colorClass)}>{sign}{formatted} F</div>;
    },
  },
  {
    id: 'affectsCash',
    header: () => <div className="text-center">Impact Caisse</div>,
    cell: ({ row }) => {
        const { affectsCash } = row.original;
        if (!affectsCash) return null;

        return (
            <div className="flex justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
        );
    }
  },
];
