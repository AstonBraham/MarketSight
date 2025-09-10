
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
  Line,
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
import type { Sale } from '@/lib/types';

export function CashflowChartLast6Months() {
  const { getAllTransactions, sales } = useTransactions();
  const allTransactions = getAllTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { name: string, Entrées: number, Sorties: number, Marge: number, "Ventes Produits": number } } = {};
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const date = subMonths(new Date(), i);
        const monthYear = format(date, 'yyyy-MM');
        const monthName = format(date, 'MMM yy', { locale: fr });
        if (!data[monthYear]) {
            data[monthYear] = { name: monthName, Entrées: 0, Sorties: 0, Marge: 0, "Ventes Produits": 0 };
        }
    }

    // Process cash flow (Entrées/Sorties)
    allTransactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate < sixMonthsAgo) return;

      const monthYear = format(transactionDate, 'yyyy-MM');
      if (data[monthYear]) {
        if (t.amount > 0) {
            data[monthYear].Entrées += t.amount;
        } else {
            data[monthYear].Sorties += Math.abs(t.amount);
        }
      }
    });

    // Process sales for "Ventes Produits" and "Marge"
    sales.forEach(sale => {
      const transactionDate = new Date(sale.date);
      if (transactionDate < sixMonthsAgo) return;

      const monthYear = format(transactionDate, 'yyyy-MM');
      if (data[monthYear]) {
        if (sale.inventoryId || sale.itemType === 'Ticket Wifi') {
            data[monthYear]["Ventes Produits"] += sale.amount;
        }
        if (sale.margin !== undefined) {
             data[monthYear].Marge += sale.margin;
        }
      }
    });

    return Object.keys(data).sort().map(key => data[key]);

  }, [allTransactions, sales]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Tendance Financière (6 derniers mois)</CardTitle>
        <CardDescription>Entrées, Sorties et Marge sur les 6 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} unit="F" tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(value as number)} />
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
                  yAxisId="left"
                  dataKey="Entrées"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="Sorties"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
                 <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="Ventes Produits" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
