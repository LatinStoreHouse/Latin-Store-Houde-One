'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Role, roles } from '@/lib/roles';
import { Checkbox } from './ui/checkbox';

interface UserFormProps {
  user?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [active, setActive] = useState(true);

  const isEditingAdmin = user?.roles.includes('Administrador') ?? false;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setSelectedRoles(user.roles);
      setActive(user.active);
    } else {
      setName('');
      setEmail('');
      setSelectedRoles(['Asesor de Ventas']);
      setActive(true);
    }
  }, [user]);

  const handleRoleChange = (roleName: Role, checked: boolean) => {
    if (isEditingAdmin) return;
    
    setSelectedRoles(prev => 
      checked ? [...prev, roleName] : prev.filter(r => r !== roleName)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: user?.id || '',
      name,
      email,
      roles: selectedRoles,
      active,
      avatar: user?.avatar || `https://placehold.co/40x40.png`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="space-y-2 rounded-md border p-4">
            {roles.map((r) => (
              <div key={r.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${r.id}`}
                    checked={selectedRoles.includes(r.name)}
                    onCheckedChange={(checked) => handleRoleChange(r.name, Boolean(checked))}
                    disabled={r.name === 'Administrador' && isEditingAdmin}
                  />
                  <Label htmlFor={`role-${r.id}`} className="font-normal">
                      {r.name}
                  </Label>
              </div>
            ))}
        </div>
        {isEditingAdmin && <p className="text-xs text-muted-foreground">El rol de Administrador no se puede modificar.</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={setActive}
        />
        <Label htmlFor="active">Usuario Activo</Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  );
}
