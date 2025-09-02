
'use client';

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19B2FF', '#F44336', '#4CAF50', '#9C27B0'];

export function SalesBreakdownChart() {
  const { sales } = useTransactions();

  const salesByCategory = useMemo(() => {
    const data: { [key: string]: number } = {};

    sales.forEach(sale => {
      const category = sale.itemType || 'Non catégorisé';
      if (!data[category]) {
        data[category] = 0;
      }
      data[category] += sale.amount;
    });

    let processedData = Object.keys(data)
      .map(name => ({ name, value: data[name] }))
      .sort((a, b) => b.value - a.value);

    if (processedData.length > 9) {
      const top9 = processedData.slice(0, 9);
      const othersValue = processedData.slice(9).reduce((acc, item) => acc + item.value, 0);
      processedData = [...top9, { name: 'Autres', value: othersValue }];
    }

    return processedData;

  }, [sales]);

  if (salesByCategory.length === 0) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline">Répartition des Ventes</CardTitle>
                <CardDescription>Par famille de produits</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full flex items-center justify-center text-muted-foreground">
                    Aucune donnée de vente pour afficher le graphique.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Répartition des Ventes</CardTitle>
        <CardDescription>Par famille de produits (Toutes périodes)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: number, name: string) => [`${new Intl.NumberFormat('fr-FR').format(value)} F`, name]}
                />
                 <Legend />
                <Pie
                  data={salesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(entry) => `${Math.round((entry.percent || 0) * 100)}%`}
                  labelLine={false}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
