
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem, Sale } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type PhysicalCountData = {
  identifier: string;
  realStock: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  addItems: (items: InventoryItem[]) => void;
  updateItem: (id: string, updatedFields: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  clearInventory: () => void;
  itemCategories: string[];
  addCategory: (category: string) => void;
  calculateAndSetReorderLevels: (sales: Sale[], bufferDays: number) => void;
  applyPhysicalCount: (countData: PhysicalCountData[]) => { updatedCount: number; notFoundCount: number };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);
  
  const itemCategories = useMemo(() => {
    const categories = inventory.map(item => item.category);
    return [...new Set(categories)].sort();
  }, [inventory]);

  const addCategory = useCallback((category: string) => {
    console.log(`Category "${category}" will be available for selection.`);
  }, []);

  const addItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  }, [setInventory]);
  
  const addItems = useCallback((items: InventoryItem[]) => {
    setInventory(prev => [...prev, ...items]);
  }, [setInventory])

  const updateItem = useCallback((id: string, updatedFields: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  }, [setInventory]);

  const removeItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, [setInventory]);

  const clearInventory = useCallback(() => {
    setInventory([]);
  }, [setInventory]);

  const calculateAndSetReorderLevels = useCallback((sales: Sale[], bufferDays: number) => {
    const salesByProduct: { [productName: string]: { totalQuantity: number, dates: Set<string> } } = {};

    sales.forEach(sale => {
      if (!salesByProduct[sale.product]) {
        salesByProduct[sale.product] = { totalQuantity: 0, dates: new Set() };
      }
      if (sale.quantity) {
        salesByProduct[sale.product].totalQuantity += sale.quantity;
        salesByProduct[sale.product].dates.add(new Date(sale.date).toDateString());
      }
    });

    const updatedInventory = inventory.map(item => {
      const productSales = salesByProduct[item.productName];
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
        updatedCount++;
        return { ...item, inStock: countItem.realStock };
      }
      return item;
    });

    notFoundCount = countData.length - updatedCount;

    setInventory(updatedInventory);

    return { updatedCount, notFoundCount };
  }, [inventory, setInventory]);

  const value = useMemo(() => ({
    inventory,
    setInventory,
    addItem,
    addItems,
    updateItem,
    removeItem,
    clearInventory,
    itemCategories,
    addCategory,
    calculateAndSetReorderLevels,
    applyPhysicalCount,
  }), [inventory, setInventory, addItem, addItems, updateItem, removeItem, clearInventory, itemCategories, addCategory, calculateAndSetReorderLevels, applyPhysicalCount]);

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
