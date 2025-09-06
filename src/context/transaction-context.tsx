

'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Sale, Purchase, Expense, Transaction, Invoice, InvoiceItem, CashClosing, AirtimeTransaction, MobileMoneyTransaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { startOfDay, endOfDay, isEqual } from 'date-fns';
import { useAirtime } from './airtime-context';
import { useMobileMoney } from './mobile-money-context';
import { useInventory } from './inventory-context';

type HistoryTransaction = Transaction & { 
    source?: string, 
    link?: string, 
    phoneNumber?: string, 
    transactionId?: string 
};

interface TransactionContextType {
  transactions: (Sale | Purchase | Expense | Transaction)[];
  setTransactions: (transactions: (Sale | Purchase | Expense | Transaction)[]) => void;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  cashClosings: CashClosing[];
  setCashClosings: (cashClosings: CashClosing[]) => void;
  expenseCategories: string[];
  addSale: (sale: Omit<Sale, 'id' | 'type' | 'category'>) => void;
  addBulkSales: (sales: Omit<Sale, 'id' | 'type' | 'category'>[]) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => void;
  payPurchase: (purchaseId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'type' | 'currency'>) => void;
  addBulkExpenses: (expenses: Omit<Expense, 'id' | 'type' | 'currency'>[]) => void;
  removeExpense: (id: string) => void;
  addExpenseCategory: (category: string) => void;
  addAdjustment: (adjustment: { amount: number; description: string, date?: string }) => void;
  addBulkAdjustments: (adjustments: Omit<Transaction, 'id' | 'type' | 'category'>[]) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  getInvoice: (id: string) => Invoice | undefined;
  getAllTransactions: () => Transaction[];
  getDailyHistory: (date: Date) => HistoryTransaction[];
  addCashClosing: (closing: Omit<CashClosing, 'id' | 'date'>) => void;
  clearWifiSales: () => void;
  clearCashTransactions: () => void;
  clearInvoices: () => void;
  clearCashClosings: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<(Sale | Purchase | Expense | Transaction)[]>('transactions', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [cashClosings, setCashClosings] = useLocalStorage<CashClosing[]>('cashClosings', []);
  
  const { transactions: airtimeTransactions } = useAirtime();
  const { transactions: mobileMoneyTransactions } = useMobileMoney();
  const { inventory, updateItem: updateInventoryItem } = useInventory();

  const expenseCategories = useMemo(() => {
    const categories = transactions
      .filter(t => t.type === 'expense' && t.category)
      .map(t => t.category!);
    return [...new Set(categories)].sort();
  }, [transactions]);
  
  const addExpenseCategory = useCallback((category: string) => {
    console.log(`Expense category "${category}" will be available for selection.`);
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'type' | 'category'>) => {
    const item = inventory.find(i => i.id === sale.inventoryId);
    const costPrice = item?.costPrice || 0;
    const margin = sale.amount - (costPrice * (sale.quantity || 1));

    const newSale: Sale = {
      ...sale,
      id: `SALE${Date.now()}`,
      type: 'sale',
      date: sale.date || new Date().toISOString(),
      category: 'Vente',
      costPrice: costPrice,
      margin: margin,
    };
    setTransactions(prev => [newSale, ...prev]);

    if (newSale.inventoryId && newSale.quantity) {
        if (item) {
            updateInventoryItem(
                item.id, 
                { inStock: item.inStock - newSale.quantity }, 
                `Vente (Client: ${newSale.client})`,
                newSale.id
            );
        }
    }
  }, [setTransactions, inventory, updateInventoryItem]);

  const addBulkSales = useCallback((sales: Omit<Sale, 'id'|'type'|'category'>[]) => {
    const newSales: Sale[] = sales.map((sale, index) => {
      const item = inventory.find(i => (i.sku && i.sku === sale.reference) || (i.reference && i.reference === sale.reference));
      const costPrice = item?.costPrice || 0;
      const margin = sale.amount - (costPrice * (sale.quantity || 1));
      
      return {
        ...sale,
        id: `SALE-BULK-${Date.now()}-${index}`,
        type: 'sale',
        date: sale.date || new Date().toISOString(),
        category: 'Vente',
        costPrice: costPrice,
        margin: margin,
        inventoryId: item?.id
      }
    });
    setTransactions(prev => [...prev, ...newSales]);
    // Note: Bulk sale import currently does not update inventory stock.
    // This could be a future improvement if needed.
  }, [setTransactions, inventory]);
  
  const clearWifiSales = useCallback(() => {
    setTransactions(prev => prev.filter(t => (t as Sale).itemType !== 'Ticket Wifi'));
  }, [setTransactions]);
  
  const clearCashTransactions = useCallback(() => setTransactions([]), [setTransactions]);
  const clearInvoices = useCallback(() => setInvoices([]), [setInvoices]);
  const clearCashClosings = useCallback(() => setCashClosings([]), [setCashClosings]);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `PUR${Date.now()}`,
      type: 'purchase',
      date: new Date().toISOString(),
      category: 'Achat',
    };

