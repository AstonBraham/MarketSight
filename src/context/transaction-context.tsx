
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Sale, Purchase, Expense, Transaction, Invoice, InvoiceItem, CashClosing } from '@/lib/types';

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
  addPurchase: (purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => void;
  payPurchase: (purchaseId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'type' | 'currency'>) => void;
  addExpenseCategory: (category: string) => void;
  addAdjustment: (adjustment: { amount: number; description: string }) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  getInvoice: (id: string) => Invoice | undefined;
  getAllTransactions: () => Transaction[];
  addCashClosing: (closing: Omit<CashClosing, 'id' | 'date'>) => void;
  clearWifiSales: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<(Sale | Purchase | Expense | Transaction)[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashClosings, setCashClosings] = useState<CashClosing[]>([]);

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
  }, []);
  
  const clearWifiSales = useCallback(() => {
    setTransactions(prev => prev.filter(t => (t as Sale).itemType !== 'Ticket Wifi'));
  }, []);

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
        // Unpaid purchases are not added to the main transaction flow immediately
        // They are stored and will be converted to a transaction upon payment
        const allPurchases = transactions.filter(t => t.type === 'purchase');
        const otherTransactions = transactions.filter(t => t.type !== 'purchase');
        setTransactions([...otherTransactions, ...allPurchases, newPurchase]);
    }
  }, [transactions]);
  
  const payPurchase = useCallback((purchaseId: string) => {
    let purchaseToPay: Purchase | undefined;

    const updatedTransactions = transactions.map(t => {
        if (t.id === purchaseId && t.type === 'purchase') {
            purchaseToPay = { ...(t as Purchase), status: 'paid' };
            // We don't return it here, instead we add a new transaction for payment
            return purchaseToPay;
        }
        return t;
    });

    if (purchaseToPay) {
         const paymentTransaction: Transaction = {
            id: `PAY${Date.now()}`,
            type: 'purchase', // It's a payment for a purchase
            amount: purchaseToPay.amount,
            date: new Date().toISOString(),
            description: `Paiement achat ${purchaseToPay.id} - ${purchaseToPay.description}`,
            category: 'Paiement Achat',
        };
        // Add the payment transaction to the flow and update the state of the original purchase
        setTransactions([paymentTransaction, ...updatedTransactions]);
    } else {
        setTransactions(updatedTransactions);
    }
  }, [transactions]);


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
  }, []);

  const addAdjustment = useCallback((adjustment: { amount: number; description: string }) => {
    const newAdjustment: Transaction = {
      ...adjustment,
      id: `ADJ${Date.now()}`,
      type: 'adjustment',
      date: new Date().toISOString(),
      category: 'Ajustement'
    };
    setTransactions(prev => [newAdjustment, ...prev]);
  }, []);
  
  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id'>): string => {
    const newId = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newId;
  }, []);
  
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
  }, [addAdjustment]);

  const getAllTransactions = useCallback((): Transaction[] => {
     const cashTransactions = transactions.filter(t => {
        // For purchases, only 'paid' ones immediately affect cash flow at the time of purchase.
        if (t.type === 'purchase') {
            return (t as Purchase).status === 'paid';
        }
        // Other types that affect cash flow
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
    addPurchase,
    payPurchase,
    addExpense,
    addExpenseCategory,
    addAdjustment,
    addInvoice,
    getInvoice,
    getAllTransactions,
    addCashClosing,
    clearWifiSales
  }), [transactions, setTransactions, sales, purchases, expenses, invoices, setInvoices, cashClosings, setCashClosings, expenseCategories, addSale, addPurchase, payPurchase, addExpense, addExpenseCategory, addAdjustment, addInvoice, getInvoice, getAllTransactions, addCashClosing, clearWifiSales]);

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
