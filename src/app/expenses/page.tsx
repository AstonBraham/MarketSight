
'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from '@/components/expenses/columns';
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog';
import { useTransactions } from '@/context/transaction-context';
import { Banknote } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses } = useTransactions();
  
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader title="Dépenses Opérationnelles" action={<AddExpenseDialog />} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Dépenses</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalExpenses)} F</div>
            <p className="text-xs text-muted-foreground">
              Montant total de toutes les dépenses enregistrées.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
           <CardDescription>
            Voici la liste détaillée de toutes vos dépenses opérationnelles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={sortedExpenses} columns={columns} filterColumn="description" filterPlaceholder="Filtrer par description..." />
        </CardContent>
      </Card>
    </div>
  );
}
