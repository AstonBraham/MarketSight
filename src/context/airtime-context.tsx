
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { AirtimeTransaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTransactions } from './transaction-context';

interface AirtimeContextType {
  transactions: AirtimeTransaction[];
  setTransactions: (transactions: AirtimeTransaction[]) => void;
  addTransaction: (transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => void;
  addBulkTransactions: (transactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => void;
  removeTransaction: (id: string) => void;
  getStock: (provider: 'Moov' | 'Yas') => number;
}

const AirtimeContext = createContext<AirtimeContextType | undefined>(undefined);

export function AirtimeProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<AirtimeTransaction[]>('airtimeTransactions', []);
  const { addSale, addPurchase } = useTransactions();


  const addTransaction = useCallback((transaction: Omit<AirtimeTransaction, 'id' | 'date'>) => {
    const newTransaction: AirtimeTransaction = {
      ...transaction,
      id: `AIR${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    if (transaction.type === 'sale') {
      addSale({
        description: `Vente Airtime ${transaction.provider} - ${transaction.phoneNumber || ''}`,
        product: `Airtime ${transaction.provider}`,
        itemType: 'Airtime',
        client: 'Client Airtime',
        amount: transaction.amount,
        quantity: 1,
        price: transaction.amount,
      });
    } else if (transaction.type === 'purchase') {
      addPurchase({
        description: `Achat Airtime ${transaction.provider}`,
        amount: transaction.amount,
        supplier: transaction.provider,
        product: 'Airtime',
        status: 'paid' // Airtime purchases are paid immediately from cash
      });
    }

  }, [setTransactions, addSale, addPurchase]);

  const addBulkTransactions = useCallback((newTransactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `AIRBULK-${Date.now()}-${i}`,
      date: t.date || new Date().toISOString()
    }));
    
    setTransactions(prev => {
        // Filter out transactions for the provider being cleared
        const otherProviderTransactions = providerToClear 
            ? prev.filter(t => t.provider !== providerToClear)
            : prev;
        
        // Add the new transactions
        return [...otherProviderTransactions, ...fullTransactions];
    });
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
