
'use client';
import React, { useState, useRef, useMemo, useContext, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
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
    BookUser,
    BadgeCheck,
    Edit,
    Save,
    Camera,
    Receipt,
    Store,
    Megaphone,
    ArrowUp,
    ArrowDown,
    ShoppingBag,
    Lightbulb
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Role, roles, User } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { InventoryProvider, InventoryContext } from '@/context/inventory-context';
import { RoleSwitcher } from '@/components/role-switcher';
import { initialProductPrices } from '@/lib/prices';
import { initialPendingDispatches } from '@/app/(main)/validation/page';


// CENTRALIZED USER DEFINITION FOR ROLE SIMULATION
const initialUser: User = {
  id: '1',
  name: 'Admin Latin',
  email: 'admin@latinhouse.com',
  roles: ['Administrador'], 
  avatar: 'https://placehold.co/40x40.png',
  active: true,
};


export const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  {
    label: 'Inventario',
    icon: Warehouse,
    subItems: [
      { href: '/reservations', label: 'Reservas', permission: 'reservations:view' },
      { href: '/transit', label: 'Contenedores', permission: 'inventory:transit' },
      { href: '/inventory', label: 'Inventario', permission: 'inventory:view' },
      { href: '/orders', label: 'Despachos', permission: 'orders:view' },
    ],
  },
  { href: '/validation', label: 'Validación', icon: CheckSquare, permission: 'validation:view' },
  { href: '/customers', label: 'Clientes', icon: Users, permission: 'customers:view' },
  {
    label: 'Calculadoras',
    icon: Calculator,
    permission: 'calculators:use',
    subItems: [
      { href: '/stoneflex-clay-calculator', label: 'StoneFlex' },
      { href: '/starwood-calculator', label: 'Starwood' },
      { href: '/invoices', label: 'Historial de Cotizaciones', permission: 'invoices:view' },
    ],
  },
   {
    label: 'Compras',
    icon: ShoppingBag,
    subItems: [
      { href: '/purchasing/suggestions', label: 'Sugerencias de Compra', permission: 'purchasing:suggestions:view' },
    ],
  },
  { href: '/pricing', label: 'Precios', icon: Tags, permission: 'pricing:view' },
  { href: '/marketing/campaigns', label: 'Marketing', icon: Megaphone, permission: 'marketing:view' },
  { href: '/users', label: 'Usuarios', icon: UserCog, permission: 'users:manage' },
  { href: '/roles', label: 'Roles y Permisos', icon: ShieldCheck, permission: 'roles:manage' },
  { href: '/reports', label: 'Reportes', icon: FileText, permission: 'reports:view' },
  { href: '/advisor', label: 'Asesor IA', icon: BotMessageSquare, permission: 'advisor:use' },
];

const getIconForSubItem = (label: string) => {
    switch (label) {
        case 'Inventario': return Warehouse;
        case 'Contenedores': return Container;
        case 'Reservas': return BookUser;
        case 'Despachos': return Truck;
        case 'Historial de Cotizaciones': return Receipt;
        case 'Sugerencias de Compra': return Lightbulb;
        case 'Stoneflex': return Store;
        case 'Starwood': return Store;
        default: return Warehouse;
    }
}

const Logo = () => (
    <div className="relative h-24 w-full">
        <Image 
            src="https://www.latinstorehouse.com/wp-content/uploads/2025/08/Logo-Latin-Store-House-blanco.webp"
            alt="Latin Store House Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
        />
    </div>
);

