
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { AirtimeTransaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AirtimeContextType {
  transactions: AirtimeTransaction[];
  setTransactions: (transactions: AirtimeTransaction[]) => void;
  addTransaction: (transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => void;
  addBulkTransactions: (transactions: Omit<AirtimeTransaction, 'id' | 'date'>[]) => void;
  removeTransaction: (id: string) => void;
  getStock: (provider: 'Moov' | 'Yas') => number;
}

const AirtimeContext = createContext<AirtimeContextType | undefined>(undefined);

export function AirtimeProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<AirtimeTransaction[]>('airtimeTransactions', []);

  const addTransaction = useCallback((transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => {
    const newTransaction: AirtimeTransaction = {
      ...transaction,
      id: `AIR${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, [setTransactions]);

  const addBulkTransactions = useCallback((newTransactions: Omit<AirtimeTransaction, 'id' | 'date'>[]) => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `AIRBULK-${Date.now()}-${i}`,
      date: t.date || new Date().toISOString()
    }));
    // Replace current transactions with the new bulk import
    setTransactions(fullTransactions);
  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const getStock = useCallback((provider: 'Moov' | 'Yas') => {
    return transactions
      .filter(t => t.provider === provider)
      .reduce((acc, t) => {
        if (t.type === 'purchase' || t.type === 'adjustment') return acc + t.amount;
        if (t.type === 'sale') return acc - t.amount;
        return acc;
      }, 0);
  }, [transactions]);
  

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    addBulkTransactions,
    removeTransaction,
    getStock,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, getStock]);

  return (
    <AirtimeContext.Provider value={value}>
      {children}
    </AirtimeContext.Provider>
  );
}

export function useAirtime() {
  const context = useContext(AirtimeContext);
  if (context === undefined) {
    throw new Error('useAirtime must be used within an AirtimeProvider');
  }
  return context;
}
