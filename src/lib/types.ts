

export type Transaction = {
  id: string;
  type: 'sale' | 'purchase' | 'expense' | 'adjustment';
  description: string;
  amount: number;
  date: string;
  category?: string;
  balance?: number;
};

export type Sale = Transaction & {
  type: 'sale';
  client: string;
  product: string;
  reference?: string;
  price?: number;
  quantity?: number;
  itemType?: string;
  discount?: number;
  invoiceId?: string; // Ajout de la référence à la facture
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
  brand?: string;
  reference?: string;
  inStock: number;
  inTransit: number;
  reorderLevel: number;
  supplier: string;
  defaultPrice?: number;
  isQuickSale?: boolean;
  costPrice?: number; // Coût unitaire moyen pondéré (CUMP)
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

export type AirtimeTransaction = {
  id: string;
  type: 'purchase' | 'sale' | 'adjustment';
  provider: 'Moov' | 'Yas';
  amount: number;
  commission: number;
  date: string;
  phoneNumber?: string;
  transactionId?: string;
  balance?: number;
  description?: string;
}

export type MobileMoneyTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'pos_transfer' | 'virtual_return' | 'collect_commission' | 'adjustment';

export type MobileMoneyTransaction = {
    id: string;
    transactionId?: string;
    type: MobileMoneyTransactionType;
    provider: 'Mixx' | 'Flooz';
    amount: number;
    commission: number;
    date: string;
    phoneNumber?: string;
    affectsCash?: boolean; // For POS transfers
    balance?: number;
    description?: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}
