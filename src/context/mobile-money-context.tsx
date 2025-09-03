
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
  clearMobileMoneyTransactions: () => void;
  getBalance: (provider: MobileMoneyProvider) => number;
  getProcessedTransactions: (provider: MobileMoneyProvider) => MobileMoneyTransaction[];
}

const MobileMoneyContext = createContext<MobileMoneyContextType | undefined>(undefined);

const initialMixxBalance: MobileMoneyTransaction = {
    id: 'INITIAL_MIXX_BALANCE',
    type: 'adjustment',
    provider: 'Mixx',
    amount: 2164,
    commission: 0,
    date: '2020-01-01T00:00:00.000Z', // Very old date
    description: 'Solde initial reporté',
};


export function MobileMoneyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<MobileMoneyTransaction[]>('mobileMoneyTransactions', [initialMixxBalance]);

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
        let existingTransactions = prev.filter(t => t.id !== initialMixxBalance.id);
        
        if (providerToClear) {
            existingTransactions = existingTransactions.filter(t => t.provider !== providerToClear);
        }
        
        return [initialMixxBalance, ...existingTransactions, ...fullTransactions];
    });

  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    if (id === initialMixxBalance.id) return; // Prevent deleting the initial balance
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const clearMobileMoneyTransactions = useCallback(() => {
    setTransactions([initialMixxBalance]);
  }, [setTransactions]);

  const getBalance = useCallback((provider: MobileMoneyProvider) => {
    return transactions
        .filter(t => t.provider === provider)
        .reduce((acc, t) => {
            switch (t.type) {
                case 'purchase':
                    return acc + t.amount;
                case 'withdrawal':
                    return acc - t.amount + t.commission;
                case 'deposit':
                    return acc - t.amount;
                case 'collect_commission':
                    return acc + t.amount;
                case 'virtual_return':
                case 'transfer_to_pos':
                case 'pos_transfer':
                    return acc - t.amount;
                case 'transfer_from_pos':
                    return acc + t.amount;
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
            case 'purchase':
                balance += t.amount;
                break;
            case 'withdrawal':
                balance = balance - t.amount + t.commission;
                break;
            case 'deposit':
                balance -= t.amount;
                break;
            case 'collect_commission':
                 balance += t.amount;
                 break;
            case 'virtual_return':
            case 'transfer_to_pos':
            case 'pos_transfer':
                balance -= t.amount;
                break;
             case 'transfer_from_pos':
                balance += t.amount;
                break;
             case 'adjustment':
                balance += t.amount;
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
    clearMobileMoneyTransactions,
    getBalance,
    getProcessedTransactions,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, clearMobileMoneyTransactions, getBalance, getProcessedTransactions]);

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
