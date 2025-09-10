
'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { PageHeader } from '@/components/page-header';
import { DollarSign, ShoppingCart, Boxes, Smartphone, Landmark, Send, Wallet } from 'lucide-react';
import { useTransactions } from '@/context/transaction-context';
import { useInventory } from '@/context/inventory-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useMemo, useState, useEffect } from 'react';
import { UnpaidPurchases } from '@/components/dashboard/unpaid-purchases';
import { SalesBreakdownChart } from '@/components/dashboard/sales-breakdown-chart';
import { CashflowChartLast6Months } from '@/components/dashboard/cashflow-chart-last-6-months';
import { DashboardAlerts } from '@/components/dashboard/dashboard-alerts';
import type { Transaction } from '@/lib/types';

export default function DashboardPage() {
    const { getAllTransactions, sales } = useTransactions();
    const { inventory } = useInventory();
    const { getStock: getAirtimeStock } = useAirtime();
    const { getBalance: getMobileMoneyBalance } = useMobileMoney();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const allTransactions = getAllTransactions();

    const currentBalance = useMemo(() => {
        let balance = 0;
        const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        sorted.forEach(t => {
        if (t.type === 'sale') {
            balance += t.amount;
        } else if (t.type === 'purchase' || t.type === 'expense') {
            balance -= t.amount;
        } else if (t.type === 'adjustment') {
          balance += t.amount;
        }
        });
        return balance;
    }, [allTransactions]);

    const inventoryValue = useMemo(() => {
        return inventory.reduce((acc, item) => acc + (item.inStock * (item.costPrice || 0)), 0);
    }, [inventory]);

    const airtimeStockMoov = getAirtimeStock('Moov');
    const airtimeStockYas = getAirtimeStock('Yas');
    const totalAirtimeStock = airtimeStockMoov + airtimeStockYas;

    const mobileMoneyBalanceFlooz = getMobileMoneyBalance('Flooz');
    const mobileMoneyBalanceMixx = getMobileMoneyBalance('Mixx');
    const mobileMoneyBalanceCoris = getMobileMoneyBalance('Coris');
    const totalMobileMoneyBalance = mobileMoneyBalanceFlooz + mobileMoneyBalanceMixx + mobileMoneyBalanceCoris;

    const workingCapital = currentBalance + inventoryValue + totalAirtimeStock + totalMobileMoneyBalance;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const todaySales = sales
        .filter(t => new Date(t.date).toDateString() === today.toDateString())
        .reduce((acc, t) => acc + t.amount, 0);

    const monthSales = sales
        .filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' F';

  if (!isClient) {
    return null;
  }


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Tableau de Bord" />
      
      <DashboardAlerts />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Fonds de roulement"
          value={formatCurrency(workingCapital)}
          icon={<Landmark className="h-6 w-6 text-primary" />}
          className="xl:col-span-2"
        />
        <StatCard
          title="Solde de Trésorerie"
          value={formatCurrency(currentBalance)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Valeur du Stock"
          value={formatCurrency(inventoryValue)}
          icon={<Boxes className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Ventes du Jour"
          value={formatCurrency(todaySales)}
          icon={<ShoppingCart className="h-6 w-6 text-primary" />}
        />
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
         <StatCard
          title="Stock Airtime Moov"
          value={formatCurrency(airtimeStockMoov)}
          icon={<Smartphone className="h-6 w-6 text-blue-600" />}
        />
         <StatCard
          title="Stock Airtime Yas"
          value={formatCurrency(airtimeStockYas)}
          icon={<Smartphone className="h-6 w-6 text-yellow-600" />}
        />
         <StatCard
          title="Solde MM Flooz"
          value={formatCurrency(mobileMoneyBalanceFlooz)}
          icon={<Send className="h-6 w-6 text-blue-600" />}
        />
         <StatCard
          title="Solde MM Mixx"
          value={formatCurrency(mobileMoneyBalanceMixx)}
          icon={<Send className="h-6 w-6 text-yellow-600" />}
        />
         <StatCard
          title="Solde MM Coris"
          value={formatCurrency(mobileMoneyBalanceCoris)}
          icon={<Send className="h-6 w-6 text-red-600" />}
        />
       </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-8">
          <UnpaidPurchases />
          <CashflowChart />
          <CashflowChartLast6Months />
        </div>
        <div className="grid gap-8">
          <RecentTransactions />
          <SalesBreakdownChart />
        </div>
      </div>
    </div>
  );
}
