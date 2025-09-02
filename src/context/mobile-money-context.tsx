
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { MobileMoneyTransaction, MobileMoneyProvider } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface MobileMoneyContextType {
  transactions: MobileMoneyTransaction[];
  setTransactions: (transactions: MobileMoneyTransaction[]) => void;
  addTransaction: (transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => void;
  addBulkTransactions: (transactions: Omit<MobileMoneyTransaction, 'id' | 'date'>[], providerToClear?: MobileMoneyProvider) => void;
  removeTransaction: (id: string) => void;
  getBalance: (provider: MobileMoneyProvider) => number;
  getProcessedTransactions: (provider: MobileMoneyProvider) => MobileMoneyTransaction[];
}

const MobileMoneyContext = createContext<MobileMoneyContextType | undefined>(undefined);

export function MobileMoneyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<MobileMoneyTransaction[]>('mobileMoneyTransactions', []);

  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, [setTransactions]);

  const addBulkTransactions = useCallback((newTransactions: Omit<MobileMoneyTransaction, 'id' | 'date'>[], providerToClear?: MobileMoneyProvider) => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `MMBULK-${Date.now()}-${i}`,
      date: t.date || new Date().toISOString()
    }));
    
    setTransactions(prev => {
        const otherProviderTransactions = providerToClear 
            ? prev.filter(t => t.provider !== providerToClear)
            : []; 
        
        return [...otherProviderTransactions, ...fullTransactions];
    });

  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const getBalance = useCallback((provider: MobileMoneyProvider) => {
    return transactions
        .filter(t => t.provider === provider)
        .reduce((acc, t) => {
            switch (t.type) {
                case 'deposit':
                case 'purchase':
                case 'collect_commission':
                case 'transfer_from_pos':
                    return acc + t.amount;
                case 'withdrawal':
                    return acc - t.amount + t.commission;
                case 'virtual_return':
                case 'transfer_to_pos':
                case 'pos_transfer':
                    return acc - t.amount;
                case 'adjustment':
                    return acc + t.amount;
                default:
                    return acc;
            }
        }, 0);
  }, [transactions]);
  
  const getProcessedTransactions = useCallback((provider: MobileMoneyProvider) => {
     const providerTransactions = transactions.filter(t => t.provider === provider);
     let balance = 0;
     const sorted = [...providerTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
     
     const withBalance = sorted.map(t => {
         switch (t.type) {
            case 'deposit':
            case 'purchase':
            case 'collect_commission':
            case 'transfer_from_pos':
            case 'adjustment':
                balance += t.amount;
                break;
            case 'withdrawal':
                balance = balance - t.amount + t.commission;
                break;
            case 'virtual_return':
            case 'transfer_to_pos':
            case 'pos_transfer':
                balance -= t.amount;
                break;
        }
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
    getBalance,
    getProcessedTransactions,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, getBalance, getProcessedTransactions]);

  return (
    <MobileMoneyContext.Provider value={value}>
      {children}
    </MobileMoneyContext.Provider>
  );
}

export function useMobileMoney() {
  const context = useContext(MobileMoneyContext);
  if (context === undefined) {
    throw new Error('useMobileMoney must be used within a MobileMoneyProvider');
  }
  return context;
}
