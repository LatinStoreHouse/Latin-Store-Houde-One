'use client';
import React from 'react';
import Link from 'next/link';
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
} from '@/components/ui/sidebar';
import {
  BotMessageSquare,
  FileText,
  LayoutDashboard,
  Users,
  Warehouse,
  Package,
  UserCog,
  Truck,
  Settings,
  LogOut,
  PackageSearch,
  ClipboardCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventario', icon: Warehouse },
  { href: '/orders', label: 'Pedidos y Validación', icon: ClipboardCheck },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/users', label: 'Usuarios', icon: UserCog },
  { href: '/reports', label: 'Reportes', icon: FileText },
  { href: '/advisor', label: 'Asesor IA', icon: BotMessageSquare },
];

const Logo = () => (
<svg width="140" height="40" viewBox="0 0 250 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-primary">
<text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="white">
LATIN
<tspan dy="-5" fontSize="20">
<svg x="88" y="5" width="20" height="20" viewBox="0 0 24 24">
<path fill="white" d="M12,17.27L18.18,21L17,14.64L22,9.73L15.45,8.5L12,2.5L8.55,8.5L2,9.73L7,14.64L5.82,21L12,17.27Z"/>
</svg>
</tspan>
</text>
<text x="10" y="70" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="white">STORE</text>
<text x="10" y="100" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="white">HOUSE</text>
</svg>
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <Logo />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Latin Store House</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
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
            {navItems.find((item) => item.href === pathname)?.label || 'Tablero'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
