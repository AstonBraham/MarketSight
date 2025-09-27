
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { MobileMoneyTransaction, MobileMoneyProvider } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuditLog } from './audit-log-context';

interface MobileMoneyContextType {
  transactions: MobileMoneyTransaction[];
  setTransactions: (transactions: MobileMoneyTransaction[]) => void;
  addTransaction: (transaction: Omit<MobileMoneyTransaction, 'id'>) => void;
  updateTransaction: (id: string, updatedTransaction: Partial<Omit<MobileMoneyTransaction, 'id'>>) => void;
  addBulkTransactions: (transactions: Omit<MobileMoneyTransaction, 'id' | 'date'>[], providerToClear?: MobileMoneyProvider) => void;
  removeTransaction: (id: string) => void;
  clearMobileMoneyTransactions: (providerToClear?: MobileMoneyProvider) => void;
  getBalance: (provider: MobileMoneyProvider) => number;
  getProcessedTransactions: (provider: MobileMoneyProvider) => MobileMoneyTransaction[];
}

const MobileMoneyContext = createContext<MobileMoneyContextType | undefined>(undefined);

export function MobileMoneyProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<MobileMoneyTransaction[]>('mobileMoneyTransactions', []);
  const { logAction } = useAuditLog();

  const addTransaction = useCallback((transaction: Omit<MobileMoneyTransaction, 'id'>) => {
    const newTransaction: MobileMoneyTransaction = {
      ...transaction,
      id: `MM${Date.now()}`,
      date: transaction.date || new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    logAction('CREATE_MM_TRANSACTION', `Ajout transaction MM ${transaction.provider} de type ${transaction.type} pour ${transaction.amount}F.`);
  }, [setTransactions, logAction]);
  
  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Omit<MobileMoneyTransaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        logAction('UPDATE_MM_TRANSACTION', `Modification transaction MM ID ${id}.`);
        return { ...t, ...updatedTransaction, date: updatedTransaction.date || t.date };
      }
      return t;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setTransactions, logAction]);

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
        
        return [...transactionsToKeep, ...fullTransactions];
    });
    logAction('IMPORT_MM', `Importation de ${newTransactions.length} transactions MM pour ${providerToClear || 'tous les fournisseurs'}.`);
  }, [setTransactions, logAction]);

  const removeTransaction = useCallback((id: string) => {
    const trx = transactions.find(t => t.id === id);
    if(trx) {
      logAction('DELETE_MM_TRANSACTION', `Suppression transaction MM ID ${id} (${trx.type} ${trx.provider} ${trx.amount}F).`);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions, transactions, logAction]);

  const clearMobileMoneyTransactions = useCallback((providerToClear?: MobileMoneyProvider) => {
    if (providerToClear) {
        logAction('CLEAR_MM_DATA', `Suppression des transactions MM pour ${providerToClear}.`);
        setTransactions(prev => prev.filter(t => t.provider !== providerToClear));
    } else {
        logAction('CLEAR_MM_DATA', 'Suppression de toutes les transactions MM.');
        setTransactions([]);
    }
  }, [setTransactions, logAction]);
  
  const getBalance = useCallback((provider: MobileMoneyProvider) => {
    const providerTransactions = transactions.filter(t => t.provider === provider);
    return providerTransactions.reduce((acc, t) => {
        let newBalance = acc;
        switch (t.type) {
            case 'purchase': // Achat de virtuel
            case 'withdrawal': // Retrait client
            case 'transfer_to_pos': // Transfert vers un autre PDV
                newBalance -= t.amount;
                break;
            case 'deposit': // Dépôt client
            case 'transfer_from_pos': // Transfert depuis un autre PDV vers nous
            case 'virtual_return': // Retour de virtuel à l'opérateur
                 newBalance += t.amount;
                 break;
            case 'adjustment': // Ajustement manuel
            case 'collect_commission': // Collecte de commission (ajout au solde)
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
            case 'purchase': // Achat de virtuel
            case 'withdrawal': // Retrait client
            case 'transfer_to_pos': // Transfert vers un autre PDV
                newBalance -= t.amount;
                break;
            case 'deposit': // Dépôt client
            case 'transfer_from_pos': // Transfert depuis un autre PDV vers nous
            case 'virtual_return': // Retour de virtuel à l'opérateur
                 newBalance += t.amount;
                 break;
            case 'adjustment': // Ajustement manuel
            case 'collect_commission': // Collecte de commission (ajout au solde)
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
    updateTransaction,
    addBulkTransactions,
    removeTransaction,
    clearMobileMoneyTransactions,
    getBalance,
    getProcessedTransactions,
  }), [transactions, setTransactions, addTransaction, updateTransaction, addBulkTransactions, removeTransaction, clearMobileMoneyTransactions, getBalance, getProcessedTransactions]);

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
