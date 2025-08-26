
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const transactions = [
  { name: 'Vente #3021', amount: 25000, type: 'in' },
  { name: 'Salaire - John Doe', amount: 250000, type: 'out' },
  { name: 'Achat Fournisseur A', amount: 89990, type: 'out' },
  { name: 'Vente #3022', amount: 59500, type: 'in' },
  { name: 'Facture Électricité', amount: 15075, type: 'out' },
];

export function RecentTransactions() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Transactions Récentes</CardTitle>
        <CardDescription>
          Les 5 dernières transactions enregistrées.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={transaction.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {transaction.type === 'in' ? 'E' : 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{transaction.name}</p>
            </div>
            <div
              className={`ml-auto font-medium ${
                transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'in' ? '+' : '-'}
              {new Intl.NumberFormat('fr-FR').format(transaction.amount)} F
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
