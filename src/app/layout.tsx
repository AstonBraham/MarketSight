import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarInset } from '@/components/ui/sidebar';
import { UserProvider } from '@/context/user-context';
import { InventoryProvider } from '@/context/inventory-context';
import { TransactionProvider } from '@/context/transaction-context';
import { AirtimeProvider } from '@/context/airtime-context';
import { MobileMoneyProvider } from '@/context/mobile-money-context';

export const metadata: Metadata = {
  title: 'JokerMarket',
  description: 'Application web de gestion de supermarché',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <UserProvider>
          <TransactionProvider>
            <InventoryProvider>
              <AirtimeProvider>
                <MobileMoneyProvider>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      {children}
                      <Toaster />
                    </SidebarInset>
                  </SidebarProvider>
                </MobileMoneyProvider>
              </AirtimeProvider>
            </InventoryProvider>
          </TransactionProvider>
        </UserProvider>
      </body>
    </html>
  );
}
