
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
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
                <CardTitle className="text-2xl">Crear una Cuenta</CardTitle>
                <CardDescription>
                    Complete el formulario para solicitar una cuenta. Su cuenta requerirá la aprobación de un administrador.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm />
            </CardContent>
        </Card>
    );
}
