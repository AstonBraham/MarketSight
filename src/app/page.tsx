
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
import { SalesCurveChart } from '@/components/dashboard/sales-curve-chart';

export default function Page() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
      setIsClient(true);
    }, []);

    const { getAllTransactions, sales, getLastClosingDate } = useTransactions();
    const { inventory } = useInventory();
    const { getStock: getAirtimeStock } = useAirtime();
    const { getBalance: getMobileMoneyBalance } = useMobileMoney();

    const allTransactions = useMemo(() => isClient ? getAllTransactions() : [], [isClient, getAllTransactions]);
    const lastClosingDate = useMemo(() => isClient ? getLastClosingDate() : null, [isClient, getLastClosingDate]);

    const currentBalance = useMemo(() => {
        if (!isClient) return 0;
        let balance = 0;
        const sorted = [...allTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        sorted.forEach(t => {
          balance += t.amount;
        });
        return balance;
    }, [isClient, allTransactions]);

    const inventoryValue = useMemo(() => {
        if (!isClient) return 0;
        return inventory.reduce((acc, item) => acc + (item.inStock * (item.costPrice || 0)), 0);
    }, [isClient, inventory]);

    const airtimeStockMoov = useMemo(() => isClient ? getAirtimeStock('Moov') : 0, [isClient, getAirtimeStock]);
    const airtimeStockYas = useMemo(() => isClient ? getAirtimeStock('Yas') : 0, [isClient, getAirtimeStock]);
    const totalAirtimeStock = useMemo(() => airtimeStockMoov + airtimeStockYas, [airtimeStockMoov, airtimeStockYas]);
    
    const mobileMoneyBalanceFlooz = useMemo(() => isClient ? getMobileMoneyBalance('Flooz') : 0, [isClient, getMobileMoneyBalance]);
    const mobileMoneyBalanceMixx = useMemo(() => isClient ? getMobileMoneyBalance('Mixx') : 0, [isClient, getMobileMoneyBalance]);
    const mobileMoneyBalanceCoris = useMemo(() => isClient ? getMobileMoneyBalance('Coris') : 0, [isClient, getMobileMoneyBalance]);
    const totalMobileMoneyBalance = useMemo(() => mobileMoneyBalanceFlooz + mobileMoneyBalanceMixx + mobileMoneyBalanceCoris, [mobileMoneyBalanceFlooz, mobileMoneyBalanceMixx, mobileMoneyBalanceCoris]);
    
    const workingCapital = useMemo(() => {
        if (!isClient) return 0;
        return currentBalance + inventoryValue + totalAirtimeStock + totalMobileMoneyBalance;
    }, [isClient, currentBalance, inventoryValue, totalAirtimeStock, totalMobileMoneyBalance]);
    
    const todaySales = useMemo(() => {
        if (!isClient) return 0;
        const relevantSales = sales.filter(t => !lastClosingDate || new Date(t.date) > lastClosingDate);
        return relevantSales.reduce((acc, t) => acc + t.amount, 0);
    }, [isClient, sales, lastClosingDate]);
    
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
          <SalesCurveChart />
        </div>
        <div className="grid gap-8">
          <RecentTransactions />
          <SalesBreakdownChart />
        </div>
      </div>
    </div>
  );
}
