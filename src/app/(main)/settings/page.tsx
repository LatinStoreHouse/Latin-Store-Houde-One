
'use client';
import React, { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Settings, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { InventoryContext } from '@/context/inventory-context';
import { useToast } from '@/hooks/use-toast';
import { AdhesiveYield, SealantYield } from '@/context/inventory-context';
import { useUser } from '@/context/user-context';


export default function SettingsPage() {
    const { currentUser } = useUser();
    
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
