
import type { Sale, Purchase, Expense, InventoryItem, StockMovement, AirtimeTransaction, MobileMoneyTransaction } from './types';

export const mockSales: Sale[] = [
  {
    id: 'SALE001',
    type: 'sale',
    description: 'Vente au détail - Client A',
    amount: 12550,
    date: '2024-05-20T10:30:00Z',
    category: 'Vente',
    client: 'Client A',
    product: 'Produit X',
  },
  {
    id: 'SALE002',
    type: 'sale',
    description: 'Vente en gros - Client B',
    amount: 250000,
    date: '2024-05-21T14:00:00Z',
    category: 'Vente',
    client: 'Client B',
    product: 'Produit Y',
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: 'PUR001',
    type: 'purchase',
    description: 'Commande Fournisseur Z',
    amount: 80000,
    date: '2024-05-15T09:00:00Z',
    category: 'Achat',
    supplier: 'Fournisseur Z',
    product: 'Matière première A',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'EXP001',
    type: 'expense',
    description: 'Facture électricité - Mai 2024',
    amount: 25075,
    date: '2024-05-22T11:00:00Z',
    category: 'Utilitaires',
    currency: 'F',
    tags: ['électricité', 'mai'],
  },
  {
    id: 'EXP002',
    type: 'expense',
    description: 'Salaires - Mai 2024',
    amount: 1500000,
    date: '2024-05-25T16:00:00Z',
    category: 'Salaires',
    currency: 'F',
    tags: ['salaires'],
  },
  {
    id: 'EXP003',
    type: 'expense',
    description: 'Transport de marchandises',
    amount: 35000,
    date: '2024-05-18T12:00:00Z',
    category: 'Transport',
    currency: 'F',
    tags: ['logistique'],
  },
];

export const mockInventory: InventoryItem[] = [];

export const mockStockMovements: StockMovement[] = [
    { id: 'MOV001', productId: 'PROD001', type: 'in', quantity: 50, date: '2024-05-28T10:00:00Z', reason: 'Livraison Fournisseur' },
    { id: 'MOV002', productId: 'PROD002', type: 'out', quantity: 24, date: '2024-05-28T11:30:00Z', reason: 'Vente' },
    { id: 'MOV003', productId: 'PROD003', type: 'out', quantity: 10, date: '2024-05-28T12:00:00Z', reason: 'Vente' },
    { id: 'MOV004', productId: 'PROD004', type: 'adjustment', quantity: -2, date: '2024-05-28T14:00:00Z', reason: 'Perte / Casse' },
    { id: 'MOV005', productId: 'PROD001', type: 'out', quantity: 15, date: '2024-05-28T15:00:00Z', reason: 'Vente' },
];

export const mockAirtimeTransactions: AirtimeTransaction[] = [
    { id: 'AIR001', type: 'purchase', provider: 'Moov', amount: 1000000, commission: 0, date: '2024-05-29T09:00:00Z' },
    { id: 'AIR002', type: 'sale', provider: 'Moov', amount: 5000, commission: 250, date: '2024-05-29T09:15:00Z' },
    { id: 'AIR003', type: 'sale', provider: 'Yas', amount: 10000, commission: 500, date: '2024-05-29T09:30:00Z' },
    { id: 'AIR004', type: 'purchase', provider: 'Yas', amount: 500000, commission: 0, date: '2024-05-29T10:00:00Z' },
    { id: 'AIR005', type: 'sale', provider: 'Moov', amount: 2000, commission: 100, date: '2024-05-29T10:15:00Z' },
];

export const mockMobileMoneyTransactions: MobileMoneyTransaction[] = [
    { id: 'MM001', transactionId: 'MM-DEP-001', type: 'deposit', provider: 'Moov Money', amount: 50000, commission: 250, date: '2024-05-29T11:00:00Z' },
    { id: 'MM002', transactionId: 'MM-WDR-001', type: 'withdrawal', provider: 'MTN Money', amount: 25000, commission: 150, date: '2024-05-29T11:30:00Z' },
    { id: 'MM003', transactionId: 'MM-DEP-002', type: 'deposit', provider: 'Wave', amount: 100000, commission: 500, date: '2024-05-29T12:00:00Z' },
    { id: 'MM004', transactionId: 'MM-WDR-002', type: 'withdrawal', provider: 'Moov Money', amount: 30000, commission: 200, date: '2024-05-29T12:30:00Z' },
];
