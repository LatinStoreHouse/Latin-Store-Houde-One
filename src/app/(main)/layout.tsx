import { ClientLayout } from './providers'; // Importamos nuestro nuevo componente de cliente

// Este es un Componente de Servidor por defecto.
// No tiene 'use client' y es súper ligero.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Su única responsabilidad es renderizar el layout del lado del cliente,
  // pasándole los "hijos" (que serán tus páginas).
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}