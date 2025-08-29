
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CAPTCHA_KEYWORD = "seguridad";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (captchaAnswer.toLowerCase() !== CAPTCHA_KEYWORD) {
      setError(`La palabra de seguridad es incorrecta. Por favor, escriba "${CAPTCHA_KEYWORD}".`);
      setCaptchaAnswer('');
      return;
    }

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

    router.replace('/dashboard');
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

       <div className="space-y-2 rounded-md border bg-muted/50 p-3">
            <Label htmlFor="captcha">Verificación de Seguridad</Label>
             <p className="text-sm text-muted-foreground">
                Para iniciar sesión, escriba la palabra <span className="font-bold text-foreground">{`"${CAPTCHA_KEYWORD}"`}</span> abajo.
             </p>
            <Input 
                id="captcha" 
                type="text"
                required 
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Escriba la palabra aquí..."
                className="w-full bg-background"
                autoComplete="off"
            />
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

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
