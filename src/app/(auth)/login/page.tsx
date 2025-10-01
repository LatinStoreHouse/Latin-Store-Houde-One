import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Image src="/imagenes/logos/Logo-Latin-Store-House-color.png" alt="Latin Store House Logo" width={140} height={40} className="object-contain" />
                    <Image src="/imagenes/logos/Logo-One-Blanco.png" alt="ONE Logo" width={70} height={40} className="object-contain" />
                </div>
                <CardTitle className="text-2xl">Bienvenido de Nuevo</CardTitle>
                <CardDescription>
                    Ingrese sus credenciales para acceder a su cuenta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    );
}
