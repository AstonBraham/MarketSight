
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
  getCashFlowTransactions: () => { id: string; date: string; type: 'sale' | 'expense' | 'purchase'; amount: number; description: string; category: string }[];
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
                    // Our virtual balance increases
                    return acc + t.amount;
                case 'withdrawal':
                case 'virtual_return':
                case 'transfer_to_pos':
                case 'pos_transfer':
                    // Our virtual balance decreases
                    return acc - t.amount;
                case 'adjustment':
                    return acc + t.amount;
                default:
                    return acc;
            }
        }, 0);
  }, [transactions]);
  
  const getCashFlowTransactions = useCallback(() => {
    const cashFlow: { id: string; date: string; type: 'sale' | 'expense' | 'purchase'; amount: number; description: string; category: string }[] = [];

    transactions.forEach(t => {
      const cashFlowId = `VIRTUAL-${t.id}`;
      
      switch(t.type) {
          case 'deposit':
              // Client gives us cash, it's an income
              cashFlow.push({ id: cashFlowId, date: t.date, type: 'sale', amount: t.amount, description: `Dépôt MM ${t.provider}`, category: 'Mobile Money' });
              break;
          case 'withdrawal':
              // We give cash to client, it's an expense
              cashFlow.push({ id: cashFlowId, date: t.date, type: 'expense', amount: t.amount, description: `Retrait MM ${t.provider}`, category: 'Mobile Money' });
              // But we earn commission, so it's an income
              if (t.commission > 0) {
                 cashFlow.push({ id: `${cashFlowId}-COMM`, date: t.date, type: 'sale', amount: t.commission, description: `Commission Retrait MM ${t.provider}`, category: 'Mobile Money' });
              }
              break;
          case 'purchase':
              cashFlow.push({ id: cashFlowId, date: t.date, type: 'purchase', amount: t.amount, description: `Achat virtuel ${t.provider}`, category: 'Mobile Money' });
              break;
          case 'virtual_return':
              // We get cash back, it's an income
              cashFlow.push({ id: cashFlowId, date: t.date, type: 'sale', amount: t.amount, description: `Retour virtuel ${t.provider}`, category: 'Mobile Money' });
              break;
          case 'transfer_to_pos':
              // We send virtual, if it affects cash, we receive cash (income)
              if (t.affectsCash) {
                  cashFlow.push({ id: cashFlowId, date: t.date, type: 'sale', amount: t.amount, description: `Transfert vers PDV ${t.phoneNumber}`, category: 'Mobile Money' });
              }
              break;
          case 'transfer_from_pos':
               // We receive virtual, if it affects cash, we give cash (expense)
               if (t.affectsCash) {
                  cashFlow.push({ id: cashFlowId, date: t.date, type: 'expense', amount: t.amount, description: `Transfert depuis PDV ${t.phoneNumber}`, category: 'Mobile Money' });
              }
              break;
      }
    });

    return cashFlow;
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    addBulkTransactions,
    removeTransaction,
    getBalance,
    getCashFlowTransactions,
  }), [transactions, setTransactions, addTransaction, addBulkTransactions, removeTransaction, getBalance, getCashFlowTransactions]);

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
