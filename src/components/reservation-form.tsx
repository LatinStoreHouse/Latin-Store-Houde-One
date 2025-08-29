
'use client';
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';

interface ReservationItem {
    id: number;
    productName: string;
    quantity: number;
    source: 'Contenedor' | 'Bodega' | 'Zona Franca';
    sourceId: string;
}

interface ReservationFormProps {
    initialProduct?: string;
    onSave: (reservations: Reservation[]) => void;
    onCancel: () => void;
}

export function ReservationForm({ initialProduct, onSave, onCancel }: ReservationFormProps) {
    const { inventoryData, containers } = useContext(InventoryContext)!;
    const { currentUser } = useUser();
    const { toast } = useToast();

    // General quote info
    const [customerName, setCustomerName] = useState('');
    const [quoteNumber, setQuoteNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    
    // Form fields for adding one item
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState<number | string>(1);
    const [reservationSource, setReservationSource] = useState<'Contenedor' | 'Bodega' | 'Zona Franca'>('Bodega');
    const [selectedContainerId, setSelectedContainerId] = useState('');

    // List of items in the current quote
    const [reservationItems, setReservationItems] = useState<ReservationItem[]>([]);
    
    useEffect(() => {
        if (initialProduct) {
            setProductName(initialProduct);
            setReservationSource('Bodega'); // Default assumption
        }
    }, [initialProduct]);

    const activeContainers = useMemo(() => containers.filter(c => c.status !== 'Ya llego'), [containers]);
    
    const containerOptions = useMemo(() => {
        return activeContainers.map(c => ({
            value: c.id,
            label: `${c.id} (Llegada: ${c.eta})`
        }));
    }, [activeContainers]);

    const productOptions = useMemo(() => {
        const productSource = reservationSource;
        if (productSource === 'Contenedor') {
            if (!selectedContainerId) return [];
            const container = activeContainers.find(c => c.id === selectedContainerId);
            if (!container) return [];
            return container.products.map(p => {
                const reservedOnThisContainer = reservationItems
                    .filter(item => item.sourceId === container.id && item.productName === p.name)
                    .reduce((sum, item) => sum + item.quantity, 0);
                return {
                    value: p.name,
                    label: `${p.name} (Disp: ${p.quantity - reservedOnThisContainer})`,
                    available: p.quantity - reservedOnThisContainer,
                    sourceId: container.id,
                };
            });
        } else { // Bodega o Zona Franca
            const options: { value: string; label: string; available: number; sourceId: string }[] = [];
            for (const brand in inventoryData) {
                for (const line in inventoryData[brand]) {
                    for (const name in inventoryData[brand][line]) {
                        const item = inventoryData[brand][line][name];
                        const availableStock = productSource === 'Bodega' ? item.bodega - item.separadasBodega : item.zonaFranca - item.separadasZonaFranca;
                        const reservedInThisForm = reservationItems
                            .filter(resItem => resItem.productName === name && resItem.source === productSource)
                            .reduce((sum, resItem) => sum + resItem.quantity, 0);

                        if (availableStock - reservedInThisForm > 0) {
                             options.push({ 
                                value: name, 
                                label: `${name} (Disp: ${availableStock - reservedInThisForm})`, 
                                available: availableStock - reservedInThisForm, 
                                sourceId: productSource
                            });
                        }
                    }
                }
            }
            return options;
        }
    }, [reservationSource, inventoryData, activeContainers, selectedContainerId, reservationItems]);

    const handleAddToList = () => {
        if (!productName || !quantity || Number(quantity) <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos requeridos.' });
            return;
        }
        
        const productInfo = productOptions.find(p => p.value === productName);
        if (!productInfo || Number(quantity) > productInfo.available) {
             toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad solicitada (${quantity}) excede la disponible (${productInfo?.available || 0}).` });
            return;
        }

        const newItem: ReservationItem = {
            id: Date.now(),
            productName,
            quantity: Number(quantity),
            source: reservationSource,
            sourceId: reservationSource === 'Contenedor' ? selectedContainerId : reservationSource,
        };

        setReservationItems(prev => [...prev, newItem]);
        // Reset form fields
        setProductName('');
        setQuantity(1);
    };

    const handleRemoveFromList = (id: number) => {
        setReservationItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = () => {
         if (!customerName || !quoteNumber || reservationItems.length === 0 || (!isPaid && !expirationDate)) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete los datos de la cotización y agregue al menos un producto.' });
            return;
        }
        
        const quoteExists = context.reservations.some(r => r.quoteNumber.toLowerCase() === quoteNumber.toLowerCase());
        if (quoteExists) {
            toast({ variant: 'destructive', title: 'Error', description: 'El número de cotización ya existe.'});
            return;
        }

        const newReservations: Reservation[] = reservationItems.map(item => ({
            id: `RES-${quoteNumber}-${item.id}`,
            customer: customerName,
            product: item.productName,
            quantity: item.quantity,
            source: item.source,
            sourceId: item.sourceId,
            advisor: currentUser.name,
            quoteNumber: quoteNumber,
            status: 'En espera de validación',
            isPaid,
            expirationDate: isPaid ? undefined : expirationDate,
        }));
        
        onSave(newReservations);
    };
    
    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quoteNumber"># Cotización</Label>
                    <Input id="quoteNumber" value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="ej. COT-2024-001" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre del Cliente</Label>
                    <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="is-paid" checked={isPaid} onCheckedChange={(checked) => setIsPaid(Boolean(checked))} />
                    <Label htmlFor="is-paid">Ya está pago</Label>
                </div>
                 {!isPaid && (
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Fecha Vencimiento</Label>
                    <Input id="expirationDate" type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} required={!isPaid} />
                </div>
                )}
            </div>

            <Separator />

             <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                <h3 className="font-medium text-lg">Añadir Producto a la Cotización</h3>
                <div className="space-y-2">
                    <Label>Origen del Producto</Label>
                    <RadioGroup value={reservationSource} onValueChange={(value) => {
                        setReservationSource(value as 'Contenedor' | 'Bodega' | 'Zona Franca');
                        setProductName('');
                        setSelectedContainerId('');
                    }} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Bodega" id="source-warehouse" />
                            <Label htmlFor="source-warehouse">Bodega</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Zona Franca" id="source-free-zone" />
                            <Label htmlFor="source-free-zone">Zona Franca</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Contenedor" id="source-container" />
                            <Label htmlFor="source-container">Contenedor en Tránsito</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                {reservationSource === 'Contenedor' && (
                    <div className="space-y-2">
                        <Label>Contenedor</Label>
                        <Combobox
                            options={containerOptions}
                            value={selectedContainerId}
                            onValueChange={(value) => {
                                setSelectedContainerId(value);
                                setProductName('');
                            }}
                            placeholder="Seleccione un contenedor"
                            searchPlaceholder="Buscar contenedor..."
                            emptyPlaceholder="No hay contenedores en tránsito"
                        />
                    </div>
                )}

                 <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={productName}
                            onValueChange={setProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontraron productos"
                            disabled={reservationSource === 'Contenedor' && !selectedContainerId}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" required />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="button" onClick={handleAddToList}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Agregar a la lista
                    </Button>
                </div>
            </div>

            <div>
                <h3 className="font-medium text-lg mb-2">Lista de Productos para Reservar</h3>
                 <div className="space-y-2">
                    {reservationItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-md border bg-background">
                            <div>
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.quantity} unidades desde {item.sourceId}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromList(item.id)} className="h-7 w-7">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {reservationItems.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No hay productos en la lista.</p>}
                 </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={reservationItems.length === 0}>
                   Crear {reservationItems.length > 0 ? `${reservationItems.length}` : ''} Reserva(s)
                </Button>
            </div>
        </div>
    );
}

