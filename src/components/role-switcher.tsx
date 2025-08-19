'use client';

import React from 'react';
import { useUser } from '@/app/(main)/layout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users } from 'lucide-react';
import { Role, roles } from '@/lib/roles';

export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useUser();
  const currentRole = currentUser.roles[0];

  const handleRoleChange = (roleName: string) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      roles: [roleName as Role],
    }));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Users className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel>Cambiar Rol de Prueba</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentRole}
            onValueChange={handleRoleChange}
          >
            {roles.map(role => (
              <DropdownMenuRadioItem key={role.id} value={role.name}>
                {role.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
