'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  BotMessageSquare,
  FileText,
  LayoutDashboard,
  Users,
  Warehouse,
  UserCog,
  LogOut,
  Truck,
  Calculator,
  ChevronDown,
  Tags,
  ShieldCheck,
  CheckSquare,
  Container,
  BookUser
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Role, roles } from '@/lib/roles';

const currentUserRole: Role = 'Administrador';

const navItems = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  {
    label: 'Inventario',
    icon: Warehouse,
    subItems: [
      { href: '/inventory', label: 'Stock Actual', permission: 'inventory:view' },
      { href: '/transit', label: 'Contenedores en Tránsito', permission: 'inventory:transit' },
      { href: '/reservations', label: 'Reservas', permission: 'reservations:view' },
    ],
  },
  { href: '/orders', label: 'Despachos y Facturación', icon: Truck, permission: 'orders:view' },
  { href: '/validation', label: 'Validación', icon: CheckSquare, permission: 'validation:view' },
  { href: '/customers', label: 'Clientes', icon: Users, permission: 'customers:view' },
  {
    label: 'Calculadoras',
    icon: Calculator,
    permission: 'calculators:use',
    subItems: [
      { href: '/stoneflex-clay-calculator', label: 'Stoneflex' },
      { href: '/starwood-calculator', label: 'Starwood' },
    ],
  },
  { href: '/pricing', label: 'Precios', icon: Tags, permission: 'pricing:view' },
  { href: '/users', label: 'Usuarios', icon: UserCog, permission: 'users:manage' },
  { href: '/roles', label: 'Roles y Permisos', icon: ShieldCheck, permission: 'roles:manage' },
  { href: '/reports', label: 'Reportes', icon: FileText, permission: 'reports:view' },
  { href: '/advisor', label: 'Asesor IA', icon: BotMessageSquare, permission: 'advisor:use' },
];

const getIconForSubItem = (label: string) => {
    switch (label) {
        case 'Stock Actual': return Warehouse;
        case 'Contenedores en Tránsito': return Container;
        case 'Reservas': return BookUser;
        default: return Warehouse;
    }
}

const Logo = () => (
  <div className="relative h-10 w-32">
    <Image src="/logo.png" alt="Latin Store House Logo" fill style={{ objectFit: 'contain' }} />
  </div>
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];

  const hasPermission = (item: any) => {
    if (!item.permission) return true; // Items without a specific permission are public
    return userPermissions.includes(item.permission);
  };
  
  const getVisibleNavItems = () => {
    return navItems.filter(item => {
        if (item.subItems) {
            return item.subItems.some(subItem => hasPermission(subItem));
        }
        return hasPermission(item);
    });
  }

  const visibleNavItems = getVisibleNavItems();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-lg">
              <Logo />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Latin Store House</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNavItems.map((item) =>
              item.subItems ? (
                <SidebarGroup key={item.label} className="p-0">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.filter(hasPermission).map((subItem) => {
                           const SubIcon = getIconForSubItem(subItem.label);
                           return (
                            <SidebarMenuSubItem key={subItem.href}>
                               <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                 <Link href={subItem.href}>
                                    <SubIcon />
                                    <span className="truncate">{subItem.label}</span>
                                 </Link>
                               </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                           )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarGroup>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href!}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="profile picture" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Usuario Admin</span>
              <span className="text-xs text-muted-foreground">admin@latinhouse.com</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold md:text-xl">
            {navItems.flatMap(item => item.subItems || item).find((navItem) => navItem.href === pathname)?.label || 'Tablero'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
