import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import Image from 'next/image';
import LatinStoreHouseLogo from '@/assets/images/logos/Logo-Latin-Store-House-color.png';
import OneLogo from '@/assets/images/logos/Logo-One-Blanco.png';

export default function LoginPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Image src={LatinStoreHouseLogo} alt="Latin Store House Logo" width={140} height={40} className="object-contain" />
                    <Image src={OneLogo} alt="ONE Logo" width={70} height={40} className="object-contain" />
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
