
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import type { DispatchData, DispatchProduct } from '@/app/(main)/orders/page';
import { initialCustomerData } from '@/lib/customers';
import { useUser } from '@/app/(main)/layout';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InventoryContext } from '@/context/inventory-context';

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", 
  "Soacha", "Soledad", "Bucaramanga", "Ibagué", "Santa Marta", "Villavicencio", 
  "Pereira", "Manizales", "Pasto", "Neiva", "Armenia", "Popayán", "Sincelejo", 
  "Montería", "Valledupar", "Tunja", "Riohacha", "Florencia", "Yopal", 
  "Quibdó", "Arauca", "San Andrés", "Mocoa", "Leticia", "Inírida", 
  "San José del Guaviare", "Puerto Carreño", "Mitú"
].map(city => ({ value: city, label: city }));

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones', 'Admin Latin'];


interface DispatchFormProps {
    dispatch?: DispatchData | null;
    onSave: (dispatch: DispatchData) => void;
    onCancel: () => void;
}

export function DispatchForm({ dispatch, onSave, onCancel }: DispatchFormProps) {
    const { inventoryData } = useContext(InventoryContext)!;
    const { currentUser } = useUser();
    const { toast } = useToast();
    
    const [formData, setFormData] = useState<Omit<DispatchData, 'id'>>({
        vendedor: currentUser.name,
        fechaSolicitud: new Date().toISOString().split('T')[0],
        cotizacion: '',
        cliente: '',
        ciudad: '',
        direccion: '',
        remision: '',
        observacion: '',
        rutero: 'none',
        fechaDespacho: '',
        guia: '',
        convencion: 'Prealistamiento de pedido',
        products: []
    });
    
    // Product form state
    const [productName, setProductName] = useState('');
    const [productQuantity, setProductQuantity] = useState<number | string>(1);


    useEffect(() => {
        if (dispatch) {
            setFormData(dispatch);
        }
    }, [dispatch]);
    
    const productOptions = useMemo(() => {
        const options: { value: string; label: string }[] = [];
        for (const brand in inventoryData) {
            for (const line in inventoryData[brand]) {
                 for (const name in inventoryData[brand][line]) {
                    options.push({ value: name, label: name });
                 }
            }
        }
        return options;
    }, [inventoryData]);

    const handleInputChange = (field: keyof Omit<DispatchData, 'id' | 'products'>, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleAddProduct = () => {
        if (!productName || Number(productQuantity) <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y cantidad válida.'});
            return;
        }

        setFormData(prev => {
            const existingProductIndex = prev.products.findIndex(p => p.name === productName);
            const newProducts = [...prev.products];
            
            if (existingProductIndex > -1) {
                newProducts[existingProductIndex].quantity += Number(productQuantity);
            } else {
                newProducts.push({ name: productName, quantity: Number(productQuantity) });
            }
            
            return {...prev, products: newProducts};
        });
        
        setProductName('');
        setProductQuantity(1);
    };
    
    const handleRemoveProduct = (name: string) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter(p => p.name !== name)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.products.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un producto al despacho.'});
            return;
        }
        onSave({
            id: dispatch?.id || Date.now(),
            ...formData
        });
    };
    
    const customerOptions = useMemo(() => initialCustomerData.map(c => ({ value: c.name, label: c.name })), []);
    
    const handleCustomerChange = (customerName: string) => {
        const customer = initialCustomerData.find(c => c.name === customerName);
        setFormData(prev => ({
            ...prev,
            cliente: customerName,
            ciudad: customer?.city || '',
            direccion: customer?.address || '',
        }));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[80vh] overflow-y-auto pr-4 pl-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Combobox
                        options={customerOptions}
                        value={formData.cliente}
                        onValueChange={handleCustomerChange}
                        placeholder="Seleccione un cliente"
                        searchPlaceholder="Buscar cliente..."
                        emptyPlaceholder="Cliente no encontrado"
                        allowFreeText
                    />
                </div>
                 <div className="space-y-2">
                    <Label># Cotización (si aplica)</Label>
                    <Input value={formData.cotizacion} onChange={e => handleInputChange('cotizacion', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label>Vendedor</Label>
                    <Input value={formData.vendedor} disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Fecha de Solicitud</Label>
                    <Input type="date" value={formData.fechaSolicitud} onChange={e => handleInputChange('fechaSolicitud', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Combobox
                        options={colombianCities}
                        value={formData.ciudad}
                        onValueChange={(value) => handleInputChange('ciudad', value)}
                        placeholder="Seleccione una ciudad"
                        searchPlaceholder="Buscar ciudad..."
                        emptyPlaceholder="No se encontró ciudad"
                        allowFreeText
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input value={formData.direccion} onChange={e => handleInputChange('direccion', e.target.value)} />
                </div>
            </div>
            
            <Separator />

            <div>
                <h4 className="font-medium mb-2">Productos a Despachar</h4>
                <div className="p-4 border rounded-md space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2 items-end">
                        <div className="space-y-1">
                            <Label>Producto</Label>
                            <Combobox 
                                options={productOptions}
                                value={productName}
                                onValueChange={setProductName}
                                placeholder="Seleccione un producto"
                                searchPlaceholder="Buscar producto..."
                                emptyPlaceholder="No hay productos"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Cantidad</Label>
                            <Input type="number" value={productQuantity} onChange={e => setProductQuantity(Number(e.target.value))} min="1" />
                        </div>
                        <Button type="button" onClick={handleAddProduct} disabled={!productName}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {formData.products.map(p => (
                            <div key={p.name} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                <span>{p.name}</span>
                                <div className="flex items-center gap-4">
                                    <span>Cantidad: <span className="font-semibold">{p.quantity}</span></span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveProduct(p.name)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {formData.products.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No hay productos en la lista.</p>}
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={formData.observacion} onChange={e => handleInputChange('observacion', e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
                </Button>
                <Button type="submit">Guardar Despacho</Button>
            </div>
        </form>
    )
}
