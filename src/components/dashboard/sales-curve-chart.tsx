
'use client';

import {
  Line,
  LineChart,
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

export function SalesCurveChart() {
  const { sales } = useTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { name: string, Ventes: number } } = {};
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthYear = format(date, 'yyyy-MM');
        const monthName = format(date, 'MMM yy', { locale: fr });
        if (!data[monthYear]) {
            data[monthYear] = { name: monthName, Ventes: 0 };
        }
    }

    // Process sales data
    sales.forEach(t => {
      const transactionDate = new Date(t.date);
      const monthYear = format(transactionDate, 'yyyy-MM');
      if (data[monthYear]) {
        data[monthYear].Ventes += t.amount;
      }
    });

    return Object.values(data);

  }, [sales]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Courbe des Ventes (12 derniers mois)</CardTitle>
        <CardDescription>Évolution du chiffre d'affaires mensuel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
                <Line
                  type="monotone"
                  dataKey="Ventes"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{
                    fill: "hsl(var(--chart-1))",
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
