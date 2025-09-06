
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/history/columns';
import { useTransactions } from '@/context/transaction-context';
import type { HistoryTransaction } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type FilterType = 'all' | 'cash_only' | 'no_cash';

export default function TransactionsAuditPage() {
  const { getAllHistory } = useTransactions();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allHistory = useMemo(() => {
    return getAllHistory();
  }, [getAllHistory]);

  const filteredHistory = useMemo(() => {
    if (filter === 'cash_only') {
      return allHistory.filter(t => t.affectsCash);
    }
    if (filter === 'no_cash') {
      return allHistory.filter(t => !t.affectsCash && t.type !== 'Mouvement Stock');
    }
    return allHistory.filter(t => t.type !== 'Mouvement Stock');
  }, [allHistory, filter]);


  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Audit de Toutes les Transactions" />
      <Card>
        <CardHeader>
          <CardTitle>Registre Complet des Opérations</CardTitle>
          <CardDescription>
            Consultez et filtrez l'ensemble des transactions enregistrées dans l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <RadioGroup defaultValue="all" onValueChange={(value) => setFilter(value as FilterType)} className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">Toutes les transactions</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash_only" id="cash_only" />
                    <Label htmlFor="cash_only">Affectant la trésorerie</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_cash" id="no_cash" />
                    <Label htmlFor="no_cash">N'affectant pas la trésorerie</Label>
                </div>
            </RadioGroup>
            <DataTable data={filteredHistory} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