// We need a context to pass the currentUser and its setter around.
export const UserContext = React.createContext<{
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

export function useUser() {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

const NavMenu = () => {
    const pathname = usePathname();
    const { currentUser } = useUser();
    const inventoryContext = useContext(InventoryContext);
    const { setOpenMobile } = useSidebar();

    const userPermissions = useMemo(() => {
        const permissions = new Set<string>();
        currentUser.roles.forEach(userRole => {
            const roleConfig = roles.find(r => r.name === userRole);
            if (roleConfig) {
                roleConfig.permissions.forEach(p => permissions.add(p));
            }
        });
        return Array.from(permissions);
    }, [currentUser.roles]);

    const pendingValidations = useMemo(() => {
        if (!inventoryContext) return 0;
        const pendingReservations = inventoryContext.reservations.filter(r => r.status === 'En espera de validación').length;
        const pendingDispatches = initialPendingDispatches.length;
        return pendingReservations + pendingDispatches;
    }, [inventoryContext]);

    const pendingPrices = useMemo(() => {
        if (!inventoryContext) return 0;
        const allProducts = Object.values(inventoryContext.inventoryData).flatMap(brand =>
            Object.values(brand).flatMap(line => Object.keys(line))
        );
        return allProducts.filter(productName => !(productName in initialProductPrices) || initialProductPrices[productName as keyof typeof initialProductPrices] === 0).length;
    }, [inventoryContext?.inventoryData]);

    const pendingReservationAlerts = useMemo(() => {
        if (!inventoryContext) return 0;

        const isAdmin = currentUser.roles.includes('Administrador');
        const isAdvisor = currentUser.roles.includes('Asesor de Ventas');

        if (!isAdmin && !isAdvisor) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return inventoryContext.reservations.filter(r => {
            if (r.status !== 'Validada' || !r.expirationDate) {
                return false;
            }

            if (isAdvisor && !isAdmin && r.advisor !== currentUser.name) {
                return false;
            }

            const expiration = new Date(r.expirationDate);
            expiration.setHours(0,0,0,0);

            return expiration <= tomorrow;
        }).length;
    }, [inventoryContext, currentUser]);

    const hasLateContainersAlert = useMemo(() => {
        if (!inventoryContext?.containers) return false;

        const canSeeAlert = currentUser.roles.includes('Logística') || currentUser.roles.includes('Contador') || currentUser.roles.includes('Administrador');
        if (!canSeeAlert) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inventoryContext.containers.some(c => {
            const etaDate = new Date(c.eta);
            return etaDate < today && c.status !== 'Ya llego';
        });
    }, [inventoryContext?.containers, currentUser.roles]);

    const hasPurchaseSuggestions = useMemo(() => {
        if (!inventoryContext?.systemSuggestions) return false;
        const canSeeSuggestions = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Tráfico');
        if (!canSeeSuggestions) return false;

        // Show notification if there are more suggestions than the last time the user saw them.
        return inventoryContext.systemSuggestions.length > inventoryContext.seenSuggestionsCount;
    }, [inventoryContext?.systemSuggestions, inventoryContext?.seenSuggestionsCount, currentUser.roles]);

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
    const canEditPrices = hasPermission({ permission: 'pricing:edit' });
    const canViewReservationsAlert = hasPermission({ permission: 'reservations:view' });

    return (
        <SidebarMenu className="px-2">
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
                                                    <Link href={subItem.href} onClick={() => setOpenMobile(false)}>
                                                        <SubIcon />
                                                        <span className="truncate">{subItem.label}</span>
                                                        {subItem.href === '/reservations' && pendingReservationAlerts > 0 && canViewReservationsAlert && <div className="h-2 w-2 rounded-full bg-white ml-auto" />}
                                                        {subItem.href === '/transit' && hasLateContainersAlert && <div className="h-2 w-2 rounded-full bg-white ml-auto" />}
                                                        {subItem.href === '/purchasing/suggestions' && hasPurchaseSuggestions && <div className="h-2 w-2 rounded-full bg-white ml-auto" />}
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
                            <Link href={item.href!} onClick={() => setOpenMobile(false)} className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <item.icon />
                                    <span>{item.label}</span>
                                </div>
                                {item.href === '/validation' && pendingValidations > 0 && <div className="h-2 w-2 rounded-full bg-white" />}
                                {item.href === '/pricing' && pendingPrices > 0 && canEditPrices && <div className="h-2 w-2 rounded-full bg-white" />}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            )}
        </SidebarMenu>
    );
};


