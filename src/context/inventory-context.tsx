

'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem, Sale, StockMovement } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuditLog } from './audit-log-context';

type PhysicalCountData = {
  identifier: string;
  realStock: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  stockMovements: StockMovement[];
  setStockMovements: (movements: StockMovement[]) => void;
  addItem: (item: InventoryItem) => void;
  addItems: (items: InventoryItem[]) => void;
  updateItem: (id: string, updatedFields: Partial<InventoryItem>, reason?: string, relatedTransactionId?: string) => void;
  removeItem: (id: string) => void;
  clearInventory: () => void;
  itemCategories: string[];
  addCategory: (category: string) => void;
  calculateAndSetReorderLevels: (sales: Sale[], bufferDays: number) => void;
  applyPhysicalCount: (countData: PhysicalCountData[]) => { updatedCount: number; notFoundCount: number };
  getInventoryItem: (id: string) => InventoryItem | undefined;
  getInventoryMovements: (inventoryId: string) => StockMovement[];
  breakPack: (parentItemId: string, quantityToBreak: number) => { success: boolean; message: string };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);
  const [stockMovements, setStockMovements] = useLocalStorage<StockMovement[]>('stockMovements', []);
  const { logAction } = useAuditLog();
  
  const itemCategories = useMemo(() => {
    const categories = inventory.map(item => item.category);
    return [...new Set(categories)].sort();
  }, [inventory]);

  const addStockMovement = useCallback((movement: Omit<StockMovement, 'id' | 'date'>) => {
    setStockMovements(prev => [
      { ...movement, id: `SM-${Date.now()}`, date: new Date().toISOString() },
      ...prev
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setStockMovements]);

  const addCategory = useCallback((category: string) => {
    logAction('CREATE_CATEGORY', `Création d'une nouvelle catégorie d'article : ${category}.`);
    console.log(`Category "${category}" will be available for selection.`);
  }, [logAction]);

  const addItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
    const stock = item.inStock || 0;
    if (stock > 0) {
      addStockMovement({
        inventoryId: item.id,
        productName: item.productName,
        type: 'in',
        quantity: stock,
        reason: 'Stock initial',
        balanceBefore: 0,
        balanceAfter: stock,
      });
    }
    logAction('CREATE_ITEM', `Ajout de l'article "${item.productName}" avec un stock initial de ${stock}.`);
  }, [setInventory, addStockMovement, logAction]);
  
  const addItems = useCallback((items: InventoryItem[]) => {
    setInventory(prev => [...prev, ...items]);
    items.forEach(item => {
        const stock = item.inStock || 0;
        if (stock > 0) {
            addStockMovement({
                inventoryId: item.id,
                productName: item.productName,
                type: 'in',
                quantity: stock,
                reason: 'Importation initiale',
                balanceBefore: 0,
                balanceAfter: stock,
            });
        }
    });
    logAction('IMPORT_ITEMS', `Importation de ${items.length} articles.`);
  }, [setInventory, addStockMovement, logAction]);

  const updateItem = useCallback((id: string, updatedFields: Partial<InventoryItem>, reason: string = 'Ajustement manuel', relatedTransactionId?: string) => {
    const itemToUpdate = inventory.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    const oldStock = itemToUpdate.inStock;
    const newStock = updatedFields.inStock;

    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    logAction('UPDATE_ITEM', `Modification de l'article "${itemToUpdate.productName}" (ID: ${id}).`);
    
    if (newStock !== undefined && newStock !== oldStock) {
        addStockMovement({
            inventoryId: id,
            productName: updatedFields.productName || itemToUpdate.productName,
            type: 'adjustment',
            quantity: newStock - oldStock,
            reason: reason,
            balanceBefore: oldStock,
            balanceAfter: newStock,
            relatedTransactionId,
        });
    }
  }, [inventory, setInventory, addStockMovement, logAction]);

  const removeItem = useCallback((id: string) => {
    const itemToRemove = inventory.find(item => item.id === id);
    if(itemToRemove) {
      logAction('DELETE_ITEM', `Suppression de l'article "${itemToRemove.productName}" (ID: ${id}).`);
    }
    setInventory(prev => prev.filter(item => item.id !== id));
    setStockMovements(prev => prev.filter(m => m.inventoryId !== id));
  }, [inventory, setInventory, setStockMovements, logAction]);

  const clearInventory = useCallback(() => {
    logAction('CLEAR_INVENTORY', 'Suppression de tout l\'inventaire.');
    setInventory([]);
    setStockMovements([]);
  }, [setInventory, setStockMovements, logAction]);

  const calculateAndSetReorderLevels = useCallback((sales: Sale[], bufferDays: number) => {
    const salesByProduct: { [inventoryId: string]: { totalQuantity: number, dates: Set<string> } } = {};

    sales.forEach(sale => {
      if (sale.inventoryId) {
        if (!salesByProduct[sale.inventoryId]) {
            salesByProduct[sale.inventoryId] = { totalQuantity: 0, dates: new Set() };
        }
        if (sale.quantity) {
            salesByProduct[sale.inventoryId].totalQuantity += sale.quantity;
            salesByProduct[sale.inventoryId].dates.add(new Date(sale.date).toDateString());
        }
      }
    });

    const updatedInventory = inventory.map(item => {
      const productSales = salesByProduct[item.id];
      if (productSales) {
        const numberOfDaysWithSales = productSales.dates.size;
        const averageDailySales = numberOfDaysWithSales > 0 ? productSales.totalQuantity / numberOfDaysWithSales : 0;
        const reorderLevel = Math.ceil(averageDailySales * bufferDays);
        return { ...item, reorderLevel: reorderLevel > 0 ? reorderLevel : 1 };
      }
      return item; // Keep original reorder level if no sales history
    });
    logAction('CALCULATE_REORDER_LEVELS', `Calcul des niveaux de réapprovisionnement pour ${updatedInventory.length} articles.`);
    setInventory(updatedInventory);
  }, [inventory, setInventory, logAction]);
  
  const applyPhysicalCount = useCallback((countData: PhysicalCountData[]) => {
    let updatedCount = 0;
    let notFoundCount = 0;
    
    const updatedInventory = inventory.map(item => {
      const countItem = countData.find(c => c.identifier === item.sku || c.identifier === item.reference);
      if (countItem) {
        const oldStock = item.inStock;
        const newStock = countItem.realStock;
        if (oldStock !== newStock) {
            addStockMovement({
                inventoryId: item.id,
                productName: item.productName,
                type: 'adjustment',
                quantity: newStock - oldStock,
                reason: 'Comptage Physique',
                balanceBefore: oldStock,
                balanceAfter: newStock
            });
            updatedCount++;
            return { ...item, inStock: newStock };
        }
      }
      return item;
    });

    notFoundCount = countData.length - updatedCount;
    setInventory(updatedInventory);
    logAction('PHYSICAL_COUNT', `Application d'un comptage physique. ${updatedCount} articles mis à jour, ${notFoundCount} non trouvés.`);
    return { updatedCount, notFoundCount };
  }, [inventory, setInventory, addStockMovement, logAction]);
  
  const getInventoryItem = useCallback((id: string) => {
    return inventory.find(item => item.id === id);
  }, [inventory]);

  const getInventoryMovements = useCallback((inventoryId: string) => {
    return stockMovements
        .filter(m => m.inventoryId === inventoryId)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stockMovements]);

   const breakPack = useCallback((parentItemId: string, quantityToBreak: number): { success: boolean; message: string } => {
    setInventory(prevInventory => {
        const parentItem = prevInventory.find(i => i.id === parentItemId);
        if (!parentItem) {
            throw new Error("Article parent non trouvé.");
        }

        const childItem = prevInventory.find(i => i.parentItemId === parentItemId);
        if (!childItem) {
            throw new Error("Article unitaire correspondant non trouvé.");
        }

        if (!childItem.unitsPerParent || childItem.unitsPerParent <= 0) {
            throw new Error("Le nombre d'unités par parent n'est pas défini ou invalide pour l'article unitaire.");
        }

        if (parentItem.inStock < quantityToBreak) {
            throw new Error(`Stock insuffisant pour ${parentItem.productName}. En stock: ${parentItem.inStock}, requis: ${quantityToBreak}.`);
        }

        const unitsToAdd = quantityToBreak * childItem.unitsPerParent;
        const valueOfBrokenPacks = quantityToBreak * (parentItem.costPrice || 0);

        const newParentStock = parentItem.inStock - quantityToBreak;
        const newChildStock = childItem.inStock + unitsToAdd;

        const oldChildStockValue = childItem.inStock * (childItem.costPrice || 0);
        const newChildCump = (oldChildStockValue + valueOfBrokenPacks) / newChildStock;
        
        const updatedInventory = prevInventory.map(item => {
            if (item.id === parentItem.id) {
                return { ...item, inStock: newParentStock };
            }
            if (item.id === childItem.id) {
                return { ...item, inStock: newChildStock, costPrice: newChildCump };
            }
            return item;
        });

        // Add stock movements after calculating the new state
        addStockMovement({
            inventoryId: parentItem.id,
            productName: parentItem.productName,
            type: 'out',
            quantity: -quantityToBreak,
            reason: `Casse de ${quantityToBreak} pack(s) pour ${childItem.productName}`,
            balanceBefore: parentItem.inStock,
            balanceAfter: newParentStock,
        });

        addStockMovement({
            inventoryId: childItem.id,
            productName: childItem.productName,
            type: 'in',
            quantity: unitsToAdd,
            reason: `Casse de ${parentItem.productName}`,
            balanceBefore: childItem.inStock,
            balanceAfter: newChildStock,
        });
        
        logAction('BREAK_PACK', `Casse de ${quantityToBreak} pack(s) de "${parentItem.productName}". CUMP unitaire mis à jour.`);

        return updatedInventory;
    });

    return { success: true, message: "Le pack a été cassé avec succès et le CUMP mis à jour." };

  }, [setInventory, addStockMovement, logAction]);

  const value = useMemo(() => ({
    inventory,
    setInventory,
    stockMovements,
    setStockMovements,
    addItem,
    addItems,
    updateItem,
    removeItem,
    clearInventory,
    itemCategories,
    addCategory,
    calculateAndSetReorderLevels,
    applyPhysicalCount,
    getInventoryItem,
    getInventoryMovements,
    breakPack,
  }), [inventory, setInventory, stockMovements, setStockMovements, addItem, addItems, updateItem, removeItem, clearInventory, itemCategories, addCategory, calculateAndSetReorderLevels, applyPhysicalCount, getInventoryItem, getInventoryMovements, breakPack]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within a InventoryProvider');
  }
  return context;
}
