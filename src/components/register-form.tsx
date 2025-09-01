
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReCAPTCHA from 'react-google-recaptcha';
import { AlertCircle } from 'lucide-react';

export function RegisterForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleRecaptchaChange = (value: string | null) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isVerified) {
      setError('Por favor, complete la verificación reCAPTCHA.');
      return;
    }

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

        {siteKey ? (
            <div className="flex justify-center">
                <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={handleRecaptchaChange}
                />
            </div>
        ) : (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuración Requerida</AlertTitle>
                <AlertDescription>
                    La clave de sitio de reCAPTCHA no está configurada. Por favor, añádala a su archivo .env para habilitar el registro.
                </AlertDescription>
            </Alert>
        )}
        
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      <Button type="submit" className="w-full" disabled={!isVerified || !siteKey}>
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
