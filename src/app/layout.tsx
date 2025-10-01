

'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { InventoryProvider } from '@/context/inventory-context';
import { UserContext } from '@/context/user-context';
import React, { useState } from 'react';
import { User, Role } from '@/lib/roles';

const inter = Inter({ subsets: ['latin'] });

// CENTRALIZED USER DEFINITION FOR ROLE SIMULATION
const initialUser: User = {
  id: '1',
  name: 'Admin Latin',
  email: 'admin@latinhouse.com',
  phone: '+573101234567',
  jobTitle: 'Gerente General',
  roles: ['Administrador'], 
  avatar: 'https://placehold.co/40x40.png',
  active: true,
  individualPermissions: [],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUser, setCurrentUser] = useState(initialUser);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
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
        </UserContext.Provider>
      </body>
    </html>
  );
}
