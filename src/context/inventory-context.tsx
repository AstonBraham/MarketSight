'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
import { mockInventory as initialInventory } from '@/lib/mock-data';

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  addItems: (items: InventoryItem[]) => void;
  updateItem: (id: string, updatedItem: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  clearInventory: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const addItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };
  
  const addItems = (items: InventoryItem[]) => {
    setInventory(prev => [...prev, ...items]);
  }

  const updateItem = (id: string, updatedItem: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const removeItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const clearInventory = () => {
    setInventory([]);
  };

  const value = useMemo(() => ({
    inventory,
    setInventory,
    addItem,
    addItems,
    updateItem,
    removeItem,
    clearInventory,
  }), [inventory]);

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
