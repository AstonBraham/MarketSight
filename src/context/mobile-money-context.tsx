
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { MobileMoneyTransaction } from '@/lib/types';
import { mockMobileMoneyTransactions } from '@/lib/mock-data';
import { useTransactions } from './transaction-context';

interface MobileMoneyContextType {
  transactions: MobileMoneyTransaction[];
  addTransaction: (transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => void;
  getBalance: (provider: 'Mixx' | 'Flooz') => number;
}

const MobileMoneyContext = createContext<MobileMoneyContextType | undefined>(undefined);

export function MobileMoneyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>(mockMobileMoneyTransactions);
  const { addPurchase, addSale } = useTransactions();


  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id' | 'date'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Handle cash flow impact
    if (transaction.type === 'purchase') {
      addPurchase({
        description: `Achat virtuel ${transaction.provider}`,
        amount: transaction.amount,
        supplier: transaction.provider,
        product: 'Virtuel'
      });
    } else if (transaction.type === 'virtual_return' && transaction.provider === 'Mixx') {
       addSale({
        description: `Retour virtuel ${transaction.provider}`,
        amount: transaction.amount,
        client: transaction.provider,
        product: 'Virtuel'
      });
    } else if (transaction.type === 'virtual_return' && transaction.provider === 'Flooz') {
        addSale({
          description: `Retour virtuel ${transaction.provider}`,
          amount: transaction.amount,
          client: transaction.provider,
          product: 'Virtuel'
        });
    } else if (transaction.type === 'pos_transfer' && transaction.affectsCash) {
       addSale({
        description: `Transfert PDV ${transaction.provider}`,
        amount: transaction.amount,
        client: 'PDV',
        product: 'Virtuel'
      });
    }
  }, [addPurchase, addSale]);

  const getBalance = useCallback((provider: 'Mixx' | 'Flooz') => {
    return transactions
        .filter(t => t.provider === provider)
        .reduce((acc, t) => {
            if (t.type === 'deposit') return acc + t.amount;
            if (t.type === 'withdrawal') return acc - t.amount;
            if (t.type === 'purchase') return acc + t.amount; // Achat de virtuel augmente le solde
            if (t.type === 'virtual_return') return acc - t.amount; // Retour de virtuel diminue le solde
            if (t.type === 'pos_transfer') return acc - t.amount; // Transfert PDV diminue le solde
            if (t.type === 'collect_commission') return acc + t.amount; // Collecte de commission augmente le solde
            return acc;
        }, 0);
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    getBalance,
  }), [transactions, addTransaction, getBalance]);

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
