// src/app/providers.tsx

'use client'; // Aquí es donde empieza la lógica de cliente

import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/context/UserProvider';
import { InventoryProvider } from '@/context/inventory-context';
import { Toaster } from '@/components/ui/toaster';

// Este componente agrupa a todos tus providers de contexto
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <InventoryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </InventoryProvider>
    </UserProvider>
  );
}