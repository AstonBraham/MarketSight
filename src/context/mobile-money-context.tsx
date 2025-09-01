
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
  const { addPurchase, addSale, addExpense, addAdjustment } = useTransactions();


  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // This is the core logic to make Mobile Money operations affect cash flow
    switch (transaction.type) {
        case 'deposit':
            // Client gives us cash, we give them virtual. Cash goes UP.
            addSale({
                description: `Dépôt Mobile Money ${transaction.provider} - ${transaction.phoneNumber}`,
                amount: transaction.amount,
                client: 'Client Mobile Money',
                product: 'Dépôt Virtuel'
            });
            break;
        case 'withdrawal':
            // We give client cash, they give us virtual. Cash goes DOWN.
            addExpense({
                description: `Retrait Mobile Money ${transaction.provider} - ${transaction.phoneNumber}`,
                amount: transaction.amount,
                category: 'Retrait Mobile Money'
            });
            break;
        case 'purchase':
            // We buy virtual from operator. Cash goes DOWN.
            addPurchase({
                description: `Achat virtuel ${transaction.provider}`,
                amount: transaction.amount,
                supplier: transaction.provider,
                product: 'Virtuel',
                status: 'paid' // Virtual purchases are always paid immediately
            });
            break;
        case 'virtual_return':
            // We return virtual to operator, they give us cash. Cash goes UP.
            addSale({
                description: `Retour virtuel ${transaction.provider}`,
                amount: transaction.amount,
                client: transaction.provider,
                product: 'Virtuel'
            });
            break;
        case 'transfer_to_pos':
            // We send virtual to another agent. If they give us cash, cash goes UP.
            if (transaction.affectsCash) {
                addSale({
                    description: `Entrée de caisse pour transfert vers PDV ${transaction.phoneNumber}`,
                    amount: transaction.amount,
                    client: `PDV ${transaction.phoneNumber}`,
                    product: 'Transfert Virtuel',
                });
            }
            break;
        case 'transfer_from_pos':
            // We receive virtual from another agent. If we give them cash, cash goes DOWN.
            if (transaction.affectsCash) {
                addExpense({
                    description: `Sortie de caisse pour transfert depuis PDV ${transaction.phoneNumber}`,
                    amount: transaction.amount,
                    category: 'Transfert Mobile Money'
                });
            }
            break;
        // collect_commission and adjustment do not affect cash by default.
        // They are internal virtual balance operations.
    }
  }, [addPurchase, addSale, addExpense, setTransactions, addAdjustment]);

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
                    // We give virtual to client (-), we get commission (+)
                    return acc - t.amount + (t.commission || 0);
                case 'withdrawal':
                    // We get virtual from client (+), we get commission (+)
                    return acc + t.amount + (t.commission || 0);
                case 'purchase':
                case 'collect_commission':
                case 'transfer_from_pos':
                    // Our virtual balance increases
                    return acc + t.amount;
                case 'virtual_return':
                case 'transfer_to_pos':
                    // Our virtual balance decreases
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
