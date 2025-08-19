'use client';
import React, { useState } from 'react';
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
import { MoreHorizontal, UserPlus, ShieldCheck, UserCog, Trash2 } from 'lucide-react';
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


const initialUsers: User[] = [
  { id: '1', name: 'Admin Latin', email: 'admin@latinhouse.com', roles: ['Administrador'], avatar: 'https://placehold.co/40x40/E29ABE/ffffff.png', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', roles: ['Asesor de Ventas'], avatar: 'https://placehold.co/40x40/29ABE2/ffffff.png', active: true },
  { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', roles: ['Asesor de Ventas'], avatar: 'https://placehold.co/40x40/00BCD4/ffffff.png', active: false },
  { id: '4', name: 'Mary Johnson', email: 'mary.j@example.com', roles: ['Logística'], avatar: 'https://placehold.co/40x40/E2E229/000000.png', active: true },
  { id: '5', name: 'Carlos Ruiz', email: 'carlos.r@example.com', roles: ['Contador'], avatar: 'https://placehold.co/40x40/f44336/ffffff.png', active: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (user: User) => {
    if (selectedUser) {
      setUsers(users.map(u => (u.id === user.id ? user : u)));
    } else {
      setUsers([...users, { ...user, id: String(Date.now()) }]);
    }
    setIsModalOpen(false);
  };
  
  const getRoleBadgeVariant = (roleName: Role) => {
      const role = roles.find(r => r.name === roleName);
      if (!role) return 'secondary';
      switch(role.name) {
          case 'Administrador': return 'destructive';
          case 'Asesor de Ventas': return 'default';
          case 'Contador': return 'outline';
          case 'Logística': return 'secondary';
          case 'Marketing': return 'secondary';
          default: return 'secondary';
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
                    Gestionar Permisos
                </Link>
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant={user.active ? 'default' : 'secondary'}>
                        {user.active ? 'Activo' : 'Inactivo'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Editar Usuario
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Eliminar Usuario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Actualice los detalles del usuario y sus permisos.' : 'Complete el formulario para agregar un nuevo usuario.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
