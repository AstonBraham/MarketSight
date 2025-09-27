
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/mobile-money/columns';
import { useMobileMoney } from '@/context/mobile-money-context';
import { AddMobileMoneyTransactionDialog } from '@/components/mobile-money/add-mobile-money-transaction-dialog';
import { AdjustMobileMoneyBalanceDialog } from '@/components/mobile-money/adjust-mobile-money-balance-dialog';
import { useMemo, useState, useEffect } from 'react';
import type { MobileMoneyTransactionType } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useTransactions } from '@/context/transaction-context';

type TransactionFilter = "all" | "deposit" | "withdrawal" | "transfer" | "purchase" | "other";

export default function MobileMoneyCorisPage() {
    const { transactions, getBalance, getProcessedTransactions } = useMobileMoney();
    const { getLastClosingDate } = useTransactions();
    const [isClient, setIsClient] = useState(false);
    const [filter, setFilter] = useState<TransactionFilter>("all");

    useEffect(() => {
        setIsClient(true);
    }, []);

    const corisTransactions = useMemo(() => isClient ? transactions.filter(t => t.provider === 'Coris') : [], [isClient, transactions]);
    const corisBalance = useMemo(() => isClient ? getBalance('Coris') : 0, [isClient, getBalance, transactions]);
    const lastClosingDate = useMemo(() => isClient ? getLastClosingDate() : null, [isClient, getLastClosingDate]);

     const dailyDeposits = useMemo(() => {
        if (!isClient) return 0;
        return corisTransactions
            .filter(t => t.type === 'deposit' && (!lastClosingDate || new Date(t.date) > lastClosingDate))
            .reduce((acc, t) => acc + t.amount, 0);
    }, [isClient, corisTransactions, lastClosingDate]);

    const dailyWithdrawals = useMemo(() => {
        if (!isClient) return 0;
        return corisTransactions
            .filter(t => t.type === 'withdrawal' && (!lastClosingDate || new Date(t.date) > lastClosingDate))
            .reduce((acc, t) => acc + t.amount, 0);
    }, [isClient, corisTransactions, lastClosingDate]);

    const dailyCommissions = useMemo(() => {
        if (!isClient) return 0;
        return corisTransactions
            .filter(t => !lastClosingDate || new Date(t.date) > lastClosingDate)
            .reduce((acc, t) => acc + t.commission, 0);
    }, [isClient, corisTransactions, lastClosingDate]);
    
    const processedTransactions = useMemo(() => {
        if (!isClient) return [];
        return getProcessedTransactions('Coris');
    }, [isClient, getProcessedTransactions, corisTransactions]);
    
    const filteredTransactions = useMemo(() => {
        if (!isClient) return [];
        if (filter === "all") {
            return processedTransactions;
        }
        if (filter === "transfer") {
            return processedTransactions.filter(t => t.type === 'transfer_from_pos' || t.type === 'transfer_to_pos');
        }
        if (filter === 'other') {
            const mainTypes: MobileMoneyTransactionType[] = ['deposit', 'withdrawal', 'transfer_from_pos', 'transfer_to_pos', 'purchase'];
            return processedTransactions.filter(t => !mainTypes.includes(t.type));
        }
        return processedTransactions.filter(t => t.type === filter);

    }, [isClient, processedTransactions, filter]);


  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Gestion Mobile Money Coris" 
        action={
            <div className="flex items-center gap-2">
                <AdjustMobileMoneyBalanceDialog provider="Coris" currentBalance={corisBalance} />
                <AddMobileMoneyTransactionDialog provider="Coris"/>
            </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde Coris</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('fr-FR').format(corisBalance)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépôts du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+{new Intl.NumberFormat('fr-FR').format(dailyDeposits)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retraits du jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-{new Intl.NumberFormat('fr-FR').format(dailyWithdrawals)} F</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('fr-FR').format(dailyCommissions)} F</div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                 <div>
                    <CardTitle>Opérations Coris</CardTitle>
                    <CardDescription>Historique des transactions pour Coris.</CardDescription>
                 </div>
                 <div className="flex items-center gap-2">
                    <Label htmlFor="filter">Filtrer par type</Label>
                     <Select value={filter} onValueChange={(value) => setFilter(value as TransactionFilter)}>
                        <SelectTrigger className="w-[200px]" id="filter">
                            <SelectValue placeholder="Filtrer par type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les opérations</SelectItem>
                            <SelectItem value="deposit">Dépôts</SelectItem>
                            <SelectItem value="withdrawal">Retraits</SelectItem>
                            <SelectItem value="transfer">Transferts (PDV)</SelectItem>
                            <SelectItem value="purchase">Achat de virtuel</SelectItem>
                            <SelectItem value="other">Autres</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
            <DataTable 
              data={filteredTransactions} 
              columns={columns} 
              filterColumn="phoneNumber" 
              filterPlaceholder="Filtrer par numéro..."
            />
        </CardContent>
      </Card>
    </div>
  );
}
