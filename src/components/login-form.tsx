
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here.
    // We'll simulate a successful login and redirect.
    console.log('Login submitted');
    
    // Check if there's a pending approval message
    const pendingApproval = new URLSearchParams(window.location.search).get('pending_approval');
    if (pendingApproval) {
        toast({
            title: 'Registro Enviado',
            description: 'Gracias por registrarte. Tu cuenta está pendiente de aprobación por un administrador.',
        });
    }

    router.replace('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" placeholder="nombre@ejemplo.com" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
            </Link>
        </div>
        <Input id="password" type="password" />
      </div>
      <Button type="submit" className="w-full">
        Iniciar Sesión
      </Button>
       <div className="mt-4 text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Regístrate
        </Link>
      </div>
    </form>
  );
}
