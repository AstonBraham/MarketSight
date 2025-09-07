

'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { AirtimeTransaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTransactions } from './transaction-context';
import { useAuditLog } from './audit-log-context';

interface AirtimeContextType {
  transactions: AirtimeTransaction[];
  setTransactions: (transactions: AirtimeTransaction[]) => void;
  addTransaction: (transaction: Omit<AirtimeTransaction, 'id'>) => void;
  updateTransaction: (id: string, updatedTransaction: Partial<Omit<AirtimeTransaction, 'id'>>) => void;
  addBulkTransactions: (transactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => void;
  removeTransaction: (id: string) => void;
  clearAirtimeTransactions: (providerToClear?: 'Moov' | 'Yas') => void;
  getStock: (provider: 'Moov' | 'Yas') => number;
  getProcessedTransactions: (provider: 'Moov' | 'Yas') => AirtimeTransaction[];
}

const AirtimeContext = createContext<AirtimeContextType | undefined>(undefined);

export function AirtimeProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<AirtimeTransaction[]>('airtimeTransactions', []);
  const { logAction } = useAuditLog();

  const addTransaction = useCallback((transaction: Omit<AirtimeTransaction, 'id'>) => {
    const newTransaction: AirtimeTransaction = {
      ...transaction,
      id: `AIR${Date.now()}`,
      date: transaction.date || new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    logAction('CREATE_AIRTIME_TRANSACTION', `Ajout transaction Airtime ${transaction.provider} de type ${transaction.type} pour ${transaction.amount}F.`);
  }, [setTransactions, logAction]);

  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Omit<AirtimeTransaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        logAction('UPDATE_AIRTIME_TRANSACTION', `Modification transaction Airtime ID ${id}.`);
        return { ...t, ...updatedTransaction, date: updatedTransaction.date || t.date };
      }
      return t;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setTransactions, logAction]);

  const addBulkTransactions = useCallback((newTransactions: Omit<AirtimeTransaction, 'id' | 'date'>[], providerToClear?: 'Moov' | 'Yas') => {
    const fullTransactions = newTransactions.map((t, i) => ({
      ...t,
      id: `AIRBULK-${Date.now()}-${i}`,
      date: t.date || new Date().toISOString()
    }));
    
    setTransactions(prev => {
        const otherProviderTransactions = providerToClear 
            ? prev.filter(t => t.provider !== providerToClear)
            : prev;
        
        return [...otherProviderTransactions, ...fullTransactions];
    });
    logAction('IMPORT_AIRTIME', `Importation de ${newTransactions.length} transactions pour ${providerToClear || 'tous les fournisseurs'}.`);
  }, [setTransactions, logAction]);

  const removeTransaction = useCallback((id: string) => {
    const trx = transactions.find(t => t.id === id);
    if(trx) {
      logAction('DELETE_AIRTIME_TRANSACTION', `Suppression transaction Airtime ID ${id} (${trx.type} ${trx.provider} ${trx.amount}F).`);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions, transactions, logAction]);

  const clearAirtimeTransactions = useCallback((providerToClear?: 'Moov' | 'Yas') => {
    if (providerToClear) {
        logAction('CLEAR_AIRTIME_DATA', `Suppression des transactions Airtime pour ${providerToClear}.`);
        setTransactions(prev => prev.filter(t => t.provider !== providerToClear));
    } else {
        logAction('CLEAR_AIRTIME_DATA', 'Suppression de toutes les transactions Airtime.');
        setTransactions([]);
    }
  }, [setTransactions, logAction]);

  const getStock = useCallback((provider: 'Moov' | 'Yas') => {
    return transactions
      .filter(t => t.provider === provider)
      .reduce((acc, t) => {
        if (t.type === 'purchase') {
            return acc + t.amount;
        }
        if (t.type === 'sale') {
            return acc - t.amount;
        }
        if (t.type === 'adjustment') {
            return acc + t.amount;
        }
        return acc;
      }, 0);
  }, [transactions]);

  const getProcessedTransactions = useCallback((provider: 'Moov' | 'Yas'): AirtimeTransaction[] => {
    const providerTransactions = transactions.filter(t => t.provider === provider);
    let balance = 0;
    const sorted = [...providerTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const withBalance = sorted.map(t => {
        if (t.type === 'purchase') {
            balance += t.amount;
        } else if (t.type === 'sale') {
            balance -= t.amount;
        } else if (t.type === 'adjustment') {
            balance += t.amount;
        }
        // Commissions do not affect airtime stock balance
        return { ...t, balance };
    });

    return withBalance.reverse();
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    addBulkTransactions,
    removeTransaction,
    clearAirtimeTransactions,
    getStock,
    getProcessedTransactions,
  }), [transactions, setTransactions, addTransaction, updateTransaction, addBulkTransactions, removeTransaction, clearAirtimeTransactions, getStock, getProcessedTransactions]);

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
