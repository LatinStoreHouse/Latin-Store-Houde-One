'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { roles as initialRoles, Permission, RoleConfig } from '@/lib/roles';
import { Save } from 'lucide-react';

const allPermissions: { id: Permission, label: string }[] = [
    { id: 'dashboard:view', label: 'Ver Tablero' },
    { id: 'inventory:view', label: 'Ver Inventario' },
    { id: 'orders:view', label: 'Ver Pedidos' },
    { id: 'orders:validate', label: 'Validar Pedidos' },
    { id: 'orders:create', label: 'Crear Pedidos' },
    { id: 'customers:view', label: 'Ver Clientes' },
    { id: 'customers:create', label: 'Crear Clientes' },
    { id: 'customers:edit', label: 'Editar Clientes' },
    { id: 'calculators:use', label: 'Usar Calculadoras' },
    { id: 'pricing:view', label: 'Ver Precios' },
    { id: 'pricing:edit', label: 'Editar Precios' },
    { id: 'users:view', label: 'Ver Usuarios' },
    { id: 'users:manage', label: 'Gestionar Usuarios' },
    { id: 'roles:view', label: 'Ver Roles' },
    { id: 'roles:manage', label: 'Gestionar Roles' },
    { id: 'reports:view', label: 'Ver Reportes' },
    { id: 'advisor:use', label: 'Usar Asesor IA' },
];


export default function RolesPage() {
    const [roles, setRoles] = useState<RoleConfig[]>(initialRoles);
    const { toast } = useToast();

    const handlePermissionChange = (roleId: string, permissionId: Permission, checked: boolean) => {
        setRoles(currentRoles =>
            currentRoles.map(role => {
                if (role.id === roleId) {
                    const newPermissions = checked
                        ? [...role.permissions, permissionId]
                        : role.permissions.filter(p => p !== permissionId);
                    return { ...role, permissions: newPermissions };
                }
                return role;
            })
        );
    };
    
    const handleSaveChanges = () => {
        console.log('Nuevos permisos guardados:', roles);
        toast({
          title: 'Permisos actualizados',
          description: 'Los cambios en los roles han sido guardados exitosamente.',
        });
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Roles y Permisos</h1>
                <p className="text-muted-foreground">
                    Asigne permisos a los roles para controlar el acceso a las funciones de la aplicación.
                </p>
            </div>
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>
                  Define a qué puede acceder un {role.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`${role.id}-${permission.id}`}
                      checked={role.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(role.id, permission.id, Boolean(checked))}
                    />
                    <Label htmlFor={`${role.id}-${permission.id}`} className="font-normal text-sm">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
}