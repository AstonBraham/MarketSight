

'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Sale, Purchase, Expense, Transaction, Invoice, InvoiceItem, CashClosing, AirtimeTransaction, MobileMoneyTransaction, HistoryTransaction, StockMovement, InventoryItem } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { startOfDay, endOfDay, isEqual } from 'date-fns';
import { useAirtime } from './airtime-context';
import { useMobileMoney } from './mobile-money-context';
import { useInventory } from './inventory-context';
import { useAuditLog } from './audit-log-context';

interface TransactionContextType {
  transactions: (Sale | Purchase | Expense | Transaction)[];
  setTransactions: (transactions: (Sale | Purchase | Expense | Transaction)[]) => void;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  receipts: Transaction[];
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  cashClosings: CashClosing[];
  setCashClosings: (cashClosings: CashClosing[]) => void;
  expenseCategories: string[];
  addSale: (sale: Omit<Sale, 'id' | 'type' | 'category'>) => { success: boolean; message: string };
  updateSale: (saleId: string, updatedValues: { quantity: number; price: number }) => { success: boolean, message: string };
  returnSale: (saleId: string) => void;
  addBulkSales: (sales: Omit<Sale, 'id' | 'type' | 'category'>[]) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => void;
  updatePurchase: (purchaseId: string, updatedValues: Partial<Purchase>) => { success: boolean, message: string };
  payPurchase: (purchaseId: string) => { success: boolean, message: string };
  addExpense: (expense: Omit<Expense, 'id' | 'type' | 'currency'>) => void;
  updateExpense: (id: string, updatedExpense: Partial<Omit<Expense, 'id' | 'type' | 'currency'>>) => void;
  addBulkExpenses: (expenses: Omit<Expense, 'id' | 'type' | 'currency'>[]) => void;
  removeExpense: (id: string) => void;
  addExpenseCategory: (category: string) => void;
  addAdjustment: (adjustment: { amount: number; description: string, date?: string, category?: string }) => void;
  addBulkAdjustments: (adjustments: Omit<Transaction, 'id' | 'type' | 'category'>[]) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  getInvoice: (id: string) => Invoice | undefined;
  removeInvoice: (invoiceId: string) => void;
  getAllTransactions: () => Transaction[];
  getDailyHistory: (date: Date) => HistoryTransaction[];
  getAllHistory: () => HistoryTransaction[];
  addCashClosing: (closing: Omit<CashClosing, 'id' | 'date'>) => void;
  getLastClosingDate: () => Date | null;
  clearWifiSales: () => void;
  clearCashTransactions: () => void;
  clearInvoices: () => void;
  clearCashClosings: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<(Sale | Purchase | Expense | Transaction)[]>('transactions', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [cashClosings, setCashClosings] = useLocalStorage<CashClosing[]>('cashClosings', []);
  const { logAction } = useAuditLog();
  
  const { transactions: airtimeTransactions } = useAirtime();
  const { transactions: mobileMoneyTransactions } = useMobileMoney();
  const { inventory, updateItem: updateInventoryItem, stockMovements, addStockMovement } = useInventory();

  useEffect(() => {
    // This is a one-time data migration script to fix categories.
    const descriptionsToFix = [
        "Marge sur achat credit Togocel", "Marge sur achat credit Moov", "Entrée de caisse",
        "Entrée de caisse Patron", "Encaissement", "Achat de boissons pour la boutique pour 34000",
        "Achat de boissons pour la boutique pour 37350", "Complément pour achat de boissons",
        "Entrée de caisse pour achat de lubrifiants", "Remboursement JP", "Du Patron",
        "ENtrée en caisse du patron", "ADJ-BULK-1757154365827-107"
    ];

    setTransactions(prev => {
        let hasChanged = false;
        const updatedTransactions = prev.map(t => {
            const descriptionMatches = descriptionsToFix.some(desc => t.description === desc || t.id === desc);
            
            if (t.type === 'adjustment' && descriptionMatches && t.category !== 'Encaissement') {
                hasChanged = true;
                return { ...t, category: 'Encaissement' };
            }
            return t;
        });

        if (hasChanged) {
            return updatedTransactions;
        }
        return prev;
    });
  }, [setTransactions]);

  const expenseCategories = useMemo(() => {
    const categories = transactions
      .filter(t => t.type === 'expense' && t.category)
      .map(t => t.category!);
    return [...new Set(categories)].sort();
  }, [transactions]);
  
  const addExpenseCategory = useCallback((category: string) => {
    logAction('CREATE_CATEGORY', `Création d'une nouvelle catégorie de dépense : ${category}.`);
  }, [logAction]);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'type' | 'category'>): { success: boolean; message: string } => {
    const item = inventory.find(i => i.id === sale.inventoryId);
    let quantityToSell = sale.quantity || 0;
    
    // For sales without inventory item (like Wifi), we don't do stock checks
    if(sale.inventoryId && item) {
        // Check stock and try to break a pack if needed
        if (quantityToSell > item.inStock) {
            if (item.parentItemId && item.unitsPerParent) {
                const parentItem = inventory.find(p => p.id === item.parentItemId);
                if (parentItem && parentItem.inStock > 0) {
                    updateInventoryItem(parentItem.id, { inStock: parentItem.inStock - 1 }, `Casse pour vente de ${item.productName}`);
                    updateInventoryItem(item.id, { inStock: item.inStock + item.unitsPerParent }, `Casse de ${parentItem.productName}`);
                    logAction('BREAK_PACK', `Casse auto de 1 pack de "${parentItem.productName}" pour vente.`);
                }
            }
        }

        const refreshedItem = inventory.find(i => i.id === sale.inventoryId);
        if(!refreshedItem || quantityToSell > refreshedItem.inStock) {
            const stockAvailable = refreshedItem ? refreshedItem.inStock : 0;
            const message = `Stock insuffisant pour ${sale.product}. Stock disponible : ${stockAvailable}, demandé : ${quantityToSell}.`;
            return { success: false, message };
        }
    }


    const costPrice = item?.costPrice || 0;
    const margin = sale.amount - (costPrice * quantityToSell);

    const newSale: Sale = {
      ...sale,
      id: `SALE${Date.now()}`,
      type: 'sale',
      date: sale.date || new Date().toISOString(),
      category: 'Vente',
      costPrice: costPrice,
      margin: margin,
    };
    setTransactions(prev => [newSale, ...prev]);
    logAction('CREATE_SALE', `Vente de "${sale.product}" pour ${sale.amount}F.`);

    if (newSale.inventoryId && newSale.quantity) {
        const currentItemState = inventory.find(i => i.id === newSale.inventoryId);
        if (currentItemState) {
            addStockMovement({
                inventoryId: currentItemState.id,
                productName: currentItemState.productName,
                type: 'out',
                quantity: -newSale.quantity,
                reason: `Vente (Client: ${newSale.client})`,
                balanceBefore: currentItemState.inStock,
                balanceAfter: currentItemState.inStock - newSale.quantity,
                relatedTransactionId: newSale.id
            });
            updateInventoryItem(
                currentItemState.id, 
                { inStock: currentItemState.inStock - newSale.quantity }
            );
        }
    }
    return { success: true, message: "Vente enregistrée avec succès." };
  }, [inventory, updateInventoryItem, logAction, setTransactions, addStockMovement]);

  const updateSale = useCallback((saleId: string, updatedValues: { quantity: number; price: number }): { success: boolean, message: string } => {
    const originalSale = transactions.find(t => t.id === saleId && t.type === 'sale') as Sale | undefined;
    if (!originalSale || !originalSale.inventoryId) {
        return { success: false, message: 'Vente originale non trouvée ou non liée à un stock.' };
    }

    const item = inventory.find(i => i.id === originalSale.inventoryId);
    if (!item) {
        return { success: false, message: `Article ${originalSale.product} non trouvé.` };
    }
    
    const stockChange = originalSale.quantity! - updatedValues.quantity;
    const newStock = item.inStock + stockChange;
    if (newStock < 0) {
        return { success: false, message: `Stock insuffisant pour effectuer cette modification. Stock disponible: ${item.inStock + originalSale.quantity!}` };
    }

    addStockMovement({
        inventoryId: item.id,
        productName: item.productName,
        type: stockChange > 0 ? 'in' : 'out',
        quantity: stockChange,
        reason: `Modification vente ${saleId}`,
        balanceBefore: item.inStock,
        balanceAfter: newStock,
        relatedTransactionId: saleId
    });
    
    // Update inventory first
    updateInventoryItem(item.id, { inStock: newStock });
    
    // Update the sale transaction itself
    const newAmount = updatedValues.price * updatedValues.quantity;
    const newMargin = newAmount - ((originalSale.costPrice || 0) * updatedValues.quantity);

    setTransactions(prev => prev.map(t => {
        if (t.id === saleId) {
            logAction('UPDATE_SALE', `Modification vente ${saleId}. Qté: ${originalSale.quantity} -> ${updatedValues.quantity}, Montant: ${originalSale.amount} -> ${newAmount}`);
            return {
                ...t,
                quantity: updatedValues.quantity,
                price: updatedValues.price,
                amount: newAmount,
                margin: newMargin,
                date: new Date().toISOString() // Update date to reflect change time
            };
        }
        return t;
    }));

    return { success: true, message: 'Vente modifiée avec succès.' };

  }, [transactions, inventory, setTransactions, updateInventoryItem, logAction, addStockMovement]);

  const returnSale = useCallback((saleId: string) => {
    const saleToReturn = transactions.find(t => t.id === saleId && t.type === 'sale') as Sale | undefined;

    if (!saleToReturn) {
      console.error("Sale to return not found");
      return;
    }

    // 1. Create a negative transaction for the return
    const returnTransaction: Transaction = {
      id: `RET-${saleToReturn.id}`,
      type: 'expense', // Treat it as an expense for cash flow purposes
      date: new Date().toISOString(),
      description: `Retour/Annulation: ${saleToReturn.product} (Vente: ${saleToReturn.id})`,
      amount: saleToReturn.amount, // Stored as a positive number for expenses
      category: 'Retour Client',
    };
    logAction('RETURN_SALE', `Retour de "${saleToReturn.product}" pour ${saleToReturn.amount}F.`);
    
    // 2. Add the item back to stock
    if (saleToReturn.inventoryId && saleToReturn.quantity) {
      const item = inventory.find(i => i.id === saleToReturn.inventoryId);
      if (item) {
        addStockMovement({
            inventoryId: item.id,
            productName: item.productName,
            type: 'in',
            quantity: saleToReturn.quantity,
            reason: `Retour vente ${saleToReturn.id}`,
            balanceBefore: item.inStock,
            balanceAfter: item.inStock + saleToReturn.quantity,
            relatedTransactionId: returnTransaction.id
        });
        updateInventoryItem(
          item.id, 
          { inStock: item.inStock + saleToReturn.quantity }
        );
      }
    }

    // 3. Remove the original sale and add the return transaction
    setTransactions(prev => {
        const otherTransactions = prev.filter(t => t.id !== saleId);
        return [returnTransaction, ...otherTransactions];
    });

  }, [transactions, inventory, updateInventoryItem, setTransactions, logAction, addStockMovement]);

  const addBulkSales = useCallback((sales: Omit<Sale, 'id'|'type'|'category'>[]) => {
    const newSales: Sale[] = sales.map((sale, index) => {
      const item = inventory.find(i => (i.sku && i.sku === sale.reference) || (i.reference && i.reference === sale.reference));
      const costPrice = item?.costPrice || 0;
      const margin = sale.amount - (costPrice * (sale.quantity || 1));
      
      return {
        ...sale,
        id: `SALE-BULK-${Date.now()}-${index}`,
        type: 'sale',
        date: sale.date || new Date().toISOString(),
        category: 'Vente',
        costPrice: costPrice,
        margin: margin,
        inventoryId: item?.id
      }
    });
    setTransactions(prev => [...prev, ...newSales]);
    logAction('IMPORT_SALES', `Importation de ${sales.length} ventes.`);
    // Note: Bulk sale import currently does not update inventory stock.
    // This could be a future improvement if needed.
  }, [setTransactions, inventory, logAction]);
  
  const clearWifiSales = useCallback(() => {
    logAction('CLEAR_WIFI_SALES', 'Suppression de toutes les ventes Wifi.');
    setTransactions(prev => prev.filter(t => (t as Sale).itemType !== 'Ticket Wifi'));
  }, [setTransactions, logAction]);
  
  const clearCashTransactions = useCallback(() => {
    logAction('CLEAR_CASH_TRANSACTIONS', 'Suppression de toutes les transactions de caisse.');
    setTransactions([]);
  }, [setTransactions, logAction]);

  const clearInvoices = useCallback(() => {
    logAction('CLEAR_INVOICES', 'Suppression de toutes les factures.');
    setInvoices([]);
  }, [setInvoices, logAction]);

  const clearCashClosings = useCallback(() => {
    logAction('CLEAR_CASH_CLOSINGS', 'Suppression de tous les arrêtés de caisse.');
    setCashClosings([]);
  }, [setCashClosings, logAction]);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'type' | 'date' | 'category'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `PUR${Date.now()}`,
      type: 'purchase',
      date: new Date().toISOString(),
      category: 'Achat',
    };
    logAction('CREATE_PURCHASE', `Achat de "${purchase.product}" pour ${purchase.amount}F. Statut: ${newPurchase.status}.`);

    if (newPurchase.status !== 'paid') {
      // For unpaid purchases, just add them to the list without affecting cash.
      setTransactions(prev => [...prev, newPurchase]);
    } else {
      // For paid purchases, add them and they will be picked up by getAllTransactions for cash flow.
      setTransactions(prev => [...prev, newPurchase]);
    }

    if (newPurchase.inventoryId && newPurchase.quantity) {
        const item = inventory.find(i => i.id === newPurchase.inventoryId);
        if (item) {
            const oldStock = item.inStock;
            const oldCostPrice = item.costPrice || 0;
            const oldStockValue = oldStock * oldCostPrice;

            const purchaseValue = newPurchase.amount + (newPurchase.additionalCosts || 0);
            const newStock = oldStock + newPurchase.quantity;
            const newCostPrice = newStock > 0 ? (oldStockValue + purchaseValue) / newStock : purchaseValue / newPurchase.quantity;

            addStockMovement({
                inventoryId: item.id,
                productName: item.productName,
                type: 'in',
                quantity: newPurchase.quantity,
                reason: `Achat (Fournisseur: ${newPurchase.supplier})`,
                balanceBefore: oldStock,
                balanceAfter: newStock,
                relatedTransactionId: newPurchase.id
            });
            updateInventoryItem(
                item.id,
                { inStock: newStock, costPrice: newCostPrice }
            );
        }
    }

  }, [setTransactions, inventory, updateInventoryItem, logAction, addStockMovement]);

  const updatePurchase = useCallback((purchaseId: string, updatedValues: Partial<Purchase>): { success: boolean, message: string } => {
    const originalPurchase = transactions.find(t => t.id === purchaseId && t.type === 'purchase') as Purchase | undefined;
    if (!originalPurchase || !originalPurchase.inventoryId) {
        return { success: false, message: 'Achat original non trouvé ou non lié à un stock.' };
    }

    const item = inventory.find(i => i.id === originalPurchase.inventoryId);
    if (!item) {
        return { success: false, message: `Article ${originalPurchase.product} non trouvé.` };
    }
    
    // --- Stock & CUMP recalculation logic ---
    const originalQuantity = originalPurchase.quantity || 0;
    const originalAmount = originalPurchase.amount + (originalPurchase.additionalCosts || 0);
    const updatedQuantity = updatedValues.quantity ?? originalQuantity;
    const updatedAmount = (updatedValues.amount ?? originalPurchase.amount) + (updatedValues.additionalCosts ?? originalPurchase.additionalCosts ?? 0);
    
    // Revert the old purchase from inventory
    const stockWithoutThisPurchase = item.inStock - originalQuantity;
    if (stockWithoutThisPurchase < 0) {
        return { success: false, message: `Impossible d'annuler l'achat: le stock deviendrait négatif.` };
    }
    const valueWithoutThisPurchase = (item.inStock * (item.costPrice || 0)) - originalAmount;
    
    // Apply the new purchase
    const newStock = stockWithoutThisPurchase + updatedQuantity;
    const newValue = valueWithoutThisPurchase + updatedAmount;
    const newCump = newStock > 0 ? newValue / newStock : 0;
    
    // Update inventory item with new stock and CUMP
    updateInventoryItem(item.id, { inStock: newStock, costPrice: newCump });
    addStockMovement({
        inventoryId: item.id,
        productName: item.productName,
        type: 'adjustment',
        quantity: updatedQuantity - originalQuantity,
        reason: `Modification achat ${purchaseId}`,
        balanceBefore: item.inStock,
        balanceAfter: newStock,
        relatedTransactionId: purchaseId
    });
    
    // --- Status change logic ---
    const originalStatus = originalPurchase.status;
    const newStatus = updatedValues.status;

    if (newStatus && newStatus !== originalStatus) {
        if (newStatus === 'paid' && originalStatus === 'unpaid') {
            // This is handled by the cash flow logic automatically when status changes
             logAction('PAY_PURCHASE', `Paiement de l'achat ID ${purchaseId} via modification.`);
        } else if (newStatus === 'unpaid' && originalStatus === 'paid') {
            logAction('UNPAY_PURCHASE', `Annulation du paiement de l'achat ID ${purchaseId} via modification.`);
        }
    }

    // --- Update the purchase transaction itself ---
    setTransactions(prev => prev.map(t => {
        if (t.id === purchaseId) {
            logAction('UPDATE_PURCHASE', `Modification achat ${purchaseId}.`);
            return { ...t, ...updatedValues, date: new Date().toISOString() };
        }
        return t;
    }));

    return { success: true, message: 'Achat et stock mis à jour.' };
  }, [transactions, inventory, setTransactions, updateInventoryItem, logAction, addStockMovement]);
  
  const payPurchase = useCallback((purchaseId: string): { success: boolean, message: string } => {
    let purchaseToPay: Purchase | undefined;

    const currentTransactions = transactions;
    const purchaseIndex = currentTransactions.findIndex(t => t.id === purchaseId && t.type === 'purchase');

    if (purchaseIndex === -1) {
        return { success: false, message: "Achat non trouvé." };
    }
    
    purchaseToPay = currentTransactions[purchaseIndex] as Purchase;
    
    if (purchaseToPay.status === 'paid') {
        return { success: false, message: "Cet achat a déjà été réglé." };
    }

    const updatedPurchase: Purchase = { ...purchaseToPay, status: 'paid', date: new Date().toISOString() };

    setTransactions(prev => prev.map(t => t.id === purchaseId ? updatedPurchase : t));
    logAction('PAY_PURCHASE', `Paiement de l'achat ID ${purchaseId} pour ${purchaseToPay.amount}F.`);

    return { success: true, message: "Achat payé avec succès." };
  }, [transactions, setTransactions, logAction]);


  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'type' | 'currency'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP${Date.now()}`,
      type: 'expense',
      date: expense.date || new Date().toISOString(),
      currency: 'F',
      category: expense.category || 'Dépense',
    };
    logAction('CREATE_EXPENSE', `Ajout dépense "${expense.description}" pour ${expense.amount}F.`);
    setTransactions(prev => [newExpense, ...prev]);
  }, [setTransactions, logAction]);
  
  const updateExpense = useCallback((id: string, updatedExpense: Partial<Omit<Expense, 'id' | 'type' | 'currency'>>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id && t.type === 'expense') {
        logAction('UPDATE_EXPENSE', `Modification de la dépense ID ${id}.`);
        return { ...t, ...updatedExpense, date: updatedExpense.date || t.date };
      }
      return t;
    }));
  }, [setTransactions, logAction]);

  const addBulkExpenses = useCallback((expenses: Omit<Expense, 'id'|'type'|'currency'>[]) => {
    const newExpenses: Expense[] = expenses.map((expense, index) => ({
        ...expense,
        id: `EXP-BULK-${Date.now()}-${index}`,
        type: 'expense',
        date: expense.date || new Date().toISOString(),
        currency: 'F',
        category: expense.category || 'Dépense',
    }));
    logAction('IMPORT_EXPENSES', `Importation de ${expenses.length} dépenses.`);
    setTransactions(prev => [...prev, ...newExpenses]);
  }, [setTransactions, logAction]);

  const removeExpense = useCallback((id: string) => {
    const trx = transactions.find(t => t.id === id && t.type === 'expense');
    if(trx) {
      logAction('DELETE_EXPENSE', `Suppression de la dépense ID ${id} (${trx.description}).`);
    }
    setTransactions(prev => prev.filter(t => t.id !== id && t.type === 'expense'));
  }, [transactions, setTransactions, logAction]);

  const addAdjustment = useCallback((adjustment: { amount: number; description: string, date?: string, category?: string }) => {
    const newAdjustment: Transaction = {
      ...adjustment,
      id: `ADJ${Date.now()}`,
      type: 'adjustment',
      date: adjustment.date || new Date().toISOString(),
      category: adjustment.category || 'Ajustement'
    };
    logAction('CREATE_ADJUSTMENT', `Ajout d'un ajustement de caisse: "${adjustment.description}" pour ${adjustment.amount}F.`);
    setTransactions(prev => [newAdjustment, ...prev]);
  }, [setTransactions, logAction]);

  const addBulkAdjustments = useCallback((adjustments: Omit<Transaction, 'id' | 'type' | 'category'>[]) => {
    const newAdjustments: Transaction[] = adjustments.map((adj, index) => ({
      ...adj,
      id: `ADJ-BULK-${Date.now()}-${index}`,
      type: 'adjustment',
      date: adj.date || new Date().toISOString(),
      category: 'Encaissement',
    }));
    logAction('IMPORT_RECEIPTS', `Importation de ${adjustments.length} encaissements.`);
    setTransactions(prev => [...prev, ...newAdjustments]);
  }, [setTransactions, logAction]);
  
  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id'>): string => {
    const newId = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    logAction('CREATE_INVOICE', `Création de la facture ${newId} pour ${invoiceData.clientName} d'un montant de ${invoiceData.total}F.`);

    const saleTransaction: Sale = {
      id: `SALE-INV-${newId}`,
      type: 'sale',
      date: invoiceData.date,
      category: 'Vente Facture',
      description: `Vente sur Facture ${newId}`,
      amount: invoiceData.total,
      client: invoiceData.clientName,
      product: `Facture ${newId}`,
      invoiceId: newId,
    }
    setTransactions(prev => [saleTransaction, ...prev]);

    return newId;
  }, [setInvoices, logAction, setTransactions]);
  
  const getInvoice = useCallback((id: string) => {
    return invoices.find(invoice => invoice.id === id);
  }, [invoices]);
  
  const removeInvoice = useCallback((invoiceId: string) => {
    const invoiceToRemove = invoices.find(inv => inv.id === invoiceId);
    if (!invoiceToRemove) return;

    logAction('DELETE_INVOICE', `Suppression de la facture ${invoiceId}.`);
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setTransactions(prev => prev.filter(t => (t as Sale).invoiceId !== invoiceId));

    invoiceToRemove.items.forEach(item => {
      if (item.inventoryId && item.quantity) {
        const inventoryItem = inventory.find(i => i.id === item.inventoryId);
        if (inventoryItem) {
          updateInventoryItem(
            inventoryItem.id, 
            { inStock: inventoryItem.inStock + item.quantity }
          );
           addStockMovement({
                inventoryId: inventoryItem.id,
                productName: inventoryItem.productName,
                type: 'in',
                quantity: item.quantity,
                reason: `Annulation Vente Facture ${invoiceId}`,
                balanceBefore: inventoryItem.inStock,
                balanceAfter: inventoryItem.inStock + item.quantity,
            });
        }
      }
    });

  }, [invoices, inventory, setInvoices, setTransactions, logAction, updateInventoryItem, addStockMovement]);

  const addCashClosing = useCallback((closing: Omit<CashClosing, 'id' | 'date'>) => {
    const newClosing: CashClosing = {
      ...closing,
      id: `CC${Date.now()}`,
      date: new Date().toISOString(),
    };
    setCashClosings(prev => [newClosing, ...prev]);
    logAction('CASH_CLOSING', `Arrêté de caisse effectué avec un écart de ${closing.variance}F.`);

    if (newClosing.variance !== 0) {
      addAdjustment({
        amount: newClosing.variance,
        description: `Ajustement suite à l'arrêté de caisse du ${new Date(newClosing.date).toLocaleDateString()}`,
      });
    }
  }, [addAdjustment, setCashClosings, logAction]);
  
  const sortedCashClosings = useMemo(() => {
    return [...cashClosings].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashClosings]);

  const getLastClosingDate = useCallback(() => {
    if (sortedCashClosings.length === 0) return null;
    return new Date(sortedCashClosings[0].date);
  }, [sortedCashClosings]);

  const getAllTransactions = useCallback((): Transaction[] => {
    let allCashTransactions: Transaction[] = [];

    // 1. Core transactions (sales, paid purchases, expenses, adjustments)
    transactions.forEach(t => {
      if (t.type === 'sale' || t.type === 'expense' || t.type === 'adjustment') {
        allCashTransactions.push(t);
      } else if (t.type === 'purchase' && (t as Purchase).status !== 'unpaid') {
        allCashTransactions.push(t);
      }
    });

    // 2. Airtime transactions that affect cash
    airtimeTransactions.forEach(t => {
      if (t.type === 'sale' || t.type === 'purchase' || t.type === 'commission') {
        const amount = t.type === 'commission' ? t.commission : t.amount;
        const type = t.type === 'sale' || t.type === 'commission' ? 'sale' : 'purchase';
        const description = t.type === 'commission' ? `Commission Airtime ${t.provider}` : `${type === 'sale' ? 'Vente' : 'Achat'} Airtime ${t.provider}`;
        allCashTransactions.push({ id: t.id, type, date: t.date, amount, description });
      }
    });

    // 3. Mobile Money transactions
    mobileMoneyTransactions.forEach(t => {
        let cashFlowImpact = 0;
        let type: 'sale' | 'purchase' = 'sale';
        let description = '';

        const baseDesc = `${t.provider} (${t.phoneNumber || t.transactionId || ''})`

        switch (t.type) {
            case 'deposit':
                cashFlowImpact = t.amount;
                type = 'sale';
                description = `Encaissement Dépôt MM ${baseDesc}`;
                break;
            case 'withdrawal':
                cashFlowImpact = -t.amount;
                type = 'purchase';
                description = `Décaissement Retrait MM ${baseDesc}`;
                break;
            case 'purchase':
                cashFlowImpact = -t.amount;
                type = 'purchase';
                description = `Achat de virtuel ${t.provider}`;
                break;
            case 'virtual_return':
                cashFlowImpact = t.amount;
                type = 'sale';
                description = `Retour de virtuel ${t.provider}`;
                break;
             case 'transfer_to_pos':
             case 'transfer_from_pos':
                if (t.affectsCash) {
                  cashFlowImpact = t.type === 'transfer_to_pos' ? t.amount : -t.amount;
                  type = t.type === 'transfer_to_pos' ? 'sale' : 'purchase';
                  description = `Transfert caisse ${t.type === 'transfer_to_pos' ? 'vers' : 'depuis'} PDV ${t.phoneNumber}`;
                }
                break;
            case 'collect_commission':
              cashFlowImpact = t.commission;
              type = 'sale';
              description = `Collecte de commission ${t.provider}`;
              break;
        }
        
        if (cashFlowImpact !== 0) {
            allCashTransactions.push({ id: t.id, type, date: t.date, amount: Math.abs(cashFlowImpact), description });
        }
    });

    return allCashTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as Transaction[];
  }, [transactions, airtimeTransactions, mobileMoneyTransactions]);
  
  const getAllHistory = useCallback((): HistoryTransaction[] => {
    let allDailyTransactions: HistoryTransaction[] = [];

    // Base transactions (sales, expenses, purchases, adjustments)
    transactions
        .forEach(t => {
            let type = t.type;
            let link: string | undefined = undefined;
            let amount = 0;
            let affectsCash = false;

            if (t.type === 'sale') {
                const sale = t as Sale;
                amount = sale.amount;
                affectsCash = true;
                if (sale.itemType === 'Ticket Wifi') type = 'Vente Wifi';
                if (sale.invoiceId) {
                    type = 'Facture';
                    link = `/invoices/${sale.invoiceId}`;
                }
            } else if (t.type === 'purchase') {
                amount = -(t.amount);
                affectsCash = (t as Purchase).status !== 'unpaid';
            } else if (t.type === 'expense') {
                amount = -(t.amount);
                affectsCash = true;
            } else if (t.type === 'adjustment') {
                amount = t.amount;
                affectsCash = true;
            }
            allDailyTransactions.push({ ...t, amount, type, link, affectsCash });
        });

    // Airtime Transactions
    airtimeTransactions
        .forEach(at => {
            let amount = 0;
            let type = at.type;
            let affectsCash = false;
            if (at.type === 'sale') {
                amount = at.amount;
                type = 'Vente Airtime' as any;
                affectsCash = true;
            } else if (at.type === 'purchase') {
                amount = -at.amount;
                type = 'Achat Airtime' as any;
                affectsCash = true;
            } else if (at.type === 'commission') {
                amount = at.commission;
                type = 'Commission Airtime' as any;
                affectsCash = true;
            } else if (at.type === 'adjustment') {
                amount = 0; // Purely virtual
            }
            if(affectsCash) {
              allDailyTransactions.push({ ...at, type, source: at.provider, amount, description: at.description || `Airtime ${at.provider}`, affectsCash });
            }
        });
    
    // Mobile Money Transactions
    mobileMoneyTransactions
        .forEach(mt => {
            let amount = 0;
            let type = mt.type;
            let description = mt.description || `${type} ${mt.provider}`;
            let affectsCash = false;

             switch (mt.type) {
                case 'deposit': amount = mt.amount; description = `Dépôt MM ${mt.provider}`; affectsCash=true; break;
                case 'withdrawal': amount = -mt.amount; description = `Retrait MM ${mt.provider}`; affectsCash=true; break;
                case 'purchase': amount = -mt.amount; type = 'MM Purchase' as any; description = `Achat virtuel ${mt.provider}`; affectsCash=true; break;
                case 'virtual_return': amount = mt.amount; type = 'Retour Virtuel Caisse' as any; description = `Retour virtuel ${mt.provider}`; affectsCash=true; break;
                case 'transfer_to_pos': type='MM Transfer' as any; affectsCash = mt.affectsCash ?? false; amount = affectsCash ? mt.amount : 0; description = `Transfert vers PDV ${mt.phoneNumber}`; break;
                case 'transfer_from_pos': type='MM Transfer' as any; affectsCash = mt.affectsCash ?? false; amount = affectsCash ? -mt.amount : 0; description = `Transfert depuis PDV ${mt.phoneNumber}`; break;
                case 'collect_commission': amount = mt.commission; type = 'MM Commission' as any; description = `Collecte commission ${mt.provider}`; affectsCash=true; break;
                case 'adjustment': amount = 0; break; // Purely virtual
            }

            if(affectsCash){
              allDailyTransactions.push({ ...mt, amount, type, source: mt.provider, description, affectsCash });
            }
        });

    // Stock Movements
    stockMovements
      .forEach(sm => {
        allDailyTransactions.push({
          id: sm.id,
          date: sm.date,
          amount: sm.quantity, // Represent stock change as 'amount'
          description: `${sm.reason} (${sm.productName})`,
          type: 'Mouvement Stock',
          source: 'Inventaire',
          affectsCash: false,
        });
      });

    return allDailyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, airtimeTransactions, mobileMoneyTransactions, stockMovements]);


  const getDailyHistory = useCallback((date: Date): HistoryTransaction[] => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return getAllHistory().filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });

  }, [getAllHistory]);

  const sales = useMemo(() => transactions.filter(t => t.type === 'sale') as Sale[], [transactions]);
  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase') as Purchase[], [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense') as Expense[], [transactions]);
  const receipts = useMemo(() => transactions.filter(t => t.type === 'adjustment' && t.category === 'Encaissement' && t.amount > 0) as Transaction[], [transactions]);

  const value = useMemo(() => ({
    transactions,
    setTransactions,
    sales,
    purchases,
    expenses,
    receipts,
    invoices,
    setInvoices,
    cashClosings: sortedCashClosings,
    setCashClosings,
    expenseCategories,
    addSale,
    updateSale,
    returnSale,
    addBulkSales,
    addPurchase,
    updatePurchase,
    payPurchase,
    addExpense,
    updateExpense,
    addBulkExpenses,
    removeExpense, 
    addExpenseCategory,
    addAdjustment,
    addBulkAdjustments,
    addInvoice,
    getInvoice,
    removeInvoice,
    getAllTransactions,
    getDailyHistory,
    getAllHistory,
    addCashClosing,
    getLastClosingDate,
    clearWifiSales,
    clearCashTransactions,
    clearInvoices,
    clearCashClosings,
  }), [
      transactions, setTransactions, sales, purchases, expenses, receipts, invoices, setInvoices, sortedCashClosings, setCashClosings, 
      expenseCategories, addSale, updateSale, returnSale, addBulkSales, addPurchase, updatePurchase, payPurchase, addExpense, updateExpense, addBulkExpenses, removeExpense, 
      addExpenseCategory, addAdjustment, addBulkAdjustments, addInvoice, getInvoice, removeInvoice, getAllTransactions, getDailyHistory, getAllHistory,
      addCashClosing, getLastClosingDate, clearWifiSales, clearCashTransactions, clearInvoices, clearCashClosings,
      airtimeTransactions, mobileMoneyTransactions
    ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
