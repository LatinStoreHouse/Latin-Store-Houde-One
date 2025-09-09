
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
    Lightbulb,
    Handshake,
    Bell,
    X,
    Palette,
    Wrench,
    Settings,
    Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Role, roles, User } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext, AppNotification } from '@/context/inventory-context';
import { RoleSwitcher } from '@/components/role-switcher';
import { initialProductPrices } from '@/lib/prices';
import { initialPendingDispatches } from '@/app/(main)/validation/page';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/page-loader';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Label } from '@/components/ui/label';
import { UserContext, useUser } from '@/context/user-context';


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
  { href: '/distributors', label: 'Socios', icon: Handshake, permission: 'partners:view' },
  { href: '/assigned-customers', label: 'Mis Clientes', icon: Users, permission: 'partners:clients' },
  {
    label: 'Calculadoras',
    icon: Calculator,
    permission: 'calculators:use',
    subItems: [
      { href: '/stoneflex-clay-calculator', label: 'Calculadora StoneFlex' },
      { href: '/starwood-calculator', label: 'Calculadora Starwood' },
      { href: '/shipping-calculator', label: 'Calculadora de Envíos' },
    ],
  },
   {
    label: 'Compras',
    icon: ShoppingBag,
    subItems: [
      { href: '/purchasing/suggestions', label: 'Sugerencias de Compra', permission: 'purchasing:suggestions:view' },
    ],
  },
  { href: '/invoices', label: 'Historial de Cotizaciones', icon: Receipt, permission: 'invoices:view' },
  { href: '/designs', label: 'Diseño', icon: Palette, permission: 'designs:view' },
  { href: '/pricing', label: 'Precios', icon: Tags, permission: 'pricing:view' },
  {
    label: 'Administración',
    icon: Settings,
    subItems: [
        { href: '/users', label: 'Usuarios', permission: 'users:manage' },
        { href: '/roles', label: 'Roles y Permisos', permission: 'roles:manage' },
        { href: '/reports', label: 'Reportes', permission: 'reports:view' },
    ]
  }
];

const getIconForSubItem = (label: string, parentIcon: React.ElementType) => {
    switch (label) {
        case 'Inventario': return Warehouse;
        case 'Contenedores': return Container;
        case 'Reservas': return BookUser;
        case 'Despachos': return Truck;
        case 'Historial de Cotizaciones': return Receipt;
        case 'Sugerencias de Compra': return Lightbulb;
        case 'Calculadora StoneFlex': return Store;
        case 'Calculadora Starwood': return Store;
        case 'Calculadora de Envíos': return Truck;
        case 'Asesor IA': return BotMessageSquare;
        case 'Usuarios': return UserCog;
        case 'Roles y Permisos': return ShieldCheck;
        case 'Reportes': return FileText;
        case 'Ajustes Generales': return Wrench;
        default: return parentIcon;
    }
}

