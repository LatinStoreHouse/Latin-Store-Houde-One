// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // Importamos nuestro nuevo componente agrupador
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Exportamos metadata para que Next.js la use. Esto solo funciona en Componentes de Servidor.
export const metadata: Metadata = {
  title: 'One By Latin',
  description: 'Gestión de Inventario y Clientes por Firebase Studio',
};

// Este es ahora un Componente de Servidor limpio. No usa hooks ni estado.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Usamos nuestro componente Providers para envolver las páginas */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}