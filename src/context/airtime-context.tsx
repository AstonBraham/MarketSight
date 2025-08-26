'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { AirtimeTransaction } from '@/lib/types';
import { mockAirtimeTransactions } from '@/lib/mock-data';

interface AirtimeContextType {
  transactions: AirtimeTransaction[];
  addTransaction: (transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => void;
  getStock: (provider: 'Moov' | 'Yas') => number;
}

const AirtimeContext = createContext<AirtimeContextType | undefined>(undefined);

export function AirtimeProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<AirtimeTransaction[]>(mockAirtimeTransactions);

  const addTransaction = useCallback((transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => {
    const newTransaction: AirtimeTransaction = {
      ...transaction,
      id: `AIR${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const getStock = useCallback((provider: 'Moov' | 'Yas') => {
    return transactions
      .filter(t => t.provider === provider)
      .reduce((acc, t) => {
        if (t.type === 'purchase') return acc + t.amount;
        if (t.type === 'sale') return acc - t.amount;
        return acc;
      }, 0);
  }, [transactions]);
  

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    getStock,
  }), [transactions, addTransaction, getStock]);

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
