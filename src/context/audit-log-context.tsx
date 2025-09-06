
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { AuditLogEntry, User } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type LogAction = (action: string, details: string) => void;

interface AuditLogContextType {
  logs: AuditLogEntry[];
  logAction: LogAction;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useLocalStorage<AuditLogEntry[]>('auditLogs', []);
  
  // This is a simplified user for logging. In a real app, you'd get this from a proper auth context.
  const currentUser: User = { id: '1', name: 'Admin User', role: 'admin' };

  const logAction = useCallback((action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      date: new Date().toISOString(),
      user: currentUser.name,
      action,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  }, [setLogs, currentUser.name]);

  const value = useMemo(() => ({
    logs,
    logAction,
  }), [logs, logAction]);

  return (
    <AuditLogContext.Provider value={value}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}
