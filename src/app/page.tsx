'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// En una aplicación real, aquí se verificaría el estado de autenticación.
const isAuthenticated = true; // Simulado para el propósito de este ejemplo.

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/'); 
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirigiendo...</p>
    </div>
  );
}
