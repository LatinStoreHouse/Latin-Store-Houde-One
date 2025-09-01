
'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus, ShieldCheck, UserCog, Trash2, Calculator, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/user-form';
import { User, Role, roles } from '@/lib/roles';
import { useUser } from '../layout';
import { SetSalesForm } from '@/components/set-sales-form';
import { initialSalesData, MonthlySales } from '@/lib/sales-data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';


type UserStatus = 'active' | 'inactive' | 'pending';

const initialUsers: (User & {status: UserStatus})[] = [
  { id: '1', name: 'Admin Latin', email: 'admin@latinhouse.com', roles: ['Administrador'], avatar: 'https://placehold.co/40x40/E29ABE/ffffff.png', active: true, status: 'active', individualPermissions: [] },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', roles: ['Asesor de Ventas'], avatar: 'https://placehold.co/40x40/29ABE2/ffffff.png', active: true, status: 'active', individualPermissions: ['partners:manage'] },
  { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', roles: ['Asesor de Ventas'], avatar: 'https://placehold.co/40x40/00BCD4/ffffff.png', active: false, status: 'inactive', individualPermissions: [] },
  { id: '4', name: 'Mary Johnson', email: 'mary.j@example.com', roles: ['Logística'], avatar: 'https://placehold.co/40x40/E2E229/000000.png', active: true, status: 'active', individualPermissions: [] },
  { id: '5', name: 'Carlos Ruiz', email: 'carlos.r@example.com', roles: ['Contador'], avatar: 'https://placehold.co/40x40/f44336/ffffff.png', active: true, status: 'active', individualPermissions: [] },
  { id: '6', name: 'Laura Diaz', email: 'laura.d@example.com', roles: ['Asesor de Ventas'], avatar: 'https://placehold.co/40x40/4CAF50/ffffff.png', active: true, status: 'active', individualPermissions: [] },
  { id: '7', name: 'Solicitante Partner', email: 'nuevo.socio@email.com', roles: ['Partner'], avatar: '', active: false, status: 'pending', individualPermissions: [] },
  { id: '8', name: 'Solicitante Distribuidor', email: 'nuevo.dist@email.com', roles: ['Distribuidor'], avatar: '', active: false, status: 'pending', individualPermissions: [] },
];

export default function UsersPage() {
  const [users, setUsers] = useState<(User & {status: UserStatus})[]>(initialUsers);
  const [salesData, setSalesData] = useState<MonthlySales>(initialSalesData);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<UserStatus>('active');
  const { toast } = useToast();

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  
  const handleOpenSalesModal = (user: User) => {
    setSelectedUser(user);
    setIsSalesModalOpen(true);
  }

  const handleSaveUser = (user: User & {status?: UserStatus}) => {
    if (selectedUser) {
      setUsers(users.map(u => (u.id === user.id ? {...u, ...user} : u)));
    } else {
      setUsers([...users, { ...user, id: String(Date.now()), status: 'active' }]);
    }
    setIsUserModalOpen(false);
  };

  const handleApproveUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? {...u, status: 'active', active: true} : u));
    toast({ title: 'Usuario Aprobado', description: 'El usuario ahora tiene acceso a la aplicación.'});
  }

  const handleDeclineUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({ variant: 'destructive', title: 'Solicitud Rechazada', description: 'La solicitud de registro ha sido eliminada.'});
  }
  
  const handleSaveSales = (advisorName: string, newSales: { [month: string]: { sales: number } }) => {
    setSalesData(prev => ({
        ...prev,
        [advisorName]: newSales
    }));
    setIsSalesModalOpen(false);
  }
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.status === activeTab);
  }, [users, activeTab]);

  const getRoleBadgeVariant = (roleName: Role) => {
      const role = roles.find(r => r.name === roleName);
      if (!role) return 'secondary';
      switch(role.name) {
          case 'Administrador': return 'destructive';
          case 'Asesor de Ventas': return 'default';
          case 'Contador': return 'outline';
          case 'Logística': return 'secondary';
          case 'Marketing': return 'secondary';
          case 'Partner': return 'success';
          case 'Distribuidor': return 'success';
          default: return 'secondary';
      }
  }

  const getStatusBadge = (user: User & {status: UserStatus}) => {
     switch(user.status) {
        case 'active': return <Badge variant='success'>Activo</Badge>;
        case 'inactive': return <Badge variant='secondary'>Inactivo</Badge>;
        case 'pending': return <Badge variant='destructive'>Pendiente Aprobación</Badge>;
     }
  }


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administre las cuentas de usuario, los roles y los permisos.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/roles">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Gestionar Permisos de Roles
                </Link>
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserStatus)} className="mb-4">
            <TabsList>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-center">Roles</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} data-ai-hint="person portrait" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {user.roles.map(role => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                      ))}
                      {user.individualPermissions && user.individualPermissions.length > 0 && (
                        <Badge variant="outline">+{user.individualPermissions.length} permisos</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {user.status === 'pending' ? (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Aprobar Usuario
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeclineUser(user.id)} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar Solicitud
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Editar Usuario y Permisos
                            </DropdownMenuItem>
                             {user.roles.includes('Asesor de Ventas') && (
                                <DropdownMenuItem onClick={() => handleOpenSalesModal(user)}>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    Registrar Ventas
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                               <Trash2 className="mr-2 h-4 w-4" />
                               Eliminar Usuario
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No se encontraron usuarios en esta categoría.
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Actualice los detalles del usuario y sus permisos.' : 'Complete el formulario para agregar un nuevo usuario.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={() => setIsUserModalOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {selectedUser && (
        <Dialog open={isSalesModalOpen} onOpenChange={setIsSalesModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Ventas Mensuales</DialogTitle>
                    <DialogDescription>
                        Añada o actualice el total de ventas para <span className="font-semibold">{selectedUser.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                 <SetSalesForm
                    advisorName={selectedUser.name}
                    salesData={salesData[selectedUser.name] || {}}
                    onSave={handleSaveSales}
                    onCancel={() => setIsSalesModalOpen(false)}
                />
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
