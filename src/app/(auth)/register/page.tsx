'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Handshake, Loader2, UserPlus, Phone } from 'lucide-react';
import { InventoryContext } from '@/context/inventory-context';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { app } from '@/lib/firebase-config'; // Asumiendo que tienes un archivo de configuración de Firebase

declare global {
    interface Window {
        grecaptcha: any;
        recaptchaVerifier?: RecaptchaVerifier;
        passwordRecaptchaVerifier?: RecaptchaVerifier;
    }
}

interface RegisterFormProps {
    isDemo?: boolean;
}

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const inviteType = searchParams.get('type');
    const inviteRole = searchParams.get('role');
    
    const inventoryContext = useContext(InventoryContext);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const router = useRouter();
    
    const auth = getAuth(app);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (isClient && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    console.log("reCAPTCHA solved, ready to send OTP");
                }
            });
            window.recaptchaVerifier.render();
        }
    }, [isClient, auth]);

  
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

    const handleSendOtp = async () => {
        setError(null);
        if (!phone.startsWith('+57') || phone.length !== 13) {
            setError('Por favor, ingrese un número de teléfono válido con el formato +57XXXXXXXXXX.');
            return;
        }

        setLoading(true);
        try {
            const verifier = window.recaptchaVerifier!;
            const result = await signInWithPhoneNumber(auth, phone, verifier);
            setConfirmationResult(result);
            setIsOtpSent(true);
            setError('Se ha enviado un código de verificación a tu teléfono.');
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            setError(`Error al enviar el código: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        if (!confirmationResult) {
            setError('Primero debe verificar su número de teléfono.');
            setLoading(false);
            return;
        }

        try {
            await confirmationResult.confirm(otp);
            
            // Simulación de registro exitoso después de la verificación del teléfono
            inventoryContext?.addNotification({
                title: 'Nueva Solicitud de Registro',
                message: `El usuario "${name}" se ha registrado y está pendiente de aprobación.`,
                role: 'Administrador'
            });

            router.push('/login?pending_approval=true');
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
            setError(`Código de verificación incorrecto. Inténtelo de nuevo.`);
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div id="recaptcha-container"></div>

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
                        <Input id="fullname" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={loading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Número de Celular</Label>
                        <div className="flex gap-2">
                            <Input id="phone" type="tel" placeholder="+573001234567" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isOtpSent || loading}/>
                            <Button type="button" onClick={handleSendOtp} disabled={!isClient || isOtpSent || loading}>
                                {loading && isOtpSent === false ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Enviar Código'}
                            </Button>
                        </div>
                    </div>
                     {isOtpSent && (
                        <div className="space-y-2">
                            <Label htmlFor="otp">Código de Verificación</Label>
                            <Input id="otp" type="text" placeholder="Ingrese el código de 6 dígitos" required value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading}/>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" placeholder="nombre@ejemplo.com" required disabled={loading}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                    
                    {error && (
                        <Alert variant={isOtpSent && !error.includes('incorrecto') ? 'default' : 'destructive'}>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                <Button type="submit" className="w-full" disabled={!isOtpSent || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
                <div className="mt-4 text-center text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                    Inicia Sesión
                    </Link>
                </div>
                </form>
            </CardContent>
        </Card>
    );
}
