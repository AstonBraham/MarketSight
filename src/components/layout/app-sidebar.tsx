'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Banknote,
  FileDown,
  Settings,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/sales', label: 'Ventes', icon: ShoppingCart },
  { href: '/purchases', label: 'Achats', icon: Truck },
  { href: '/expenses', label: 'Dépenses', icon: Banknote },
  { href: '/reports', label: 'Rapports', icon: FileDown },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="font-headline text-xl font-semibold text-primary">
            MarketSight
          </h1>
          <div className="ml-auto">
             <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 px-4">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <Link href={href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === href}
                tooltip={{ children: label, side: 'right' }}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter className="p-4">
        <Button variant="outline">
          John Doe
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
