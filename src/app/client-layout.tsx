'use client';

import { useUser } from '@/context/user-context';
import { useEffect, useState } from 'react';
import LoginPage from './login/page';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
