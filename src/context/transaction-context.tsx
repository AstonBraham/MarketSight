'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Sale, Purchase, Expense } from '@/lib/types';
import { mockSales, mockPurchases, mockExpenses } from '@/lib/mock-data';

type Transaction = Sale | Purchase | Expense;

interface TransactionContextType {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  addSale: (sale: Omit<Sale, 'id' | 'type' | 'date' | 'category'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'type' | 'date' | 'category'>) => void;
  getAllTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'type' | 'date' | 'category'>) => {
    const newSale: Sale = {
      ...sale,
      id: `SALE${Date.now()}`,
      type: 'sale',
      date: new Date().toISOString(),
      category: 'Vente',
    };
    setSales(prev => [newSale, ...prev]);
  }, []);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `PUR${Date.now()}`,
      type: 'purchase',
      date: new Date().toISOString(),
      category: 'Achat',
    };
    setPurchases(prev => [newPurchase, ...prev]);
  }, []);
  
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'type' | 'date' | 'category'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP${Date.now()}`,
      type: 'expense',
      date: new Date().toISOString(),
      category: expense.category || 'Dépense',
    };
    setExpenses(prev => [newExpense, ...prev]);
  }, []);

  const getAllTransactions = useCallback(() => {
    return [...sales, ...purchases, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases, expenses]);

  const value = useMemo(() => ({
    sales,
    purchases,
    expenses,
    addSale,
    addPurchase,
    addExpense,
    getAllTransactions
  }), [sales, purchases, expenses, addSale, addPurchase, addExpense, getAllTransactions]);

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
