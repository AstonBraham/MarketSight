
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
    date: '2024-07-25T00:00:00.000Z',
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
        let transactionsToKeep = prev;
        
        if (providerToClear) {
            transactionsToKeep = prev.filter(t => t.provider !== providerToClear);
        }
        
        // Always ensure the initial mixx balance is present if it was there before or if we are clearing Mixx
        if (!transactionsToKeep.some(t => t.id === initialMixxBalance.id)) {
            if (prev.some(t => t.id === initialMixxBalance.id) || providerToClear === 'Mixx') {
                transactionsToKeep.push(initialMixxBalance);
            }
        }
        
        return [...transactionsToKeep, ...fullTransactions];
    });

  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    if (id === initialMixxBalance.id) return; // Prevent deleting the initial balance
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const clearMobileMoneyTransactions = useCallback(() => {
    setTransactions(prev => prev.filter(t => t.id === initialMixxBalance.id));
  }, [setTransactions]);

  const getBalance = useCallback((provider: MobileMoneyProvider) => {
    const providerTransactions = transactions.filter(t => t.provider === provider);
    return providerTransactions.reduce((acc, t) => {
        let newBalance = acc;
        switch (t.type) {
            case 'purchase':
                newBalance += t.amount; // Achat de virtuel augmente le solde
                break;
            case 'withdrawal':
                newBalance += t.amount; // Retrait par client augmente le solde
                break;
            case 'deposit':
                newBalance -= t.amount; // Dépôt par client diminue le solde
                break;
            case 'collect_commission':
                newBalance += t.amount;
                break;
            case 'virtual_return':
            case 'transfer_from_pos':
                 newBalance += t.amount;
                break;
            case 'transfer_to_pos':
            case 'pos_transfer':
                newBalance -= t.amount;
                break;
            case 'adjustment':
                newBalance += t.amount;
                break;
            default:
                break;
        }
        newBalance += t.commission; // Commissions always increase balance
        return newBalance;
    }, 0);
  }, [transactions]);
  
  const getProcessedTransactions = useCallback((provider: MobileMoneyProvider) => {
     const providerTransactions = transactions.filter(t => t.provider === provider);
     const sorted = [...providerTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
     
     let runningBalance = 0;
     const withBalance = sorted.map(t => {
        let newBalance = runningBalance;
         switch (t.type) {
            case 'purchase':
                newBalance += t.amount;
                break;
            case 'withdrawal':
                newBalance += t.amount;
                break;
            case 'deposit':
                newBalance -= t.amount;
                break;
            case 'collect_commission':
                newBalance += t.amount;
                break;
            case 'virtual_return':
            case 'transfer_from_pos':
                 newBalance += t.amount;
                break;
            case 'transfer_to_pos':
            case 'pos_transfer':
                newBalance -= t.amount;
                break;
            case 'adjustment':
                newBalance += t.amount;
                break;
            default:
                break;
        }
        newBalance += t.commission; // Commissions always increase balance
        runningBalance = newBalance;
        return { ...t, balance: runningBalance };
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
