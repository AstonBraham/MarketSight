
'use client';

import type { Sale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, CheckCircle, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useTransactions } from '@/context/transaction-context';
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


function ActionsCell({ row }: { row: { original: Sale }}) {
    const { returnSale } = useTransactions();
    const sale = row.original;

    if (!sale.inventoryId) return null; // Can't return a sale without inventory tracking

    return (
        <AlertDialog>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(sale.id)}
                >
                Copier l'ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10"
                        onSelect={(e) => e.preventDefault()}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retour / Annuler la vente
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer le retour ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action va annuler la vente. Le produit <strong>{sale.product} (x{sale.quantity})</strong> sera retourné en stock et le montant de <strong>{new Intl.NumberFormat('fr-FR').format(sale.amount)} F</strong> sera déduit de la caisse. Êtes-vous sûr ?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => returnSale(sale.id)} className="bg-destructive hover:bg-destructive/90">
                        Confirmer le Retour
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      );
}

export const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.date).toLocaleString('fr-FR'),
    },
    {
        accessorKey: 'product',
        header: 'Produit',
    },
    {
        accessorKey: 'quantity',
        header: () => <div className="text-right">Qté</div>,
        cell: ({ row }) => <div className="text-right">{row.original.quantity}</div>,
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
            <div className="text-right font-bold text-green-600">
                +{new Intl.NumberFormat('fr-FR').format(row.original.amount)} F
            </div>
        ),
    },
    {
        accessorKey: 'client',
        header: 'Client',
    },
    {
        accessorKey: 'itemType',
        header: 'Famille',
        cell: ({row}) => <Badge variant="outline">{row.original.itemType}</Badge>
    },
    {
        id: 'affectsCash',
        header: () => <div className="text-center">Impact Caisse</div>,
        cell: ({ row }) => {
        return (
            <div className="flex justify-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Cette opération a affecté la trésorerie.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
        }
    },
    {
        id: 'actions',
        cell: ActionsCell,
    },
];
