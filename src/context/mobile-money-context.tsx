
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { MobileMoneyTransaction, MobileMoneyProvider } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTransactions } from './transaction-context';

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
  const { addAdjustment } = useTransactions();


  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Handle cash flow impact
    let cashFlowImpact: { amount: number, description: string } | null = null;
    
    switch(newTransaction.type) {
      case 'deposit':
        // Client gives us cash, it's an income
        cashFlowImpact = { amount: newTransaction.amount, description: `Dépôt MM ${newTransaction.provider} (${newTransaction.transactionId})` };
        break;
      case 'withdrawal':
        // We give cash to client, it's an expense
        cashFlowImpact = { amount: -newTransaction.amount, description: `Retrait MM ${newTransaction.provider} (${newTransaction.transactionId})` };
        break;
      case 'purchase':
        cashFlowImpact = { amount: -newTransaction.amount, description: `Achat virtuel ${newTransaction.provider} (${newTransaction.transactionId})` };
        break;
      case 'virtual_return':
        cashFlowImpact = { amount: newTransaction.amount, description: `Retour virtuel ${newTransaction.provider} (${newTransaction.transactionId})` };
        break;
      case 'transfer_to_pos':
        if (newTransaction.affectsCash) {
          cashFlowImpact = { amount: newTransaction.amount, description: `Transfert vers PDV ${newTransaction.phoneNumber} (${newTransaction.transactionId})` };
        }
        break;
      case 'transfer_from_pos':
        if (newTransaction.affectsCash) {
          cashFlowImpact = { amount: -newTransaction.amount, description: `Transfert depuis PDV ${newTransaction.phoneNumber} (${newTransaction.transactionId})` };
        }
        break;
    }

    if (cashFlowImpact) {
      addAdjustment({ ...cashFlowImpact, date: newTransaction.date });
    }

  }, [setTransactions, addAdjustment]);

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
                     // Virtual balance decreases by the amount, but increases by the commission
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
