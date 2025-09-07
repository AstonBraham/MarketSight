
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CashFilterType = 'all' | 'cash_only' | 'no_cash';

export default function TransactionsAuditPage() {
  const { getAllHistory } = useTransactions();
  const [cashFilter, setCashFilter] = useState<CashFilterType>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { allHistory, uniqueSources, uniqueTypes } = useMemo(() => {
    const history = getAllHistory();
    const sources = [...new Set(history.map(t => t.source || 'Caisse'))].sort();
    const types = [...new Set(history.map(t => t.type))].sort();
    return { allHistory: history, uniqueSources: sources, uniqueTypes: types };
  }, [getAllHistory]);

  const filteredHistory = useMemo(() => {
    return allHistory.filter(t => {
      // Cash Filter
      let cashMatch = true;
      if (cashFilter === 'cash_only') {
        cashMatch = !!t.affectsCash;
      } else if (cashFilter === 'no_cash') {
        cashMatch = !t.affectsCash;
      }

      // Source Filter
      const sourceMatch = sourceFilter === 'all' || (t.source || 'Caisse') === sourceFilter;

      // Type Filter
      const typeMatch = typeFilter === 'all' || t.type === typeFilter;
      
      // We always exclude pure stock movements from the default "all cash" view unless filtered specifically
      if (cashFilter === 'all' && t.type === 'Mouvement Stock') return false;

      return cashMatch && sourceMatch && typeMatch;
    });
  }, [allHistory, cashFilter, sourceFilter, typeFilter]);


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
            <div className="flex flex-col md:flex-row gap-4 items-center p-4 border rounded-lg bg-muted/50">
                <RadioGroup defaultValue="all" onValueChange={(value) => setCashFilter(value as CashFilterType)} className="flex items-center gap-4">
                    <Label className="font-semibold">Trésorerie:</Label>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">Toutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash_only" id="cash_only" />
                        <Label htmlFor="cash_only">Avec impact</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no_cash" id="no_cash" />
                        <Label htmlFor="no_cash">Sans impact</Label>
                    </div>
                </RadioGroup>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Label htmlFor="sourceFilter">Source:</Label>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger id="sourceFilter" className="w-[180px]">
                            <SelectValue placeholder="Filtrer par source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les sources</SelectItem>
                            {uniqueSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center gap-2">
                    <Label htmlFor="typeFilter">Type:</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger id="typeFilter" className="w-[200px]">
                            <SelectValue placeholder="Filtrer par type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DataTable data={filteredHistory} columns={columns} filterColumn="description" filterPlaceholder="Filtrer par description..." />
        </CardContent>
      </Card>
    </div>
  );
}

