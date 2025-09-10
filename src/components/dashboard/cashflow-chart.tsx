
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
import { format, subMonths, startOfMonth, getMonth, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CashflowChart() {
  const { getAllTransactions } = useTransactions();
  const allTransactions = getAllTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { name: string, Entrées: number, Sorties: number } } = {};
    
    allTransactions.forEach(t => {
      const transactionDate = new Date(t.date);
      const monthYear = format(transactionDate, 'yyyy-MM');
      const monthName = format(transactionDate, 'MMM yy', { locale: fr });

      if (!data[monthYear]) {
          data[monthYear] = { name: monthName, Entrées: 0, Sorties: 0 };
      }

      if (t.amount > 0) { // All positive amounts are entries
          data[monthYear].Entrées += t.amount;
      } else { // All negative amounts are exits
          data[monthYear].Sorties += Math.abs(t.amount);
      }
    });

    return Object.keys(data).sort().map(key => ({
      name: data[key].name,
      Entrées: data[key].Entrées,
      Sorties: data[key].Sorties,
    }));

  }, [allTransactions]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Aperçu Financier Mensuel</CardTitle>
        <CardDescription>Entrées et Sorties sur toutes les périodes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} unit="F" tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(value as number)} />
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
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Sorties"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
