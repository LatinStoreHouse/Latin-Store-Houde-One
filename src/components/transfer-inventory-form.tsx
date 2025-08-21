'use client';

import React, { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';

export interface TransferItem {
    productName: string;
    quantity: number;
    reservationsToTransfer: Reservation[];
}

interface TransferInventoryFormProps {
  onTransfer: (items: TransferItem[]) => void;
}

export function TransferInventoryForm({ onTransfer }: TransferInventoryFormProps) {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, reservations } = context;
  
  const [transferList, setTransferList] = useState<TransferItem[]>([]);
  
  // Form state for adding a new product to the list
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [selectedReservations, setSelectedReservations] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const productOptions = useMemo(() => {
    const options: { value: string; label: string, available: number }[] = [];
    const productsInList = new Set(transferList.map(item => item.productName));

    for (const brand in inventoryData) {
      for (const subCategory in inventoryData[brand]) {
        for (const productName in inventoryData[brand][subCategory]) {
          if (productsInList.has(productName)) continue; // Don't show products already in the list
          
          const item = inventoryData[brand][subCategory][productName];
          const availableInZF = item.zonaFranca;
          if (availableInZF > 0) {
            options.push({
              value: productName,
              label: `${productName} (Total ZF: ${item.zonaFranca})`,
              available: availableInZF
            });
          }
        }
      }
    }
    return options;
  }, [inventoryData, transferList]);
  
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
  
  const handleAddToList = () => {
    if (!product || !quantity || Number(quantity) <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y una cantidad válida.' });
      return;
    }
    
    const productInfo = productOptions.find(p => p.value === product);
    if (productInfo && Number(quantity) > productInfo.available) {
        toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad a trasladar (${quantity}) excede el total en Zona Franca (${productInfo.available}).` });
        return;
    }

    const reservationsToTransfer = relevantReservations.filter(r => selectedReservations[r.id]);
    
    const newTransferItem: TransferItem = {
        productName: product,
        quantity: Number(quantity),
        reservationsToTransfer
    };
    
    setTransferList([...transferList, newTransferItem]);

    // Reset form
    setProduct('');
    setQuantity('');
    setSelectedReservations({});
  };
  
  const handleRemoveFromList = (productNameToRemove: string) => {
    setTransferList(transferList.filter(item => item.productName !== productNameToRemove));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferList.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'La lista de traslado está vacía. Agregue al menos un producto.' });
        return;
    }
    onTransfer(transferList);
  };
  
  const selectedProductInfo = productOptions.find(p => p.value === product);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Añadir Producto al Lote de Traslado</CardTitle>
            <CardDescription>Seleccione los productos y cantidades a mover de Zona Franca a Bodega.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    emptyPlaceholder="No hay más productos en Zona Franca"
                />
            </div>
            {product && (
                <>
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
                    <div className="space-y-2">
                        <Label>Seleccionar Reservas a Trasladar</Label>
                        <ScrollArea className="h-32 w-full rounded-md border p-2">
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
                    </div>
                )}
                
                <div className="flex justify-end">
                    <Button type="button" onClick={handleAddToList}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir a la Lista
                    </Button>
                </div>
                </>
            )}
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Lote de Traslado ({transferList.length} productos)</CardTitle>
            <CardDescription>Esta es la lista de productos que se moverán.</CardDescription>
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-48 w-full">
            <div className="space-y-3">
                {transferList.map(item => (
                    <div key={item.productName} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                                Mover: {item.quantity} unidades | Mover Reservas: {item.reservationsToTransfer.reduce((acc, r) => acc + r.quantity, 0)} unidades ({item.reservationsToTransfer.length} reservas)
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromList(item.productName)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 {transferList.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        La lista de traslado está vacía.
                    </div>
                )}
            </div>
           </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={transferList.length === 0}>Trasladar Lote de Inventario</Button>
      </div>
    </form>
  );
}
