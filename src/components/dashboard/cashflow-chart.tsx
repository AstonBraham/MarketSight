
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

const data = [
  { name: 'Jan', Entrées: 4000000, Sorties: 2400000 },
  { name: 'Fév', Entrées: 3000000, Sorties: 1398000 },
  { name: 'Mar', Entrées: 5000000, Sorties: 4800000 },
  { name: 'Avr', Entrées: 2780000, Sorties: 3908000 },
  { name: 'Mai', Entrées: 1890000, Sorties: 4800000 },
  { name: 'Juin', Entrées: 2390000, Sorties: 3800000 },
  { name: 'Juil', Entrées: 3490000, Sorties: 4300000 },
];

export function CashflowChart() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Prévision de Trésorerie</CardTitle>
        <CardDescription>Entrées vs Sorties sur les 6 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
