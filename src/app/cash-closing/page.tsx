
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useTransactions } from '@/context/transaction-context';
import { NewCashClosingDialog } from '@/components/cash-closing/new-cash-closing-dialog';
import { columns } from '@/components/cash-closing/columns';
import { DataTable } from '@/components/data-table/data-table';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';


export default function CashClosingPage() {
    const { getAllTransactions, cashClosings } = useTransactions();
    const allTransactions = getAllTransactions();

    const currentBalance = useMemo(() => {
        let balance = 0;
        const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const withBalance: Transaction[] = sorted.map(t => {
        if (t.type === 'sale') {
            balance += t.amount;
        } else if (t.type === 'purchase' || t.type === 'expense') {
            balance -= t.amount;
        } else if (t.type === 'adjustment') {
            balance += t.amount;
        }
        return { ...t, balance };
        });

        return withBalance.reverse()[0]?.balance || 0;
    }, [allTransactions]);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader 
                title="Arrêtés de Caisse" 
                action={<NewCashClosingDialog currentTheoreticalBalance={currentBalance} />} 
            />

            <Card>
                <CardHeader>
                    <CardTitle>Historique des Clôtures</CardTitle>
                    <CardDescription>Liste de tous les arrêtés de caisse effectués.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={cashClosings} columns={columns} />
                </CardContent>
            </Card>
        </div>
    );
}
