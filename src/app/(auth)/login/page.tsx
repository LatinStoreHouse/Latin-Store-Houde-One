import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-20 w-48 relative">
                   <Image 
                     src="https://www.latinstorehouse.com/wp-content/uploads/2021/02/LATIN-STORE-HOUSE.png"
                     alt="Latin Store House Logo"
                     fill
                     style={{ objectFit: 'contain' }}
                     priority
                   />
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
