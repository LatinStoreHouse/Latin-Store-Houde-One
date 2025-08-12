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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/orders', label: 'Orders & Validation', icon: ClipboardCheck },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/users', label: 'Users', icon: UserCog },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/advisor', label: 'AI Advisor', icon: BotMessageSquare },
];

const Logo = () => (
  <svg
    width="140"
    height="40"
    viewBox="0 0 160 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-sidebar-primary"
  >
    <path
      d="M10.1992 0.5H2.23922V39.5H10.1992V24.38H20.6792V39.5H28.6392V0.5H20.6792V16.66H10.1992V0.5Z"
      fill="currentColor"
    />
    <path
      d="M37.9439 0.5V39.5H58.1439C64.6239 39.5 68.4639 36.5 68.4639 30.9C68.4639 26.5 66.2239 24.3 62.5839 23.34L69.7039 0.5H60.5839L54.1039 20.22H45.9039V0.5H37.9439ZM57.1839 24.54C60.3039 24.54 61.2639 26.46 61.2639 29.82C61.2639 33.34 59.9039 34.9 56.7039 34.9H45.9039V24.54H57.1839Z"
      fill="currentColor"
    />
    <path
      d="M77.1295 0.5V39.5H85.0495V0.5H77.1295Z"
      fill="currentColor"
    />
    <path
      d="M93.3156 0.5V39.5H101.236V23.7L110.116 39.5H119.876L109.876 22.14L120.276 0.5H110.516L101.236 18.14V0.5H93.3156Z"
      fill="currentColor"
    />
    <path
      d="M129.865 10.38L126.105 0.5H118.145L129.505 28.5L124.945 39.5H132.905L146.745 0.5H138.785L134.305 10.38H129.865Z"
      fill="currentColor"
    />
    <path
      d="M97.0514 10.28L94.5114 4.51999C94.1314 3.59999 93.1914 2.11999 91.5914 2.11999C89.9914 2.11999 89.0314 3.59999 88.6714 4.51999L86.1314 10.28H97.0514Z"
      fill="#D43E2A"
    />
  </svg>
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-primary-foreground">
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
              <span className="text-sm font-semibold">Admin User</span>
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
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
