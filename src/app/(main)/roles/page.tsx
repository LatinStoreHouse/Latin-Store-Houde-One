'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { roles as initialRoles, Permission, RoleConfig } from '@/lib/roles';
import { Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const permissionGroups: { name: string; permissions: { id: Permission, label: string }[] }[] = [
    {
        name: 'General',
        permissions: [
            { id: 'dashboard:view', label: 'Ver Tablero' },
        ]
    },
    {
        name: 'Inventario y Ventas',
        permissions: [
            { id: 'inventory:view', label: 'Ver Inventario' },
            { id: 'inventory:transit', label: 'Ver Contenedores en Tránsito' },
            { id: 'reservations:view', label: 'Ver Reservas' },
            { id: 'reservations:create', label: 'Crear Reservas' },
            { id: 'orders:view', label: 'Ver Despachos' },
            { id: 'orders:create', label: 'Crear Despachos' },
            { id: 'invoices:view', label: 'Ver Historial de Cotizaciones' },
        ]
    },
    {
        name: 'Clientes',
        permissions: [
            { id: 'customers:view', label: 'Ver Clientes' },
            { id: 'customers:create', label: 'Crear Clientes' },
            { id: 'customers:edit', label: 'Editar Clientes' },
        ]
    },
    {
        name: 'Administración y Contabilidad',
        permissions: [
            { id: 'validation:view', label: 'Acceder a Página de Validación' },
            { id: 'reservations:validate', label: 'Validar Reservas' },
            { id: 'orders:validate', label: 'Validar Despachos' },
            { id: 'pricing:view', label: 'Ver Precios' },
            { id: 'pricing:edit', label: 'Editar Precios' },
            { id: 'reports:view', label: 'Ver Reportes' },
        ]
    },
    {
        name: 'Gestión del Sistema',
        permissions: [
            { id: 'users:view', label: 'Ver Usuarios' },
            { id: 'users:manage', label: 'Gestionar Usuarios' },
            { id: 'roles:view', label: 'Ver Roles' },
            { id: 'roles:manage', label: 'Gestionar Roles' },
        ]
    },
    {
        name: 'Herramientas',
        permissions: [
            { id: 'calculators:use', label: 'Usar Calculadoras' },
            { id: 'advisor:use', label: 'Usar Asesor IA' },
        ]
    }
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
              <CardContent>
                <Accordion type="multiple" className="w-full">
                    {permissionGroups.map(group => (
                        <AccordionItem value={group.name} key={group.name}>
                            <AccordionTrigger>{group.name}</AccordionTrigger>
                            <AccordionContent className="space-y-3 pl-1">
                                {group.permissions.map(permission => (
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
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
}
