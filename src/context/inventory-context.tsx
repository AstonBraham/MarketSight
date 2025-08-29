
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { InventoryItem } from '@/lib/types';
import { mockInventory as initialInventory } from '@/lib/mock-data';

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  addItems: (items: InventoryItem[]) => void;
  updateItem: (id: string, updatedFields: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  clearInventory: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

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
  }), [inventory, addItem, addItems, updateItem, removeItem, clearInventory]);

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
