

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Crear una Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Simulating invite link for demonstration */}
                <RegisterForm />
            </CardContent>
        </Card>
    );
}
