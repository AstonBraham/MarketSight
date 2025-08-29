
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Sale, Purchase, Expense, Transaction, Invoice, InvoiceItem } from '@/lib/types';
import { mockSales, mockPurchases, mockExpenses } from '@/lib/mock-data';

interface TransactionContextType {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  invoices: Invoice[];
  addSale: (sale: Omit<Sale, 'id' | 'type' | 'date' | 'category'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'type' | 'date' | 'category'>) => void;
  addAdjustment: (adjustment: { amount: number; description: string }) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  getInvoice: (id: string) => Invoice | undefined;
  getAllTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<(Sale | Purchase | Expense | Transaction)[]>([...mockSales, ...mockPurchases, ...mockExpenses]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'type' | 'date' | 'category'>) => {
    const newSale: Sale = {
      ...sale,
      id: `SALE${Date.now()}`,
      type: 'sale',
      date: new Date().toISOString(),
      category: 'Vente',
    };
    setTransactions(prev => [newSale, ...prev]);
  }, []);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `PUR${Date.now()}`,
      type: 'purchase',
      date: new Date().toISOString(),
      category: 'Achat',
    };
    setTransactions(prev => [newPurchase, ...prev]);
  }, []);
  
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'type' | 'date' | 'category'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP${Date.now()}`,
      type: 'expense',
      date: new Date().toISOString(),
      category: expense.category || 'Dépense',
      currency: 'F'
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

  const getAllTransactions = useCallback((): Transaction[] => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as Transaction[];
  }, [transactions]);
  
  const sales = useMemo(() => transactions.filter(t => t.type === 'sale') as Sale[], [transactions]);
  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase') as Purchase[], [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense') as Expense[], [transactions]);

  const value = useMemo(() => ({
    sales,
    purchases,
    expenses,
    invoices,
    addSale,
    addPurchase,
    addExpense,
    addAdjustment,
    addInvoice,
    getInvoice,
    getAllTransactions
  }), [sales, purchases, expenses, invoices, addSale, addPurchase, addExpense, addAdjustment, addInvoice, getInvoice, getAllTransactions]);

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