const Logo = () => (
    <div className="flex h-24 w-full items-center justify-center p-4">
        <Image
            src="/imagenes/logos/Logo-One-Blanco.png"
            alt="ONE by Latin Store House Logo"
            width={150}
            height={70}
            className="h-full w-full object-contain"
        />
    </div>
);

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
        currentUser.individualPermissions?.forEach(p => permissions.add(p));
        return Array.from(permissions);
    }, [currentUser.roles, currentUser.individualPermissions]);

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
        
        return inventoryContext.systemSuggestions.length > inventoryContext.seenSuggestionsCount;
    }, [inventoryContext?.systemSuggestions, inventoryContext?.seenSuggestionsCount, currentUser.roles]);

    const hasPermission = (item: any) => {
        if (!item.permission) return true;
        return userPermissions.includes(item.permission);
    };

    const getVisibleNavItems = () => {
        return navItems
            .map(item => {
                if (!item.subItems) {
                    return hasPermission(item) ? item : null;
                }
                const visibleSubItems = item.subItems.filter(hasPermission);
                if (visibleSubItems.length > 0) {
                    return { ...item, subItems: visibleSubItems };
                }
                return null;
            })
            .filter(Boolean);
    }

    const visibleNavItems = getVisibleNavItems() as typeof navItems;
    const canEditPrices = hasPermission({ permission: 'pricing:edit' });
    const canViewReservationsAlert = hasPermission({ permission: 'reservations:view' });

    return (
        <SidebarMenu className="px-2">
            {visibleNavItems.map((item) => {
                if (!item) return null;
                return item.subItems ? (
                    <SidebarGroup key={item.label} className="p-0">
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon />}
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.subItems.map((subItem) => {
                                        const SubIcon = getIconForSubItem(subItem.label, item.icon);
                                        return (
                                            <SidebarMenuSubItem key={subItem.href}>
                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                    <Link href={subItem.href!} onClick={() => setOpenMobile(false)}>
                                                        {SubIcon && <SubIcon />}
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
                    item.href && item.icon && (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={item.label}
                            >
                                <Link href={item.href} onClick={() => setOpenMobile(false)} className="flex items-center justify-between w-full">
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
                )
})}
        </SidebarMenu>
    );
};


const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();
  const { setOpenMobile } = useSidebar();
  const inventoryContext = useContext(InventoryContext);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedPhone, setEditedPhone] = useState(currentUser.phone);
  const [editedAvatar, setEditedAvatar] = useState(currentUser.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const userPermissions = useMemo(() => {
    const permissions = new Set<string>();
    currentUser.roles.forEach(userRole => {
      const roleConfig = roles.find(r => r.name === userRole);
      if (roleConfig) {
        roleConfig.permissions.forEach(p => permissions.add(p));
      }
    });
    // Add individual permissions
    currentUser.individualPermissions?.forEach(p => permissions.add(p));
    return Array.from(permissions);
  }, [currentUser.roles, currentUser.individualPermissions]);

  const hasPermission = (item: any) => {
    if (!item.permission) return true; // Items without a specific permission are public
    return userPermissions.includes(item.permission);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        setAvatarError('El archivo es demasiado grande. El tamaño máximo es 500KB.');
        return;
      }
      setAvatarError(null);
      setAvatarFile(file);
      setEditedAvatar(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    
    // --- Final Save ---
    setCurrentUser(prevUser => ({
      ...prevUser,
      name: editedName,
      phone: editedPhone,
      avatar: editedAvatar,
    }));
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

  const isSuperAdmin = currentUser.roles.includes('Administrador');
  
  const relevantNotifications = useMemo(() => {
    if (!inventoryContext?.notifications) return [];
    return inventoryContext.notifications.filter(n => {
        // Show if no specific user/role, or if it matches current user/role
        return (!n.user && !n.role) || (n.user === currentUser.name) || (n.role && currentUser.roles.includes(n.role));
    });
  }, [inventoryContext?.notifications, currentUser.name, currentUser.roles]);

  const unreadNotificationsCount = relevantNotifications.filter(n => !n.read).length;


  const pageTitle = useMemo(() => {
    const allItems = navItems.flatMap(item => 
        item.subItems ? [item, ...item.subItems] : [item]
    );
    const currentNavItem = allItems.find(navItem => navItem?.href === pathname);
    return currentNavItem?.label || 'Inicio';
  }, [pathname]);


  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 text-center">
          <div className="flex w-full items-center justify-center">
            <Logo />
          </div>
           <p className="text-xs font-semibold tracking-widest text-sidebar-foreground/60 mt-1">TODOS EN UNO</p>
        </SidebarHeader>
        <SidebarContent>
          <NavMenu />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Dialog onOpenChange={(open) => {
              if (!open) {
                setIsEditingProfile(false);
              } else {
                 // Reset state when opening dialog
                setEditedName(currentUser.name);
                setEditedPhone(currentUser.phone);
                setEditedAvatar(currentUser.avatar);
                setAvatarError(null);
                setAvatarFile(null);
              }
            }}>
            <DialogTrigger asChild>
                <div className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent/50">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                    <span className="text-sm font-semibold">{currentUser.name}</span>
                    <span className="text-sm text-muted-foreground">{currentUser.email}</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditingProfile ? 'Editar Perfil' : 'Perfil de Usuario'}</DialogTitle>
                    <DialogDescription>
                        {isEditingProfile ? 'Actualice su nombre, foto de perfil y tema preferido.' : 'Esta es tu información de perfil y tus permisos actuales.'}
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
                                  className="absolute bottom-0 right-0 bg-background/80 rounded-full"
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
                                <div className="space-y-2">
                                     <div className="space-y-1">
                                        <Label htmlFor="profile-name">Nombre</Label>
                                        <Input id="profile-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-lg font-semibold" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="profile-phone">Teléfono</Label>
                                        <Input id="profile-phone" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} />
                                    </div>
                                </div>
                            ): (
                                <>
                                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                                <p className="text-sm text-muted-foreground">{currentUser.jobTitle}</p>
                                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                                <p className="text-sm text-muted-foreground">{currentUser.phone}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {currentUser.roles.map(role => (
                                        <Badge key={role}>{role}</Badge>
                                    ))}
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                    {avatarError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error de Imagen</AlertTitle>
                          <AlertDescription>{avatarError}</AlertDescription>
                        </Alert>
                    )}
                    
                    <Separator />

                    {isEditingProfile ? (
                        <div className='space-y-4'>
                            <div>
                                <h3 className="text-sm font-medium mb-2">Tema de la Aplicación</h3>
                                <ThemeSwitcher />
                            </div>
                        </div>
                    ) : (
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
        <PageLoader />
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold md:text-xl">
                    {pageTitle}
                </h1>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative" onClick={() => setIsNotificationsOpen(true)}>
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </Button>
             </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        <footer className="p-4 text-center text-xs text-muted-foreground">
          By Latin Store House
        </footer>
        {isSuperAdmin && <RoleSwitcher />}
      </SidebarInset>
       <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Notificaciones</SheetTitle>
                </SheetHeader>
                <Separator />
                <div className="flex-1 overflow-y-auto">
                    {relevantNotifications.length > 0 ? (
                        <div className="space-y-3 p-1">
                            {relevantNotifications.map(n => {
                                const NotificationContent = () => (
                                    <div className={cn(
                                        "relative rounded-lg border p-3 text-sm transition-colors w-full",
                                        !n.read && "bg-primary/5",
                                        n.href && "cursor-pointer hover:bg-accent/50"
                                    )}>
                                        <p className="font-semibold pr-6">{n.title}</p>
                                        <p className="text-muted-foreground">{n.message}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-muted-foreground/70">{new Date(n.date).toLocaleString()}</p>
                                            {!n.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                                        </div>
                                    </div>
                                );

                                return (
                                <div key={n.id} className="relative">
                                    {n.href ? (
                                        <Link href={n.href} onClick={() => setIsNotificationsOpen(false)} className="block">
                                            <NotificationContent />
                                        </Link>
                                    ) : (
                                        <NotificationContent />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            inventoryContext?.dismissNotification(n.id);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Bell className="h-10 w-10 mb-4" />
                            <p className="font-medium">Todo está al día</p>
                            <p className="text-xs">No tienes notificaciones nuevas.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    </>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
  );
}
