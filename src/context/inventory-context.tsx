

'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem, Sale, StockMovement } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);
  const [stockMovements, setStockMovements] = useLocalStorage<StockMovement[]>('stockMovements', []);
  
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
    console.log(`Category "${category}" will be available for selection.`);
  }, []);

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
  }, [setInventory, addStockMovement]);
  
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
  }, [setInventory, addStockMovement]);

  const updateItem = useCallback((id: string, updatedFields: Partial<InventoryItem>, reason: string = 'Ajustement manuel', relatedTransactionId?: string) => {
    const itemToUpdate = inventory.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    const oldStock = itemToUpdate.inStock;
    const newStock = updatedFields.inStock;

    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    
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
  }, [inventory, setInventory, addStockMovement]);

  const removeItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    setStockMovements(prev => prev.filter(m => m.inventoryId !== id));
  }, [setInventory, setStockMovements]);

  const clearInventory = useCallback(() => {
    setInventory([]);
    setStockMovements([]);
  }, [setInventory, setStockMovements]);

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

    setInventory(updatedInventory);
  }, [inventory, setInventory]);
  
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
    return { updatedCount, notFoundCount };
  }, [inventory, setInventory, addStockMovement]);
  
  const getInventoryItem = useCallback((id: string) => {
    return inventory.find(item => item.id === id);
  }, [inventory]);

  const getInventoryMovements = useCallback((inventoryId: string) => {
    return stockMovements
        .filter(m => m.inventoryId === inventoryId)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stockMovements]);

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
  }), [inventory, setInventory, stockMovements, setStockMovements, addItem, addItems, updateItem, removeItem, clearInventory, itemCategories, addCategory, calculateAndSetReorderLevels, applyPhysicalCount, getInventoryItem, getInventoryMovements]);

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
