
'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useTransactions } from '@/context/transaction-context';
import type { Sale } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { TrendingUp, Percent, ShoppingCart } from 'lucide-react';
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
import { format, subMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SalesBreakdownChart } from '@/components/dashboard/sales-breakdown-chart';

type ProfitableProduct = {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalMargin: number;
  totalQuantity: number;
  marginRate: number;
};

type SalesByCategory = {
  name: string;
  value: number;
};

const profitableProductsColumns: ColumnDef<ProfitableProduct>[] = [
    {
        accessorKey: 'productName',
        header: 'Produit',
        cell: ({ row }) => <div className="font-medium">{row.getValue('productName')}</div>
    },
    {
        accessorKey: 'totalQuantity',
        header: () => <div className="text-right">Quantité Vendue</div>,
        cell: ({ row }) => <div className="text-right font-mono">{row.getValue('totalQuantity')}</div>,
    },
    {
        accessorKey: 'totalRevenue',
        header: () => <div className="text-right">Chiffre d'Affaires</div>,
        cell: ({ row }) => <div className="text-right font-mono">{new Intl.NumberFormat('fr-FR').format(row.getValue('totalRevenue'))} F</div>,
    },
    {
        accessorKey: 'totalMargin',
        header: () => <div className="text-right">Marge Totale</div>,
        cell: ({ row }) => <div className="text-right font-mono font-bold text-green-600">{new Intl.NumberFormat('fr-FR').format(row.getValue('totalMargin'))} F</div>,
    },
    {
        accessorKey: 'marginRate',
        header: () => <div className="text-right">Taux de Marge</div>,
        cell: ({ row }) => <div className="text-right font-mono">{row.getValue('marginRate')}%</div>,
    },
];

const salesByCategoryColumns: ColumnDef<SalesByCategory>[] = [
    {
        accessorKey: 'name',
        header: 'Famille de produits',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
    },
    {
        accessorKey: 'value',
        header: () => <div className="text-right">Chiffre d'Affaires</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('value'));
            const formatted = new Intl.NumberFormat('fr-FR').format(amount);
            return <div className="text-right font-mono font-bold text-primary">{formatted} F</div>;
        },
    },
];


export default function SalesAnalysisPage() {
    const { sales } = useTransactions();

    const salesStats = useMemo(() => {
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.amount, 0);
        const totalMargin = sales.reduce((acc, sale) => acc + (sale.margin || 0), 0);
        const marginRate = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
        const totalSalesCount = sales.length;

        return { totalRevenue, totalMargin, marginRate, totalSalesCount };
    }, [sales]);

    const topProfitableProducts = useMemo(() => {
        const productStats: { [key: string]: ProfitableProduct } = {};

        sales.forEach(sale => {
            if (!sale.inventoryId || !sale.quantity) return;

            if (!productStats[sale.inventoryId]) {
                productStats[sale.inventoryId] = {
                    productId: sale.inventoryId,
                    productName: sale.product,
                    totalRevenue: 0,
                    totalMargin: 0,
                    totalQuantity: 0,
                    marginRate: 0,
                };
            }
            productStats[sale.inventoryId].totalRevenue += sale.amount;
            productStats[sale.inventoryId].totalMargin += sale.margin || 0;
            productStats[sale.inventoryId].totalQuantity += sale.quantity;
        });

        return Object.values(productStats)
            .map(p => ({
                ...p,
                marginRate: p.totalRevenue > 0 ? parseFloat(((p.totalMargin / p.totalRevenue) * 100).toFixed(2)) : 0,
            }))
            .sort((a, b) => b.totalMargin - a.totalMargin);
    }, [sales]);

    const monthlyMarginData = useMemo(() => {
        const data: { [key: string]: { Marge: number, CA: number, name: string } } = {};

        sales.forEach(t => {
            const transactionDate = new Date(t.date);
            const monthYear = format(transactionDate, 'yyyy-MM', { locale: fr });
            const monthName = format(transactionDate, 'MMM yy', { locale: fr });
            
            if (!data[monthYear]) {
                data[monthYear] = { Marge: 0, CA: 0, name: monthName };
            }
            data[monthYear].Marge += t.margin || 0;
            data[monthYear].CA += t.amount;
        });
        
        return Object.keys(data)
            .sort()
            .map(key => ({
                name: data[key].name,
                Marge: data[key].Marge,
                "Chiffre d'Affaires": data[key].CA,
            }));
    }, [sales]);

    const salesByCategory = useMemo(() => {
        const data: { [key: string]: number } = {};
    
        sales.forEach(sale => {
          const category = sale.itemType || 'Non catégorisé';
          if (!data[category]) {
            data[category] = 0;
          }
          data[category] += sale.amount;
        });
    
        return Object.keys(data)
          .map(name => ({ name, value: data[name] }))
          .sort((a, b) => b.value - a.value);
    
    }, [sales]);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Analyse des Ventes" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chiffre d'Affaires Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(salesStats.totalRevenue)} F</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Marge Brute Totale</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('fr-FR').format(salesStats.totalMargin)} F</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux de Marge Moyen</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats.marginRate.toFixed(2)}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nombre de Ventes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats.totalSalesCount}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution de la Marge</CardTitle>
                            <CardDescription>Marge brute et CA sur toutes les périodes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyMarginData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                    <YAxis tickLine={false} axisLine={false} unit="F" tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {notation: 'compact'}).format(value as number)} />
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
                                    <Bar dataKey="Chiffre d'Affaires" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Marge" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Produits par Marge</CardTitle>
                            <CardDescription>Classement des produits les plus rentables.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable data={topProfitableProducts} columns={profitableProductsColumns} />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <SalesBreakdownChart />
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventes par Famille</CardTitle>
                            <CardDescription>Chiffre d'affaires par famille de produits.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable data={salesByCategory} columns={salesByCategoryColumns} hideToolbar={true} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
