
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransactions } from '@/context/transaction-context';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CashflowChart() {
  const { getAllTransactions } = useTransactions();
  const allTransactions = getAllTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { Entrées: number, Sorties: number } } = {};
    const today = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(today, 5));

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthName = format(date, 'MMM', { locale: fr });
      data[monthName] = { Entrées: 0, Sorties: 0 };
    }

    allTransactions.forEach(t => {
      const transactionDate = new Date(t.date);
      // Check if the transaction is within the last 6 months
      if (transactionDate >= sixMonthsAgo) {
        const monthName = format(transactionDate, 'MMM', { locale: fr });

        if (data[monthName]) {
          if (t.type === 'sale' || (t.type === 'adjustment' && t.amount > 0)) {
            data[monthName].Entrées += t.amount;
          } else if (t.type === 'purchase' || t.type === 'expense' || (t.type === 'adjustment' && t.amount < 0)) {
            data[monthName].Sorties += Math.abs(t.amount);
          }
        }
      }
    });

    return Object.keys(data).map(name => ({
      name,
      Entrées: data[name].Entrées,
      Sorties: data[name].Sorties,
    }));

  }, [allTransactions]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Flux de Trésorerie</CardTitle>
        <CardDescription>Entrées vs Sorties sur les 6 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} unit="F" tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                   formatter={(value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' F'}
                />
                <Legend />
                <Bar
                  dataKey="Entrées"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Sorties"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
