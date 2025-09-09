
'use client';
import { createContext, useContext } from 'react';
import type { User } from '@/lib/roles';

// We need a context to pass the currentUser and its setter around.
export const UserContext = createContext<{
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
