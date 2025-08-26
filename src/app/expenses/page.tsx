import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/expenses/columns';
import { mockExpenses } from '@/lib/mock-data';
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog';

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Dépenses Opérationnelles" action={<AddExpenseDialog />} />
      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={mockExpenses} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
