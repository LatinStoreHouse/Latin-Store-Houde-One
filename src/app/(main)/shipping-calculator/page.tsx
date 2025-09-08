
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, PlusCircle, Trash2 } from 'lucide-react';
import { cityOptions, shippingRates } from '@/lib/shipping-rates';
import { Combobox } from '@/components/ui/combobox';

interface Piece {
  id: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export default function ShippingCalculatorPage() {
    const [destination, setDestination] = useState('');
    const [declaredValue, setDeclaredValue] = useState<number | string>('');
    const [insure, setInsure] = useState(true);
    const [pieces, setPieces] = useState<Piece[]>([{ id: 1, weight: 0, length: 0, width: 0, height: 0 }]);
    const [totalCost, setTotalCost] = useState<number | null>(null);

    const handlePiecesChange = <K extends keyof Piece>(index: number, field: K, value: Piece[K]) => {
        const newPieces = [...pieces];
        newPieces[index][field] = value as any;
        setPieces(newPieces);
    };

    const addPiece = () => {
        setPieces([...pieces, { id: Date.now(), weight: 0, length: 0, width: 0, height: 0 }]);
    };

    const removePiece = (id: number) => {
        setPieces(pieces.filter(p => p.id !== id));
    };

    const calculateShipping = () => {
        if (!destination) {
            alert("Por favor, seleccione un destino.");
            return;
        }

        const rateInfo = shippingRates.find(r => r.destino === destination);
        if (!rateInfo) {
            alert("No se encontraron tarifas para el destino seleccionado.");
            return;
        }
        
        const FLETAMENTO_FACTOR = 400; // Factor de conversión kg/m³
        let totalBillableWeight = 0;

        pieces.forEach(piece => {
            const volumeM3 = (piece.length / 100) * (piece.width / 100) * (piece.height / 100);
            const volumetricWeight = volumeM3 * FLETAMENTO_FACTOR;
            totalBillableWeight += Math.max(piece.weight, volumetricWeight);
        });

        const freightCost = rateInfo.tarifa * totalBillableWeight;

        // Simulación de otros costos
        const handlingCost = 5800; // Costo de manejo fijo
        let insuranceCost = 0;
        if (insure && Number(declaredValue) > 0) {
            insuranceCost = Number(declaredValue) * 0.01; // 1% del valor declarado
        }

        const finalCost = freightCost + handlingCost + insuranceCost;
        setTotalCost(finalCost);
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck />Calculadora de Costos de Envío</CardTitle>
                    <CardDescription>
                        Estime los costos de envío para sus paquetes. El origen es siempre Bogotá D.C.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Destino</Label>
                            <Combobox 
                                options={cityOptions}
                                value={destination}
                                onValueChange={setDestination}
                                placeholder="Seleccione una ciudad de destino"
                                searchPlaceholder="Buscar ciudad..."
                                emptyPlaceholder="Ciudad no encontrada."
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="declaredValue">Valor Declarado (COP)</Label>
                            <Input
                                id="declaredValue"
                                type="number"
                                value={declaredValue}
                                onChange={(e) => setDeclaredValue(e.target.value)}
                                placeholder="Ej: 250000"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                             <h3 className="text-lg font-medium">Detalle de Piezas</h3>
                             <Button type="button" variant="outline" size="sm" onClick={addPiece}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Añadir Pieza
                             </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Peso (kg)</TableHead>
                                    <TableHead>Largo (cm)</TableHead>
                                    <TableHead>Ancho (cm)</TableHead>
                                    <TableHead>Alto (cm)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pieces.map((piece, index) => (
                                    <TableRow key={piece.id}>
                                        <TableCell><Input type="number" value={piece.weight} onChange={e => handlePiecesChange(index, 'weight', Number(e.target.value))} /></TableCell>
                                        <TableCell><Input type="number" value={piece.length} onChange={e => handlePiecesChange(index, 'length', Number(e.target.value))} /></TableCell>
                                        <TableCell><Input type="number" value={piece.width} onChange={e => handlePiecesChange(index, 'width', Number(e.target.value))} /></TableCell>
                                        <TableCell><Input type="number" value={piece.height} onChange={e => handlePiecesChange(index, 'height', Number(e.target.value))} /></TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removePiece(piece.id)} disabled={pieces.length === 1}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="insure" checked={insure} onCheckedChange={(checked) => setInsure(Boolean(checked))} />
                        <Label htmlFor="insure">Asegurar mercancía sobre el valor declarado (costo adicional ~1%)</Label>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={calculateShipping}>Calcular Envío</Button>
                    </div>

                    {totalCost !== null && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle>Costo de Envío Estimado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary text-center">{formatCurrency(totalCost)}</p>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Este es un valor aproximado y puede estar sujeto a cambios por parte de la transportadora.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
