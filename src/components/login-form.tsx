'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function LoginForm() {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd redirect to the main page.
    // For now, we'll just log to the console.
    console.log('Login submitted');
    window.location.href = '/';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" placeholder="nombre@ejemplo.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
            </Link>
        </div>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Iniciar Sesión
      </Button>
       <div className="mt-4 text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="#" className="font-semibold text-primary hover:underline">
          Regístrate
        </Link>
      </div>
    </form>
  );
}
