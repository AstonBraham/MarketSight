

'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/history/columns';
import { useTransactions } from '@/context/transaction-context';
import type { Transaction } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function HistoryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { getDailyHistory, getAllHistory } = useTransactions();
  const [isClient, setIsClient] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { dailyHistory, uniqueSources } = useMemo(() => {
    const allHistoryForDay = date ? getDailyHistory(date) : [];
    
    const sources = [...new Set(allHistoryForDay.map(t => t.source || 'Caisse'))].sort();
    
    const filtered = allHistoryForDay.filter(t => {
        if (sourceFilter === 'all') return true;
        return (t.source || 'Caisse') === sourceFilter;
    });

    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { dailyHistory: sorted, uniqueSources: sources };
  }, [date, getDailyHistory, sourceFilter]);

  const stats = useMemo(() => {
    const income = dailyHistory.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const outcome = dailyHistory.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return {
        income,
        outcome,
        netFlow: income - outcome,
    }
  }, [dailyHistory]);

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Historique des Opérations du Jour" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
           <Card>
                <CardHeader>
                    <CardTitle>Filtres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal"
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
                     <div>
                        <Label>Source de la transaction</Label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les sources</SelectItem>
                                {uniqueSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">+{new Intl.NumberFormat('fr-FR').format(stats.income)} F</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">-{new Intl.NumberFormat('fr-FR').format(stats.outcome)} F</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flux Net</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {stats.netFlow >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(stats.netFlow)} F
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Détail des Opérations</CardTitle>
              <CardDescription>
                Toutes les transactions enregistrées pour le {date ? format(date, "PPP", { locale: fr }) : '...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={dailyHistory} columns={columns} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
