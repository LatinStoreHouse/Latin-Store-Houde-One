'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const initialLinePricing: { [key: string]: number } = {
  'Pizarra': 177162,
  'Cuarcitas': 177162,
  'Concreto': 188991,
  'Mármol': 239247,
  'Translucida': 252689,
  'Madera': 222710,
  'Metales': 267819,
  '3D autoadhesiva': 207072,
  'Clay': 176000,
  'Default': 100000,
  'Sellante': 50000,
  'Adhesivo': 30000,
};

export default function PricingPage() {
  const [prices, setPrices] = useState(initialLinePricing);
  const { toast } = useToast();

  const handlePriceChange = (line: string, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ''));
    setPrices(prev => ({ ...prev, [line]: isNaN(numericValue) ? 0 : numericValue }));
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveChanges = () => {
    // Here you would typically send the updated prices to your backend
    console.log('Saving prices:', prices);
    toast({
      title: 'Precios actualizados',
      description: 'Los nuevos precios han sido guardados exitosamente.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Precios</CardTitle>
        <CardDescription>
          Ajuste los precios por metro cuadrado (M²) para cada línea de producto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Línea de Producto</TableHead>
              <TableHead className="text-right">Precio (COP / M²)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(prices).map(([line, price]) => (
              <TableRow key={line}>
                <TableCell>
                  <Label htmlFor={`price-${line}`} className="font-medium">{line}</Label>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    id={`price-${line}`}
                    type="text"
                    value={new Intl.NumberFormat('es-CO').format(price)}
                    onChange={(e) => handlePriceChange(line, e.target.value)}
                    className="w-48 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveChanges}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
}
