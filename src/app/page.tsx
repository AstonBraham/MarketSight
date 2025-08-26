
import { StatCard } from '@/components/dashboard/stat-card';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { PageHeader } from '@/components/page-header';
import { DollarSign, ShoppingCart, Truck, Banknote } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Tableau de Bord" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Solde de Trésorerie"
          value="7 845 000 F"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          change="+20.1% depuis le mois dernier"
        />
        <StatCard
          title="Ventes du Mois"
          value="12 560 000 F"
          icon={<ShoppingCart className="h-6 w-6 text-primary" />}
          change="+15.2% vs M-1"
        />
        <StatCard
          title="Achats du Mois"
          value="4 515 000 F"
          icon={<Truck className="h-6 w-6 text-primary" />}
          change="-5.8% vs M-1"
        />
        <StatCard
          title="Dépenses Opérationnelles"
          value="200 000 F"
          icon={<Banknote className="h-6 w-6 text-primary" />}
          change="+2.1% vs M-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