const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();
  const { setOpenMobile } = useSidebar();
  const inventoryContext = useContext(InventoryContext);

  const userPermissions = useMemo(() => {
    const permissions = new Set<string>();
    currentUser.roles.forEach(userRole => {
      const roleConfig = roles.find(r => r.name === userRole);
      if (roleConfig) {
        roleConfig.permissions.forEach(p => permissions.add(p));
      }
    });
    return Array.from(permissions);
  }, [currentUser.roles]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedAvatar, setEditedAvatar] = useState(currentUser.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const hasPermission = (item: any) => {
    if (!item.permission) return true; // Items without a specific permission are public
    return userPermissions.includes(item.permission);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setAvatarError('El archivo es demasiado grande. El tamaño máximo es 1MB.');
        return;
      }
      setAvatarError(null);
      setAvatarFile(file);
      setEditedAvatar(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = () => {
    // In a real app, this would be an API call. Here we just show a toast.
    toast({
        title: 'Perfil Actualizado',
        description: 'Tu información ha sido guardada exitosamente.'
    });
    setIsEditingProfile(false);
  }
  
  const accessibleModules = navItems
    .map(item => {
        if (item.subItems) {
            const accessibleSubItems = item.subItems.filter(hasPermission);
            if (accessibleSubItems.length > 0) {
                return { ...item, subItems: accessibleSubItems };
            }
            return null;
        }
        return hasPermission(item) ? item : null;
    })
    .filter(Boolean);

  const handleLogout = () => {
    router.push('/login');
  };

  const isSuperAdmin = initialUser.roles.includes('Administrador');
  
  const expiringReservations = useMemo(() => {
        if (!inventoryContext) return [];
        if (currentUser.roles.includes('Asesor de Ventas')) return [];

        const now = new Date();
        return inventoryContext.reservations.filter(r => {
            if (r.status !== 'Validada') return false;
            
            const validationDate = new Date(new Date().setDate(now.getDate() - (Math.random() * 10))); // Mock date
            const diffTime = now.getTime() - validationDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 5;
        });
    }, [inventoryContext, currentUser.roles]);


  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex w-full items-center justify-center">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMenu />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Dialog onOpenChange={(open) => !open && setIsEditingProfile(false)}>
            <DialogTrigger asChild>
                <div className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent/50">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                    <span className="text-sm font-semibold">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditingProfile ? 'Editar Perfil' : 'Perfil de Usuario'}</DialogTitle>
                    <DialogDescription>
                        {isEditingProfile ? 'Actualice su nombre y foto de perfil.' : 'Esta es tu información de perfil y tus permisos actuales.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={editedAvatar} alt={currentUser.name} />
                                <AvatarFallback>{editedName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {isEditingProfile && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute bottom-0 right-0 rounded-full bg-background/80"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Camera className="h-5 w-5" />
                                </Button>
                            )}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/png, image/jpeg"
                              onChange={handleAvatarChange}
                            />
                        </div>
                        <div>
                            {isEditingProfile ? (
                                <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-lg font-semibold" />
                            ): (
                                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                            )}
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {currentUser.roles.map(role => (
                                    <Badge key={role}>{role}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    {avatarError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error de Imagen</AlertTitle>
                          <AlertDescription>{avatarError}</AlertDescription>
                        </Alert>
                    )}
                    {!isEditingProfile && (
                        <div>
                            <h3 className="mb-2 font-medium">Módulos Accesibles</h3>
                            <div className="flex flex-wrap gap-2">
                                {accessibleModules.map(item => (
                                    <Badge key={item?.label} variant="secondary" className="font-normal">
                                        <BadgeCheck className="mr-1.5 h-3 w-3 text-green-500" />
                                        {item?.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
                    {isEditingProfile ? (
                        <>
                            <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
                            <Button onClick={handleProfileSave}><Save className="mr-2 h-4 w-4" /> Guardar Cambios</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</Button>
                            <Button onClick={() => setIsEditingProfile(true)}><Edit className="mr-2 h-4 w-4" />Editar Perfil</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold md:text-xl">
            {navItems.flatMap(item => item.subItems ? [{href: item.href, label: item.label}, ...item.subItems] : item).find((navItem) => navItem?.href === pathname)?.label || 'Inicio'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        {isSuperAdmin && <RoleSwitcher />}
      </SidebarInset>
    </>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState(initialUser);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <InventoryProvider>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
      </InventoryProvider>
    </UserContext.Provider>
  );
}
