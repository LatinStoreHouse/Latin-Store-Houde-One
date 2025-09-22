'use client'; // ¡Directiva clave! Marca todo en este archivo como componente de cliente.

import React, { useState, useRef, useMemo, useContext, useEffect, createContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Importa todos los componentes UI y hooks que ya tenías
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { BotMessageSquare, FileText, LayoutDashboard, Users, Warehouse, UserCog, LogOut, Truck, Calculator, ChevronDown, Tags, ShieldCheck, CheckSquare, Container, BookUser, BadgeCheck, Edit, Save, Camera, Receipt, Store, Megaphone, ArrowUp, ArrowDown, ShoppingBag, Lightbulb, Handshake, Bell, X, Palette, Wrench, Settings, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Role, roles, User } from '@/lib/roles'; // Asegúrate que esta ruta es correcta
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext, InventoryProvider } from '@/context/inventory-context'; // Importamos el provider que faltaba
import { RoleSwitcher } from '@/components/role-switcher';
import { initialProductPrices } from '@/lib/prices';
import { initialPendingDispatches } from '@/app/(main)/validation/page';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/page-loader';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Label } from '@/components/ui/label';

// --- DEFINICIÓN DEL CONTEXTO DE USUARIO ---
// Todo esto se queda en el archivo de cliente.
const UserContext = createContext<{
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// --- COMPONENTES INTERNOS DE UI (MOVIMOS TODO AQUÍ) ---
// Todos los componentes que usan hooks (usePathname, useState, etc.) deben estar aquí.

// Aquí copiamos todos tus componentes: navItems, Logo, NavMenu, LayoutContent, etc.
// No los pego todos aquí para no hacer la respuesta extremadamente larga, pero
// simplemente MUEVE TODO el resto del código de tu antiguo layout.tsx aquí,
// desde `export const navItems = [...]` hasta el final de `LayoutContent`.

// ... (Pega aquí `navItems`, `getIconForSubItem`, `Logo`, `NavMenu` y `LayoutContent` tal como estaban) ...
// Por ejemplo:
const NavMenu = () => { /* ... tu código de NavMenu ... */ };
const LayoutContent = ({ children }: { children: React.ReactNode }) => { /* ... tu código de LayoutContent ... */ };


// --- EL NUEVO COMPONENTE PRINCIPAL DE CLIENTE ---
// Este componente gestionará el estado y los providers.
export function ClientLayout({ children }: { children: React.ReactNode }) {
  // El estado del usuario ahora vive aquí, en el nivel más alto del lado del cliente.
  const [currentUser, setCurrentUser] = useState<User>({
    // Estado inicial de ejemplo. Deberías cargar el usuario real aquí.
    id: '1',
    name: 'Cargando...',
    email: 'user@example.com',
    avatar: '',
    roles: ['Asesor de Ventas'], // Rol por defecto mientras carga
    phone: '',
    jobTitle: 'Usuario',
    individualPermissions: [],
  });

  // Creamos el valor para el contexto que se pasará a los componentes hijos.
  const userContextValue = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);

  // Aquí es donde cargamos los datos del usuario real, por ejemplo, desde Firebase.
  useEffect(() => {
    // Lógica para autenticar y establecer el usuario.
    // Por ahora, simulamos una carga con un usuario de ejemplo.
    const mockUser: User = {
      id: 'USR-001',
      name: 'Wilder Parra',
      email: 'wilder@example.com',
      avatar: 'https://github.com/shadcn.png',
      roles: ['Administrador', 'Asesor de Ventas'],
      phone: '300-123-4567',
      jobTitle: 'Gerente General',
      individualPermissions: ['designs:view'],
    };
    setCurrentUser(mockUser);
  }, []);

  return (
    <UserContext.Provider value={userContextValue}>
      <InventoryProvider> {/* Tu app usa este contexto, así que lo proveemos aquí */}
        <SidebarProvider>
          {/* LayoutContent es el componente que contiene toda tu UI (Sidebar, Header, etc.) */}
          <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
      </InventoryProvider>
    </UserContext.Provider>
  );
}