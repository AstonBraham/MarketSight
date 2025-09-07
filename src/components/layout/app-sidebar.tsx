
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
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
  Receipt,
  Landmark,
  Wifi,
  Archive,
  History,
  LineChart,
  BarChart2,
  ListChecks,
  Download,
  ClipboardList,
  LifeBuoy
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
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const allMenuItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { href: '/client-analysis', label: 'Analyse Clients', icon: LineChart, roles: ['admin'] },
  { href: '/sales-analysis', label: 'Analyse des Ventes', icon: BarChart2, roles: ['admin', 'user'] },
  { href: '/invoices', label: 'Vente & Facturation', icon: Receipt, roles: ['admin', 'user'] },
  { href: '/wifi', label: 'Vente Wifi', icon: Wifi, roles: ['admin', 'user'] },
  { href: '/expenses', label: 'Dépenses', icon: Banknote, roles: ['admin', 'user'] },
  { href: '/inventory', label: 'Inventaire', icon: Boxes, roles: ['admin', 'user'] }, // User can see, but actions are restricted inside
  { 
    label: 'Trésorerie', icon: Wallet, roles: ['admin'], subItems: [
      { href: '/cash', label: 'Mouvements de caisse' },
      { href: '/receipts', label: 'Encaissements' },
      { href: '/cash-closing', label: 'Arrêtés de caisse' },
    ]
  },
  { href: '/airtime-moov', label: 'Airtime Moov', icon: Smartphone, roles: ['admin', 'user'] },
  { href: '/airtime-yas', label: 'Airtime Yas', icon: Smartphone, roles: ['admin', 'user'] },
  { href: '/mobile-money-flooz', label: 'Mobile Money Flooz', icon: Send, roles: ['admin', 'user'] },
  { href: '/mobile-money-mixx', label: 'Mobile Money Mixx', icon: Send, roles: ['admin', 'user'] },
  { href: '/mobile-money-coris', label: 'Mobile Money Coris', icon: Send, roles: ['admin', 'user'] },
  { href: '/history', label: 'Historique du jour', icon: History, roles: ['admin', 'user'] },
  { href: '/transactions-audit', label: 'Audit Transactions', icon: ListChecks, roles: ['admin'] },
  { href: '/audit-log', label: "Journal d'Audit", icon: ClipboardList, roles: ['admin'] },
  { href: '/reports', label: 'Rapports', icon: FileDown, roles: ['admin', 'user'] },
  { href: '/settings', label: 'Paramètres', icon: Settings, roles: ['admin'] },
  { href: '/help', label: 'Aide / Manuel', icon: LifeBuoy, roles: ['admin', 'user'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null;

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
            JokerMarket
          </h1>
          <div className="ml-auto">
             <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 px-4">
        {menuItems.map((item, index) => (
          item.subItems ? (
             <Collapsible key={item.label} className="w-full">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton>
                      <item.icon />
                      <span>{item.label}</span>
                   </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems.map(subItem => (
                     <SidebarMenuSubItem key={subItem.href}>
                      <Link href={subItem.href} passHref>
                         <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                           <a>{subItem.label}</a>
                        </SidebarMenuSubButton>
                      </Link>
                     </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href!}>
                  <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
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
