'use client';

import React, { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext } from '@/context/inventory-context';

interface TransferInventoryFormProps {
  onTransfer: (data: { product: string; quantity: number }) => void;
}

export function TransferInventoryForm({ onTransfer }: TransferInventoryFormProps) {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData } = context;

  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const { toast } = useToast();

  const productOptions = useMemo(() => {
    const options: { value: string; label: string, available: number }[] = [];
    for (const brand in inventoryData) {
      for (const subCategory in inventoryData[brand]) {
        for (const productName in inventoryData[brand][subCategory]) {
          const item = inventoryData[brand][subCategory][productName];
          const availableInZF = item.zonaFranca - item.separadasZonaFranca;
          if (availableInZF > 0) {
            options.push({
              value: productName,
              label: `${productName} (Disp: ${availableInZF})`,
              available: availableInZF
            });
          }
        }
      }
    }
    return options;
  }, [inventoryData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || Number(quantity) <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y una cantidad válida.' });
      return;
    }
    onTransfer({ product, quantity: Number(quantity) });
  };
  
  const selectedProductInfo = productOptions.find(p => p.value === product);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="product">Producto</Label>
        <Combobox
            options={productOptions}
            value={product}
            onValueChange={setProduct}
            placeholder="Seleccione un producto"
            searchPlaceholder="Buscar producto..."
            emptyPlaceholder="No hay productos en Zona Franca"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad a Trasladar</Label>
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
      <div className="flex justify-end pt-4">
        <Button type="submit">Trasladar Inventario</Button>
      </div>
    </form>
  );
}
