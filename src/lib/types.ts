

export type Transaction = {
  id: string;
  type: 'sale' | 'purchase' | 'expense' | 'adjustment' | string; // Allow string for custom types
  description: string;
  amount: number;
  date: string;
  category?: string;
  balance?: number;
};

export type HistoryTransaction = Transaction & { 
    source?: string, 
    link?: string, 
    phoneNumber?: string, 
    transactionId?: string,
    affectsCash?: boolean,
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
  invoiceId?: string;
  inventoryId?: string;
  costPrice?: number; // coût d'achat unitaire au moment de la vente
  margin?: number; // Marge sur la vente (amount - (costPrice * quantity))
};

export type Purchase = Transaction & {
  type: 'purchase';
  supplier: string;
  product: string;
  status?: 'paid' | 'unpaid';
  inventoryId?: string;
  quantity?: number;
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
  costPrice?: number;
};

export type StockMovement = {
  id: string;
  inventoryId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  relatedTransactionId?: string;
};

export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type AirtimeTransaction = {
  id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'commission';
  provider: 'Moov' | 'Yas';
  amount: number;
  commission: number;
  date: string;
  phoneNumber?: string;
  transactionId?: string;
  balance?: number;
  description?: string;
}

export type MobileMoneyProvider = 'Mixx' | 'Flooz' | 'Coris';

export type MobileMoneyTransactionType = 'deposit' | 'withdrawal' | 'transfer_to_pos' | 'transfer_from_pos' | 'purchase' | 'pos_transfer' | 'virtual_return' | 'collect_commission' | 'adjustment';

export type MobileMoneyTransaction = {
    id: string;
    transactionId?: string;
    type: MobileMoneyTransactionType;
    provider: MobileMoneyProvider;
    amount: number;
    commission: number;
    date: string;
    phoneNumber?: string;
    affectsCash?: boolean;
    balance?: number;
    description?: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  inventoryId?: string;
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

export interface CashClosing {
    id: string;
    date: string;
    theoreticalBalance: number;
    realBalance: number;
    variance: number;
    notes?: string;
    closedBy: string;
}

export interface AuditLogEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
}
    

