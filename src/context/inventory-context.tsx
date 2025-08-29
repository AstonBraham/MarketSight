
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
  }), [inventory, setInventory, addItem, addItems, updateItem, removeItem, clearInventory, itemCategories, addCategory]);

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
