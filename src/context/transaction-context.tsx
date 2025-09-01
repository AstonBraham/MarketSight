
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Sale, Purchase, Expense, Transaction, Invoice, InvoiceItem, CashClosing } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
  addAdjustment: (adjustment: { amount: number; description: string }) => void;
  addBulkAdjustments: (adjustments: Omit<Transaction, 'id' | 'type' | 'category'>[]) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  getInvoice: (id: string) => Invoice | undefined;
  getAllTransactions: () => Transaction[];
  addCashClosing: (closing: Omit<CashClosing, 'id' | 'date'>) => void;
  clearWifiSales: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<(Sale | Purchase | Expense | Transaction)[]>('transactions', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [cashClosings, setCashClosings] = useLocalStorage<CashClosing[]>('cashClosings', []);

  useEffect(() => {
    // This effect now does nothing, initial data loading is handled by useLocalStorage.
    // If you want to seed data on first load, you can add logic here checking if transactions is empty.
  }, []);

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
    const newSale: Sale = {
      ...sale,
      id: `SALE${Date.now()}`,
      type: 'sale',
      date: sale.date || new Date().toISOString(),
      category: 'Vente',
    };
    setTransactions(prev => [newSale, ...prev]);
  }, [setTransactions]);

  const addBulkSales = useCallback((sales: Omit<Sale, 'id'|'type'|'category'>[]) => {
    const newSales: Sale[] = sales.map((sale, index) => ({
        ...sale,
        id: `SALE-BULK-${Date.now()}-${index}`,
        type: 'sale',
        date: sale.date || new Date().toISOString(),
        category: 'Vente',
    }));
    setTransactions(prev => [...prev, ...newSales]);
  }, [setTransactions]);
  
  const clearWifiSales = useCallback(() => {
    setTransactions(prev => prev.filter(t => (t as Sale).itemType !== 'Ticket Wifi'));
  }, [setTransactions]);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `PUR${Date.now()}`,
      type: 'purchase',
      date: new Date().toISOString(),
      category: 'Achat',
    };

    // If purchase is paid, it affects cash immediately. If unpaid, it's just tracked.
    if (newPurchase.status === 'paid') {
        setTransactions(prev => [newPurchase, ...prev]);
    } else {
        // Add to transactions without affecting cash balance immediately
        // We can sort it to appear at the end or manage separately if needed.
        const allPurchases = transactions.filter(t => t.type === 'purchase');
        const otherTransactions = transactions.filter(t => t.type !== 'purchase');
        setTransactions([...otherTransactions, ...allPurchases, newPurchase]);
    }
  }, [transactions, setTransactions]);
  
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
         // This transaction now represents the cash outflow.
         // We change its date to now to reflect payment time.
         const paymentTransaction: Transaction = {
            id: purchaseToPay.id, // Keep the same ID
            type: 'purchase',
            amount: purchaseToPay.amount,
            date: new Date().toISOString(),
            description: `Paiement achat: ${purchaseToPay.description}`,
            category: 'Paiement Achat',
        };
        // Remove the old unpaid purchase and add the new paid one.
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

  const addAdjustment = useCallback((adjustment: { amount: number; description: string }) => {
    const newAdjustment: Transaction = {
      ...adjustment,
      id: `ADJ${Date.now()}`,
      type: 'adjustment',
      date: new Date().toISOString(),
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
    return newId;
  }, [setInvoices]);
  
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
     const cashTransactions = transactions.filter(t => {
        if (t.type === 'purchase') {
            return (t as Purchase).status !== 'unpaid';
        }
        return t.type === 'sale' || t.type === 'expense' || t.type === 'adjustment';
    });

    return cashTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as Transaction[];
  }, [transactions]);
  
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
    addCashClosing,
    clearWifiSales
  }), [transactions, setTransactions, sales, purchases, expenses, invoices, setInvoices, cashClosings, setCashClosings, expenseCategories, addSale, addBulkSales, addPurchase, payPurchase, addExpense, addBulkExpenses, removeExpense, addExpenseCategory, addAdjustment, addBulkAdjustments, addInvoice, getInvoice, getAllTransactions, addCashClosing, clearWifiSales]);

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
