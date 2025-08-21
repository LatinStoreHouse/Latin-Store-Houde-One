'use client';

import React, { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface TransferInventoryFormProps {
  onTransfer: (data: { product: string; quantity: number, reservationsToTransfer: Reservation[] }) => void;
}

export function TransferInventoryForm({ onTransfer }: TransferInventoryFormProps) {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, reservations } = context;

  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [selectedReservations, setSelectedReservations] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const productOptions = useMemo(() => {
    const options: { value: string; label: string, available: number }[] = [];
    for (const brand in inventoryData) {
      for (const subCategory in inventoryData[brand]) {
        for (const productName in inventoryData[brand][subCategory]) {
          const item = inventoryData[brand][subCategory][productName];
          const availableInZF = item.zonaFranca - item.separadasZonaFranca;
          if (item.zonaFranca > 0) { // Show any product with stock in ZF
            options.push({
              value: productName,
              label: `${productName} (Total: ${item.zonaFranca}, Disp: ${availableInZF})`,
              available: item.zonaFranca
            });
          }
        }
      }
    }
    return options;
  }, [inventoryData]);
  
  const relevantReservations = useMemo(() => {
    if (!product) return [];
    return reservations.filter(
        r => r.product === product && r.source === 'Zona Franca' && r.status === 'Validada'
    );
  }, [product, reservations]);


  const handleReservationSelection = (reservationId: string, checked: boolean) => {
    setSelectedReservations(prev => ({
        ...prev,
        [reservationId]: checked
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || Number(quantity) <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y una cantidad válida.' });
      return;
    }
    const reservationsToTransfer = relevantReservations.filter(r => selectedReservations[r.id]);
    onTransfer({ product, quantity: Number(quantity), reservationsToTransfer });
  };
  
  const selectedProductInfo = productOptions.find(p => p.value === product);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="product">Producto</Label>
        <Combobox
            options={productOptions}
            value={product}
            onValueChange={(value) => {
                setProduct(value);
                setSelectedReservations({});
            }}
            placeholder="Seleccione un producto"
            searchPlaceholder="Buscar producto..."
            emptyPlaceholder="No hay productos en Zona Franca"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad a Trasladar (Stock Total)</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          max={selectedProductInfo?.available}
          required
        />
        {selectedProductInfo && <p className="text-sm text-muted-foreground">Máximo a trasladar: {selectedProductInfo.available}</p>}
      </div>
      {relevantReservations.length > 0 && (
         <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">Seleccionar Reservas a Trasladar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ScrollArea className="h-40 w-full rounded-md border p-2">
                    <div className="space-y-2">
                        {relevantReservations.map(res => (
                            <div key={res.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50">
                                <Checkbox
                                    id={`res-${res.id}`}
                                    checked={selectedReservations[res.id] || false}
                                    onCheckedChange={(checked) => handleReservationSelection(res.id, Boolean(checked))}
                                />
                                <Label htmlFor={`res-${res.id}`} className="font-normal w-full">
                                    <div className="flex justify-between">
                                        <span>{res.quantity} unid. - {res.advisor}</span>
                                        <span className="text-muted-foreground text-xs">{res.quoteNumber}</span>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
         </Card>
      )}
      <div className="flex justify-end pt-4">
        <Button type="submit">Trasladar Inventario</Button>
      </div>
    </form>
  );
}
