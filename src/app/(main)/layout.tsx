
'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayoutContent } from '@/components/main-layout';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
      <SidebarProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </SidebarProvider>
  );
}

