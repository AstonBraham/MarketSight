
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/cash/columns';
import { mockSales, mockPurchases, mockExpenses } from '@/lib/mock-data';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';

export default function CashPage() {
  const allTransactions = [...mockSales, ...mockPurchases, ...mockExpenses];
  
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Gestion de la Trésorerie" />
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde de Caisse</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1 230 500 F</div>
                <p className="text-xs text-muted-foreground">+5% depuis hier</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrées du Jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+450 000 F</div>
                 <p className="text-xs text-muted-foreground">Total des ventes</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sorties du Jour</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">-125 000 F</div>
                 <p className="text-xs text-muted-foreground">Achats et dépenses</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flux Net</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">+325 000 F</div>
                <p className="text-xs text-muted-foreground">Bénéfice du jour</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Détail des Mouvements</CardTitle>
                <CardDescription>Liste de toutes les transactions de caisse.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable data={allTransactions} columns={columns} />
            </CardContent>
       </Card>
      </div>
    </div>
  );
}
