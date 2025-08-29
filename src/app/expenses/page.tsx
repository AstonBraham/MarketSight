
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/expenses/columns';
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog';
import { useTransactions } from '@/context/transaction-context';

export default function ExpensesPage() {
  const { expenses } = useTransactions();

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Dépenses Opérationnelles" action={<AddExpenseDialog />} />
      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={expenses} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
