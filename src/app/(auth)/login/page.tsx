import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
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
