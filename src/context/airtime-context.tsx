
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { AirtimeTransaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTransactions } from './transaction-context';

interface AirtimeContextType {
  transactions: AirtimeTransaction[];
  setTransactions: (transactions: AirtimeTransaction[]) => void;
  addTransaction: (transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => void;
  addBulkTransactions: (transactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => void;
  removeTransaction: (id: string) => void;
  clearAirtimeTransactions: () => void;
  getStock: (provider: 'Moov' | 'Yas') => number;
  getProcessedTransactions: (provider: 'Moov' | 'Yas') => AirtimeTransaction[];
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

  const addBulkTransactions = useCallback((newTransactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `AIRBULK-${Date.now()}-${i}`,
      date: t.date || new Date().toISOString()
    }));
    
    setTransactions(prev => {
        const otherProviderTransactions = providerToClear 
            ? prev.filter(t => t.provider !== providerToClear)
            : prev;
        
        return [...otherProviderTransactions, ...fullTransactions];
    });
  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const clearAirtimeTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  const getStock = useCallback((provider: 'Moov' | 'Yas') => {
    return transactions
      .filter(t => t.provider === provider)
      .reduce((acc, t) => {
        if (t.type === 'purchase' || (t.type === 'adjustment' && t.amount > 0)) return acc + t.amount;
        if (t.type === 'sale' || (t.type === 'adjustment' && t.amount < 0)) return acc - t.amount;
        return acc;
      }, 0);
  }, [transactions]);

  const getProcessedTransactions = useCallback((provider: 'Moov' | 'Yas'): AirtimeTransaction[] => {
    const providerTransactions = transactions.filter(t => t.provider === provider);
    let balance = 0;
    const sorted = [...providerTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const withBalance = sorted.map(t => {
        if (t.type === 'purchase' || (t.type === 'adjustment' && t.amount > 0)) {
            balance += t.amount;
        } else if (t.type === 'sale' || (t.type === 'adjustment' && t.amount < 0)) {
            balance -= t.amount;
        }
        // Commissions do not affect airtime stock balance
        return { ...t, balance };
    });

    return withBalance.reverse();
  }, [transactions]);
  

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    addBulkTransactions,
    removeTransaction,
    clearAirtimeTransactions,
    getStock,
    getProcessedTransactions,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, clearAirtimeTransactions, getStock, getProcessedTransactions]);

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
