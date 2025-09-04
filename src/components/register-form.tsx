
'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Handshake, UserPlus } from 'lucide-react';
import Script from 'next/script';
import { InventoryContext } from '@/context/inventory-context';

declare global {
    interface Window {
        grecaptcha: any;
        onloadCallback: () => void;
    }
}

interface RegisterFormProps {
    isDemo?: boolean;
}

export function RegisterForm({ isDemo = false }: RegisterFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useContext(InventoryContext)!;

  const inviteType = isDemo ? 'distributor' : searchParams.get('type');
  const inviteRole = searchParams.get('role');

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  const getInvitationDetails = () => {
    if (inviteType === 'distributor') {
        return {
            title: 'Solicitud de Cuenta de Distribuidor',
            description: `Complete el formulario para solicitar una cuenta de distribuidor. Su cuenta requerirá la aprobación de un administrador.`,
            icon: Handshake
        }
    }
     if (inviteType === 'partner') {
        return {
            title: 'Solicitud de Cuenta de Partner',
            description: `Complete el formulario para solicitar una cuenta de partner. Su cuenta requerirá la aprobación de un administrador.`,
            icon: Handshake
        }
    }
    if (inviteRole) {
        return {
            title: `Registro para Rol de ${inviteRole}`,
            description: `Complete el formulario para registrarse. Su cuenta será creada con el rol de ${inviteRole} y requerirá la aprobación de un administrador.`,
            icon: UserPlus
        }
    }
    return {
        title: 'Crear una Cuenta',
        description: 'Complete el formulario para solicitar una cuenta. Su cuenta requerirá la aprobación de un administrador.',
        icon: null
    };
  }

  const { title, description, icon: Icon } = getInvitationDetails();


  useEffect(() => {
    window.onloadCallback = () => {
      if (window.grecaptcha && recaptchaRef.current) {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey!,
          callback: () => setIsVerified(true),
        });
      }
    };

    return () => {
        // Clean up the callback
        delete window.onloadCallback;
    }
  }, [siteKey]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isVerified && !isDemo) {
      setError('Por favor, complete la verificación reCAPTCHA.');
      return;
    }

    // In a real app, you would handle the registration logic here,
    // like sending the data to your backend to create a user with a 'pending' status.
    console.log('Registration submitted for type:', inviteType || 'standard', 'with role:', inviteRole);

    addNotification({
        title: 'Nueva Solicitud de Registro',
        message: `El usuario "${name}" se ha registrado y está pendiente de aprobación.`,
        role: 'Administrador'
    });

    // Redirect to login page with a query param to show the toast
    router.push('/login?pending_approval=true');
  };

  return (
    <>
    {siteKey && !isDemo && (
        <Script 
            src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" 
            strategy="afterInteractive" 
        />
    )}
    <form onSubmit={handleSubmit} className="space-y-4">
        {(inviteType || inviteRole) && Icon && (
            <Alert variant="default" className="border-primary/20 bg-primary/5">
                <Icon className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">{title}</AlertTitle>
                <AlertDescription className="text-primary/80">
                    {description}
                </AlertDescription>
            </Alert>
        )}
        <div className="space-y-2">
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input id="fullname" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
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

        {siteKey && !isDemo ? (
            <div ref={recaptchaRef} className="flex justify-center"></div>
        ) : (
             !isDemo && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuración Requerida</AlertTitle>
                    <AlertDescription>
                        La clave de sitio de reCAPTCHA no está configurada. Por favor, añádala a su archivo .env para habilitar el registro.
                    </AlertDescription>
                </Alert>
            )
        )}
        
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      <Button type="submit" className="w-full" disabled={(!isVerified && !isDemo) || !siteKey}>
        Crear Cuenta
      </Button>
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia Sesión
        </Link>
      </div>
    </form>
    </>
  );
}
