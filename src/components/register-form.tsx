
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError(null);
    // In a real app, you would handle the registration logic here,
    // like sending the data to your backend to create a user with a 'pending' status.
    console.log('Registration submitted');

    // Redirect to login page with a query param to show the toast
    router.push('/login?pending_approval=true');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input id="fullname" type="text" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="nombre@ejemplo.com" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
        </div>
        
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      <Button type="submit" className="w-full">
        Crear Cuenta
      </Button>
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia Sesión
        </Link>
      </div>
    </form>
  );
}
