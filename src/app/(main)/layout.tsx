'use client';
import React, { useState, useRef } from 'react';
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
    Camera
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Role, roles } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const initialUser = {
  name: 'Usuario Admin',
  email: 'admin@latinhouse.com',
  role: 'Administrador' as Role,
  avatar: 'https://placehold.co/40x40.png'
};

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  {
    label: 'Inventario',
    icon: Warehouse,
    subItems: [
      { href: '/inventory', label: 'Inventario', permission: 'inventory:view' },
      { href: '/transit', label: 'Contenedores', permission: 'inventory:transit' },
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
        case 'Inventario': return Warehouse;
        case 'Contenedores': return Container;
        case 'Reservas': return BookUser;
        default: return Warehouse;
    }
}

const Logo = () => (
    <div className="relative h-48 w-full">
        <Image 
            src="https://www.latinstorehouse.com/wp-content/uploads/2025/08/Logo-Latin-Store-House-blanco.webp"
            alt="Latin Store House Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
        />
    </div>
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const userPermissions = roles.find(r => r.name === currentUser.role)?.permissions || [];
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
  
  const getVisibleNavItems = () => {
    return navItems.filter(item => {
        if (item.subItems) {
            return item.subItems.some(subItem => hasPermission(subItem));
        }
        return hasPermission(item);
    });
  }

  const visibleNavItems = getVisibleNavItems();
  
  const currentUserRoleDetails = roles.find(r => r.name === currentUser.role);

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
    setCurrentUser(prev => ({
        ...prev,
        name: editedName,
        avatar: editedAvatar,
    }));
    setIsEditingProfile(false);
    toast({
        title: 'Perfil Actualizado',
        description: 'Tu información ha sido guardada exitosamente.'
    });
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


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex w-full items-center justify-center">
            <div className="h-48 w-full">
              <Logo />
            </div>
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
                                    <span className="">{subItem.label}</span>
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
                            <Badge className="mt-2">{currentUser.role}</Badge>
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
                            <DialogClose asChild>
                                <Button variant="outline"><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</Button>
                            </DialogClose>
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
            {navItems.flatMap(item => item.subItems || item).find((navItem) => navItem.href === pathname)?.label || 'Inicio'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
