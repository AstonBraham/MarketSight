import type { Sale, Purchase, Expense } from './types';

export const mockSales: Sale[] = [
  {
    id: 'SALE001',
    type: 'sale',
    description: 'Vente au détail - Client A',
    amount: 125.5,
    date: '2024-05-20T10:30:00Z',
    category: 'Vente',
    client: 'Client A',
    product: 'Produit X',
  },
  {
    id: 'SALE002',
    type: 'sale',
    description: 'Vente en gros - Client B',
    amount: 2500.0,
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
    amount: 800.0,
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
    amount: 250.75,
    date: '2024-05-22T11:00:00Z',
    category: 'Utilitaires',
    currency: 'EUR',
    tags: ['électricité', 'mai'],
  },
  {
    id: 'EXP002',
    type: 'expense',
    description: 'Salaires - Mai 2024',
    amount: 15000.0,
    date: '2024-05-25T16:00:00Z',
    category: 'Salaires',
    currency: 'EUR',
    tags: ['salaires'],
  },
  {
    id: 'EXP003',
    type: 'expense',
    description: 'Transport de marchandises',
    amount: 350.0,
    date: '2024-05-18T12:00:00Z',
    category: 'Transport',
    currency: 'EUR',
    tags: ['logistique'],
  },
];
