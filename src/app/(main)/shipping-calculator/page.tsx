
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { shippingRates, cityOptions } from '@/lib/shipping-rates';
import { Calculator, DollarSign, Truck } from 'lucide-react';

export default function ShippingCalculatorPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [weight, setWeight] = useState<number | string>('');
    const [length, setLength] = useState<number | string>('');
    const [width, setWidth] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

    const handleCalculate = () => {
        const numWeight = Number(weight);
        const numLength = Number(length);
        const numWidth = Number(width);
        const numHeight = Number(height);

        if (!origin || !destination || numWeight <= 0 || numLength <= 0 || numWidth <= 0 || numHeight <= 0) {
            setCalculatedCost(null);
            return;
        }

        const rate = shippingRates[destination];
        if (!rate) {
            setCalculatedCost(null);
            // In a real app, show a toast or error message
            return;
        }

        const volumetricWeight = (numLength * numWidth * numHeight) / 5000;
        const chargeableWeight = Math.max(numWeight, volumetricWeight);

        const cost = rate.base + (chargeableWeight * rate.perKg);
        setCalculatedCost(cost);
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(value);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Calculadora de Costos de Envío</CardTitle>
                            <CardDescription>
                                Estime el costo de envío basado en el destino, peso y dimensiones del paquete.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Origen</Label>
                            <Combobox options={cityOptions} value={origin} onValueChange={setOrigin} placeholder="Seleccionar origen" />
                        </div>
                        <div className="space-y-2">
                            <Label>Destino</Label>
                            <Combobox options={cityOptions} value={destination} onValueChange={setDestination} placeholder="Seleccionar destino" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Peso (kg)</Label>
                            <Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ej: 10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Dimensiones (cm)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="Largo" />
                                <Input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="Ancho" />
                                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Alto" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button onClick={handleCalculate} className="w-full">
                            <Calculator className="mr-2 h-4 w-4" />
                            Calcular Costo de Envío
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {calculatedCost !== null && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <DollarSign className="h-6 w-6" />
                            Costo de Envío Estimado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold">{formatCurrency(calculatedCost)}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                           Este es un costo aproximado y puede estar sujeto a cambios.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
