import type { Sale, Purchase, Expense, InventoryItem, StockMovement } from './types';

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

export const mockInventory: InventoryItem[] = [
    { id: 'PROD001', productName: 'Pommes Golden', sku: 'FR-POM-GOL', category: 'Fruits', inStock: 150, inTransit: 50, reorderLevel: 30, supplier: 'Vergers du Sud' },
    { id: 'PROD002', productName: 'Lait Entier 1L', sku: 'LA-LAI-ENT', category: 'Produits Laitiers', inStock: 200, inTransit: 0, reorderLevel: 50, supplier: 'Laiterie Centrale' },
    { id: 'PROD003', productName: 'Pain de Campagne', sku: 'BO-PAI-CAM', category: 'Boulangerie', inStock: 60, inTransit: 0, reorderLevel: 20, supplier: 'Boulangerie Artisanale' },
    { id: 'PROD004', productName: 'Steak Haché 500g', sku: 'VI-STH-500', category: 'Boucherie', inStock: 80, inTransit: 25, reorderLevel: 25, supplier: 'Boucherie du Marché' },
    { id: 'PROD005', productName: 'Yaourt Nature x4', sku: 'PL-YAO-NAT', category: 'Produits Laitiers', inStock: 120, inTransit: 0, reorderLevel: 40, supplier: 'Laiterie Centrale' },
];

export const mockStockMovements: StockMovement[] = [
    { id: 'MOV001', productId: 'PROD001', type: 'in', quantity: 50, date: '2024-05-28T10:00:00Z', reason: 'Livraison Fournisseur' },
    { id: 'MOV002', productId: 'PROD002', type: 'out', quantity: 24, date: '2024-05-28T11:30:00Z', reason: 'Vente' },
    { id: 'MOV003', productId: 'PROD003', type: 'out', quantity: 10, date: '2024-05-28T12:00:00Z', reason: 'Vente' },
    { id: 'MOV004', productId: 'PROD004', type: 'adjustment', quantity: -2, date: '2024-05-28T14:00:00Z', reason: 'Perte / Casse' },
    { id: 'MOV005', productId: 'PROD001', type: 'out', quantity: 15, date: '2024-05-28T15:00:00Z', reason: 'Vente' },
];
