
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
import { useUser } from '@/app/(main)/layout';


export default function SettingsPage() {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('SettingsPage must be used within an InventoryProvider');
    }
    const { adhesiveYields, sealantYields, setAdhesiveYields, setSealantYields } = context;
    const { currentUser } = useUser();
    
    const [localAdhesiveYields, setLocalAdhesiveYields] = useState<AdhesiveYield[]>(adhesiveYields);
    const [localSealantYields, setLocalSealantYields] = useState<SealantYield[]>(sealantYields);
    const [hasChanges, setHasChanges] = useState(false);
    const { toast } = useToast();

    const handleAdhesiveChange = (index: number, field: keyof AdhesiveYield, value: string) => {
        const newYields = [...localAdhesiveYields];
        (newYields[index] as any)[field] = value;
        setLocalAdhesiveYields(newYields);
        setHasChanges(true);
    };

    const handleSealantChange = (index: number, field: keyof SealantYield, value: string | number) => {
        const newYields = [...localSealantYields];
        (newYields[index] as any)[field] = value;
        setLocalSealantYields(newYields);
        setHasChanges(true);
    };

    const handleAddYield = (type: 'adhesive' | 'sealant') => {
        if (type === 'adhesive') {
            setLocalAdhesiveYields([...localAdhesiveYields, { line: '', standard: '', xl: '' }]);
        } else {
            setLocalSealantYields([...localSealantYields, { sealant: '', standardYield: 0, clayYield: 0 }]);
        }
        setHasChanges(true);
    };
    
    const handleRemoveYield = (index: number, type: 'adhesive' | 'sealant') => {
        if (type === 'adhesive') {
            setLocalAdhesiveYields(localAdhesiveYields.filter((_, i) => i !== index));
        } else {
            setLocalSealantYields(localSealantYields.filter((_, i) => i !== index));
        }
        setHasChanges(true);
    }

    const handleSaveChanges = () => {
        setAdhesiveYields(localAdhesiveYields);
        setSealantYields(localSealantYields);
        setHasChanges(false);
        toast({ title: 'Ajustes Guardados', description: 'Los rendimientos de los insumos han sido actualizados.' });
    };

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
                        {hasChanges && (
                             <Button onClick={handleSaveChanges}>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rendimiento de Adhesivos (Calculadora StoneFlex)</CardTitle>
                    <CardDescription>Define cuántas unidades de adhesivo se necesitan por tipo de lámina.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Línea de Producto</TableHead>
                                <TableHead>Adhesivo por Lámina (Estándar)</TableHead>
                                <TableHead>Adhesivo por Lámina (XL)</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localAdhesiveYields.map((yieldData, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input value={yieldData.line} onChange={(e) => handleAdhesiveChange(index, 'line', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input value={yieldData.standard} onChange={(e) => handleAdhesiveChange(index, 'standard', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input value={yieldData.xl} onChange={(e) => handleAdhesiveChange(index, 'xl', e.target.value)} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" onClick={() => handleRemoveYield(index, 'adhesive')}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => handleAddYield('adhesive')}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Añadir Fila
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Rendimiento de Sellantes (Calculadora StoneFlex)</CardTitle>
                    <CardDescription>Define cuántos metros cuadrados (M²) rinde cada tipo de sellante.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Sellante</TableHead>
                                <TableHead>Rendimiento (Otras Ref.)</TableHead>
                                <TableHead>Rendimiento (Línea Clay)</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localSealantYields.map((yieldData, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input value={yieldData.sealant} onChange={(e) => handleSealantChange(index, 'sealant', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={yieldData.standardYield} onChange={(e) => handleSealantChange(index, 'standardYield', Number(e.target.value))} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={yieldData.clayYield} onChange={(e) => handleSealantChange(index, 'clayYield', Number(e.target.value))} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" onClick={() => handleRemoveYield(index, 'sealant')}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => handleAddYield('sealant')}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Añadir Fila
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
