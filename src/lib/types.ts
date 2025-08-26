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

export type InventoryItem = {
  id: string;
  productName: string;
  sku: string;
  category: string;
  inStock: number;
  inTransit: number;
  reorderLevel: number;
  supplier: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
};

export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};
