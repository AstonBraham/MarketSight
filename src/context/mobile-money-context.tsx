
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { MobileMoneyTransaction, MobileMoneyProvider } from '@/lib/types';
import { useTransactions } from './transaction-context';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface MobileMoneyContextType {
  transactions: MobileMoneyTransaction[];
  setTransactions: (transactions: MobileMoneyTransaction[]) => void;
  addTransaction: (transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => void;
  addBulkTransactions: (transactions: Omit<MobileMoneyTransaction, 'id' | 'date'>[], providerToClear?: MobileMoneyProvider) => void;
  removeTransaction: (id: string) => void;
  getBalance: (provider: MobileMoneyProvider) => number;
}

const MobileMoneyContext = createContext<MobileMoneyContextType | undefined>(undefined);

export function MobileMoneyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<MobileMoneyTransaction[]>('mobileMoneyTransactions', []);
  const { addPurchase, addSale, addExpense } = useTransactions();


  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Handle cash flow impact for specific transactions
    if (transaction.type === 'deposit') {
        addSale({
            description: `Dépôt Mobile Money ${transaction.provider} - ${transaction.phoneNumber}`,
            amount: transaction.amount,
            client: 'Client Mobile Money',
            product: 'Dépôt Virtuel'
        });
    } else if (transaction.type === 'withdrawal') {
        addExpense({
            description: `Retrait Mobile Money ${transaction.provider} - ${transaction.phoneNumber}`,
            amount: transaction.amount,
            category: 'Retrait Mobile Money'
        });
    } else if (transaction.type === 'purchase') {
      addPurchase({
        description: `Achat virtuel ${transaction.provider}`,
        amount: transaction.amount,
        supplier: transaction.provider,
        product: 'Virtuel',
        status: 'paid' // Virtual purchases are always paid immediately
      });
    } else if (transaction.type === 'virtual_return') {
        addSale({
          description: `Retour virtuel ${transaction.provider}`,
          amount: transaction.amount,
          client: transaction.provider,
          product: 'Virtuel'
        });
    }
  }, [addPurchase, addSale, addExpense, setTransactions]);

  const addBulkTransactions = useCallback((newTransactions: Omit<MobileMoneyTransaction, 'id' | 'date'>[], providerToClear?: MobileMoneyProvider) => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `MMBULK-${Date.now()}-${i}`,
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

  const getBalance = useCallback((provider: MobileMoneyProvider) => {
    return transactions
        .filter(t => t.provider === provider)
        .reduce((acc, t) => {
            if (t.type === 'deposit' || t.type === 'transfer_to_pos') {
                return acc - t.amount;
            }
             if(t.type === 'withdrawal') {
                return acc + t.amount + (t.commission || 0);
            }
             if (t.type === 'purchase' || t.type === 'collect_commission' || t.type === 'transfer_from_pos') {
                return acc + t.amount;
            }
            if (t.type === 'virtual_return') {
                return acc - t.amount;
            }
             if(t.type === 'adjustment') {
                return acc + t.amount;
            }
            return acc;
        }, 0);
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    addBulkTransactions,
    removeTransaction,
    getBalance,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, getBalance]);

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
