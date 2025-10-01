
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // In a real app, you'd handle authentication here.
    // We'll simulate a successful login and redirect.
    setTimeout(() => {
        console.log('Login submitted');
        
        // Check if there's a pending approval message
        const pendingApproval = new URLSearchParams(window.location.search).get('pending_approval');
        if (pendingApproval) {
            toast({
                title: 'Registro Enviado',
                description: 'Gracias por registrarte. Tu cuenta está pendiente de aprobación por un administrador.',
            });
        }

        router.replace('/dashboard');
    }, 1000); // Simulate network delay
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" placeholder="nombre@ejemplo.com" required disabled={loading} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
            </Link>
        </div>
        <Input id="password" type="password" required disabled={loading} />
      </div>
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}
