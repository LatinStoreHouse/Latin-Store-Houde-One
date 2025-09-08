
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function ShippingCalculatorPage() {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <Truck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle>Próximamente</CardTitle>
                    <CardDescription>
                        La calculadora de envíos está siendo actualizada con nuevas tarifas y pronto estará disponible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-center text-muted-foreground">
                        Estamos trabajando para brindarte estimaciones de costos de envío más precisas. ¡Vuelve pronto!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
