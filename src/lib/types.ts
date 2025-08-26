export type Transaction = {
  id: string;
  type: 'sale' | 'purchase' | 'expense';
  description: string;
  amount: number;
  date: string;
  category?: string;
};

export type Sale = Transaction & {
  type: 'sale';
  client: string;
  product: string;
  discount?: number;
};

export type Purchase = Transaction & {
  type: 'purchase';
  supplier: string;
  product: string;
};

export type Expense = Transaction & {
  type: 'expense';
  currency: string;
  tags?: string[];
};