    if (newPurchase.status === 'paid') {
        setTransactions(prev => [newPurchase, ...prev]);
    } else {
        const allPurchases = transactions.filter(t => t.type === 'purchase');
        const otherTransactions = transactions.filter(t => t.type !== 'purchase');
        setTransactions([...otherTransactions, ...allPurchases, newPurchase]);
    }

    if (newPurchase.inventoryId && newPurchase.quantity) {
        const item = inventory.find(i => i.id === newPurchase.inventoryId);
        if (item) {
            const oldStock = item.inStock;
            const oldCostPrice = item.costPrice || 0;
            const oldStockValue = oldStock * oldCostPrice;

            const purchaseValue = newPurchase.amount;
            const newStock = oldStock + newPurchase.quantity;
            const newCostPrice = (oldStockValue + purchaseValue) / newStock;

            updateInventoryItem(
                item.id,
                { inStock: newStock, costPrice: newCostPrice },
                `Achat (Fournisseur: ${newPurchase.supplier})`,
                newPurchase.id
            );
        }
    }

  }, [transactions, setTransactions, inventory, updateInventoryItem]);
  
  const payPurchase = useCallback((purchaseId: string) => {
    let purchaseToPay: Purchase | undefined;

    const updatedTransactions = transactions.map(t => {
        if (t.id === purchaseId && t.type === 'purchase') {
            purchaseToPay = { ...(t as Purchase), status: 'paid' };
            return purchaseToPay;
        }
        return t;
    });

    if (purchaseToPay) {
         const paymentTransaction: Transaction = {
            id: purchaseToPay.id,
            type: 'purchase',
            amount: purchaseToPay.amount,
            date: new Date().toISOString(),
            description: `Paiement achat: ${purchaseToPay.description}`,
            category: 'Paiement Achat',
        };
        const filteredTransactions = transactions.filter(t => t.id !== purchaseId);
        setTransactions([paymentTransaction, ...filteredTransactions]);
    }
  }, [transactions, setTransactions]);


  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'type' | 'currency'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP${Date.now()}`,
      type: 'expense',
      date: expense.date || new Date().toISOString(),
      currency: 'F',
      category: expense.category || 'Dépense',
    };
    setTransactions(prev => [newExpense, ...prev]);
  }, [setTransactions]);

  const addBulkExpenses = useCallback((expenses: Omit<Expense, 'id'|'type'|'currency'>[]) => {
    const newExpenses: Expense[] = expenses.map((expense, index) => ({
        ...expense,
        id: `EXP-BULK-${Date.now()}-${index}`,
        type: 'expense',
        date: expense.date || new Date().toISOString(),
        currency: 'F',
        category: expense.category || 'Dépense',
    }));
    setTransactions(prev => [...prev, ...newExpenses]);
  }, [setTransactions]);

  const removeExpense = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id && t.type === 'expense'));
  }, [setTransactions]);

  const addAdjustment = useCallback((adjustment: { amount: number; description: string, date?: string }) => {
    const newAdjustment: Transaction = {
      ...adjustment,
      id: `ADJ${Date.now()}`,
      type: 'adjustment',
      date: adjustment.date || new Date().toISOString(),
      category: 'Ajustement'
    };
    setTransactions(prev => [newAdjustment, ...prev]);
  }, [setTransactions]);

  const addBulkAdjustments = useCallback((adjustments: Omit<Transaction, 'id' | 'type' | 'category'>[]) => {
    const newAdjustments: Transaction[] = adjustments.map((adj, index) => ({
      ...adj,
      id: `ADJ-BULK-${Date.now()}-${index}`,
      type: 'adjustment',
      date: adj.date || new Date().toISOString(),
      category: 'Ajustement',
    }));
    setTransactions(prev => [...prev, ...newAdjustments]);
  }, [setTransactions]);
  
  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id'>): string => {
    const newId = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Create a single cash transaction for the whole invoice
    addSale({
        invoiceId: newId,
        client: invoiceData.clientName,
        product: `Facture ${newId}`,
        price: invoiceData.total,
        quantity: 1,
        amount: invoiceData.total,
        itemType: 'Facture'
    });
    
    // Update inventory for each item
    invoiceData.items.forEach(item => {
        if (item.inventoryId && item.quantity) {
            const inventoryItem = inventory.find(i => i.id === item.inventoryId);
            if (inventoryItem) {
                updateInventoryItem(
                    inventoryItem.id,
                    { inStock: inventoryItem.inStock - item.quantity },
                    `Vente sur Facture ${newId}`,
                    newId
                );
            }
        }
    });

    return newId;
  }, [setInvoices, addSale, inventory, updateInventoryItem]);
  
  const getInvoice = useCallback((id: string) => {
    return invoices.find(invoice => invoice.id === id);
  }, [invoices]);

  const addCashClosing = useCallback((closing: Omit<CashClosing, 'id' | 'date'>) => {
    const newClosing: CashClosing = {
      ...closing,
      id: `CC${Date.now()}`,
      date: new Date().toISOString(),
    };
    setCashClosings(prev => [newClosing, ...prev]);

    if (newClosing.variance !== 0) {
      addAdjustment({
        amount: newClosing.variance,
        description: `Ajustement suite à l'arrêté de caisse du ${new Date(newClosing.date).toLocaleDateString()}`,
      });
    }
  }, [addAdjustment, setCashClosings]);

  const getAllTransactions = useCallback((): Transaction[] => {
    const allCashTransactions: Transaction[] = [...transactions];

    return allCashTransactions
      .filter(t => {
        if (t.type === 'purchase') {
            const p = t as Purchase;
            return p.status !== 'unpaid';
        }
        return t.type === 'sale' || t.type === 'expense' || t.type === 'adjustment';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as Transaction[];
  }, [transactions]);
  
  const getDailyHistory = useCallback((date: Date): HistoryTransaction[] => {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const filterByDate = (t: { date: string }) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
    };
    
    let allDailyTransactions: HistoryTransaction[] = [];

    // Base transactions (sales, expenses, purchases, adjustments)
    transactions
        .filter(filterByDate)
        .filter(t => t.type !== 'purchase' || (t as Purchase).status !== 'unpaid')
        .forEach(t => {
            let type = t.type;
            let link: string | undefined = undefined;
            let amount = 0;
            if (t.type === 'sale') {
                const sale = t as Sale;
                amount = sale.amount;
                if (sale.itemType === 'Ticket Wifi') type = 'Vente Wifi';
                if (sale.itemType === 'Facture') {
                    type = 'Facture';
                    link = `/invoices/${sale.invoiceId}`;
                }
            } else if (t.type === 'purchase' || t.type === 'expense') {
                amount = -t.amount;
            } else if (t.type === 'adjustment') {
                amount = t.amount;
            }
            allDailyTransactions.push({ ...t, amount, type, link });
        });

    // Airtime Transactions
    airtimeTransactions
        .filter(filterByDate)
        .forEach(at => {
            if (at.type === 'sale') {
                allDailyTransactions.push({ ...at, type: 'Vente Airtime', source: at.provider, amount: at.amount, description: `Vente Airtime ${at.provider}` });
            } else if (at.type === 'purchase') {
                allDailyTransactions.push({ ...at, type: 'Achat Airtime', source: at.provider, amount: -at.amount, description: `Achat Airtime ${at.provider}` });
            }
        });
    
    // Mobile Money Transactions
    mobileMoneyTransactions
        .filter(filterByDate)
        .forEach(mt => {
            let cashFlowImpact = 0;
            let type = mt.type;
            let description = mt.description || `${type} ${mt.provider}`;

             switch (mt.type) {
                case 'deposit': cashFlowImpact = mt.amount; description = `Dépôt MM ${mt.provider}`; break;
                case 'withdrawal': cashFlowImpact = -mt.amount; description = `Retrait MM ${mt.provider}`; break;
                case 'purchase': cashFlowImpact = -mt.amount; type = 'MM Purchase'; description = `Achat virtuel ${mt.provider}`; break;
                case 'virtual_return': cashFlowImpact = mt.amount; type = 'Retour Virtuel Caisse'; description = `Retour virtuel ${mt.provider}`; break;
                case 'transfer_to_pos': if (mt.affectsCash) { cashFlowImpact = mt.amount; type = 'MM Transfer'; description = `Transfert vers PDV ${mt.phoneNumber}`; } break;
                case 'transfer_from_pos': if (mt.affectsCash) { cashFlowImpact = -mt.amount; type = 'MM Transfer'; description = `Transfert depuis PDV ${mt.phoneNumber}`; } break;
                case 'collect_commission': cashFlowImpact = mt.amount; type = 'MM Commission'; description = `Collecte commission ${mt.provider}`; break;
            }

            if (cashFlowImpact !== 0) {
                allDailyTransactions.push({ ...mt, amount: cashFlowImpact, type, description });
            }
        });


    return allDailyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [transactions, airtimeTransactions, mobileMoneyTransactions]);

  const sales = useMemo(() => transactions.filter(t => t.type === 'sale') as Sale[], [transactions]);
  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase') as Purchase[], [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense') as Expense[], [transactions]);

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    sales,
    purchases,
    expenses,
    invoices,
    setInvoices,
    cashClosings,
    setCashClosings,
    expenseCategories,
    addSale,
    addBulkSales,
    addPurchase,
    payPurchase,
    addExpense,
    addBulkExpenses,
    removeExpense,
    addExpenseCategory,
    addAdjustment,
    addBulkAdjustments,
    addInvoice,
    getInvoice,
    getAllTransactions,
    getDailyHistory,
    addCashClosing,
    clearWifiSales,
    clearCashTransactions,
    clearInvoices,
    clearCashClosings,
  }), [
      transactions, setTransactions, sales, purchases, expenses, invoices, setInvoices, cashClosings, setCashClosings, 
      expenseCategories, addSale, addBulkSales, addPurchase, payPurchase, addExpense, addBulkExpenses, removeExpense, 
      addExpenseCategory, addAdjustment, addBulkAdjustments, addInvoice, getInvoice, getAllTransactions, getDailyHistory, 
      addCashClosing, clearWifiSales, clearCashTransactions, clearInvoices, clearCashClosings,
      airtimeTransactions, mobileMoneyTransactions
    ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
