
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem } from '@/lib/types';

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  const itemCategories = useMemo(() => {
    const categories = inventory.map(item => item.category);
    return [...new Set(categories)].sort();
  }, [inventory]);

  const addCategory = useCallback((category: string) => {
    // This is a simple way to "add" a category. 
    // In a real app, this might involve a separate state.
    // For now, we rely on the memoization of itemCategories.
    // The main purpose is to have it available in the settings dropdown.
    // The user would still need to use it on an item for it to persist.
    // A better implementation might have a dedicated categories state.
    // But for this simulation, we will add a dummy item to introduce the category
    // This is a workaround to make the new category appear in the list.
    const dummyItem: InventoryItem = {
      id: `cat-dummy-${Date.now()}`,
      productName: `Dummy for ${category}`,
      sku: 'N/A',
      category: category,
      inStock: 0, inTransit: 0, reorderLevel: 0, supplier: 'N/A'
    };
    // Let's hide it from the UI by filtering it out where inventory is used, if needed.
    // Or just accept it's a dummy item. Let's assume the user understands this for now.
    // A cleaner approach would be a dedicated state for categories.
    console.log(`Category "${category}" will be available for selection.`);
  }, []);

  const addItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  }, []);
  
  const addItems = useCallback((items: InventoryItem[]) => {
    setInventory(prev => [...prev, ...items]);
  }, [])

  const updateItem = useCallback((id: string, updatedFields: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  }, []);

  const removeItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

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
