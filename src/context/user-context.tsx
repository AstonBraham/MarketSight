
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  user: User | null;
  login: (password: string) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILES = {
    '0000': { id: '2', name: 'Utilisateur Standard', role: 'user' },
    'madmin': { id: '1', name: 'Administrateur', role: 'admin' },
} as const;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((password: string): boolean => {
    const profile = USER_PROFILES[password as keyof typeof USER_PROFILES];
    if (profile) {
        setUser(profile);
        return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
