
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTransactions } from '@/context/transaction-context';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';

const getInitials = (type: string, description: string): string => {
    switch (type) {
        case 'sale': return 'V';
        case 'purchase': return 'A';
        case 'expense': return 'D';
        case 'adjustment': return 'AJ';
        default: return description.charAt(0).toUpperCase();
    }
}

const getTransactionDetails = (transaction: Transaction) => {
    let name = transaction.description;
    let isCredit = false;

    if (transaction.type === 'sale') {
        isCredit = true;
    } else if (transaction.type === 'purchase') {
        isCredit = false;
    } else if (transaction.type === 'expense') {
        isCredit = false;
    } else if (transaction.type === 'adjustment') {
        isCredit = transaction.amount > 0;
    }
    
    return { name, isCredit };
}


export function RecentTransactions() {
  const { getAllTransactions } = useTransactions();
  
  const recentTransactions = useMemo(() => {
    return getAllTransactions().slice(0, 5);
  }, [getAllTransactions]);


  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Transactions Récentes</CardTitle>
        <CardDescription>
          Les 5 dernières transactions enregistrées.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.length > 0 ? recentTransactions.map((transaction) => {
            const { name, isCredit } = getTransactionDetails(transaction);
            const amount = Math.abs(transaction.amount);

            return (
              <div key={transaction.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {getInitials(transaction.type, name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{name}</p>
                   <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div
                  className={`ml-auto font-medium ${
                    isCredit ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isCredit ? '+' : '-'}
                  {new Intl.NumberFormat('fr-FR').format(amount)} F
                </div>
              </div>
            )
        }) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune transaction pour le moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
