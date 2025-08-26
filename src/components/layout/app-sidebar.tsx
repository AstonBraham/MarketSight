
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
  Boxes,
  User,
  Shield,
  Smartphone,
  Send,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const allMenuItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { href: '/sales', label: 'Ventes', icon: ShoppingCart, roles: ['admin', 'user'] },
  { href: '/purchases', label: 'Achats', icon: Truck, roles: ['admin'] },
  { href: '/expenses', label: 'Dépenses', icon: Banknote, roles: ['admin'] },
  { href: '/inventory', label: 'Inventaire', icon: Boxes, roles: ['admin', 'user'] },
  { href: '/cash', label: 'Trésorerie', icon: Wallet, roles: ['admin'] },
  { href: '/airtime-moov', label: 'Airtime Moov', icon: Smartphone, roles: ['admin'] },
  { href: '/airtime-yas', label: 'Airtime Yas', icon: Smartphone, roles: ['admin'] },
  { href: '/mobile-money-flooz', label: 'Mobile Money Flooz', icon: Send, roles: ['admin'] },
  { href: '/mobile-money-mixx', label: 'Mobile Money Mixx', icon: Send, roles: ['admin'] },
  { href: '/reports', label: 'Rapports', icon: FileDown, roles: ['admin'] },
  { href: '/settings', label: 'Paramètres', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, setUser } = useUser();

  const menuItems = allMenuItems.filter(item => user && item.roles.includes(user.role));
  
  if (!user) return null;

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
             <Link href={href}>
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
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
               {user.role === 'admin' ? <Shield className="mr-2" /> : <User className="mr-2" />}
              <span className="truncate">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUser({id: '1', name: 'Admin User', role: 'admin'})}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Changer vers Admin</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUser({id: '2', name: 'Standard User', role: 'user'})}>
              <User className="mr-2 h-4 w-4" />
              <span>Changer vers Utilisateur</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
