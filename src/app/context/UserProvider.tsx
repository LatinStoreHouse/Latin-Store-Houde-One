// src/context/UserProvider.tsx

'use client';
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { User } from '@/lib/roles'; // Asegúrate que la ruta a tus tipos de roles es correcta

// Definimos la forma exacta del contexto para que TypeScript nos ayude
interface UserContextType {
  currentUser: User | null; // El usuario puede ser nulo al principio
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Creamos el contexto con el tipo definido
const UserContext = createContext<UserContextType | null>(null);

// Creamos el componente "Proveedor"
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Esto es para que el valor del contexto no se recalcule en cada render
  const value = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);

  useEffect(() => {
    // Aquí iría tu lógica real para cargar el usuario desde Firebase Auth
    // Por ahora, simulamos un usuario logueado después de 1 segundo
    const mockUser: User = {
      id: 'USR-001',
      name: 'Wilder Parra',
      email: 'wilder@lsh.com',
      avatar: 'https://github.com/shadcn.png',
      roles: ['Administrador', 'Asesor de Ventas', 'Logística'],
      phone: '3001234567',
      jobTitle: 'Gerente',
      individualPermissions: ['designs:view'],
    };
    setTimeout(() => {
      setCurrentUser(mockUser);
    }, 1000);
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Creamos el hook personalizado para usar el contexto fácilmente
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
}