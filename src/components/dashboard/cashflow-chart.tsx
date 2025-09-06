
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
  const { getAllTransactions, sales } = useTransactions();
  const allTransactions = getAllTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { Entrées: number, Sorties: number, Marge: number } } = {};
    
    const allRelevantTransactions = [...allTransactions, ...sales];

    allRelevantTransactions.forEach(t => {
        const transactionDate = new Date(t.date);
        const monthYear = format(transactionDate, 'yyyy-MM', { locale: fr });
        const monthName = format(transactionDate, 'MMM yy', { locale: fr });

        if (!data[monthYear]) {
            data[monthYear] = { name: monthName, Entrées: 0, Sorties: 0, Marge: 0 };
        }

        if (t.type === 'sale') {
            const sale = t as any;
            data[monthYear].Entrées += sale.amount;
            if (sale.margin !== undefined) {
                 data[monthYear].Marge += sale.margin;
            }
        } else if (t.type === 'adjustment' && t.amount > 0) {
            data[monthYear].Entrées += t.amount;
        } else if (t.type === 'purchase' || t.type === 'expense' || (t.type === 'adjustment' && t.amount < 0)) {
            data[monthYear].Sorties += Math.abs(t.amount);
        }
    });

    return Object.keys(data).sort().map(key => ({
      name: data[key].name,
      Entrées: data[key].Entrées,
      Sorties: data[key].Sorties,
      Marge: data[key].Marge,
    }));

  }, [allTransactions, sales]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Aperçu Financier Mensuel</CardTitle>
        <CardDescription>Entrées, Sorties et Marge sur toutes les périodes</CardDescription>
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
                 <Bar
                  dataKey="Marge"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
