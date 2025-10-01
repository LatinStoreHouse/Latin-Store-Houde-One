
'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Settings />
                                Ajustes Generales
                            </CardTitle>
                            <CardDescription>
                                Administre los parámetros y configuraciones globales de la aplicación.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-12">
                        <p>No hay ajustes generales disponibles por el momento.</p>
                        <p className="text-xs">Los ajustes de las calculadoras ahora se encuentran dentro de cada página de calculadora respectiva.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
