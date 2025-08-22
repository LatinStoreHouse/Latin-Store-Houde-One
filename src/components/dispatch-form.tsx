'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useContext } from 'react';
import { Combobox } from './ui/combobox';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { InventoryContext } from '@/context/inventory-context';

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", 
  "Soacha", "Soledad", "Bucaramanga", "Ibagué", "Santa Marta", "Villavicencio", 
  "Pereira", "Manizales", "Pasto", "Neiva", "Armenia", "Popayán", "Sincelejo", 
  "Montería", "Valledupar", "Tunja", "Riohacha", "Florencia", "Yopal", 
  "Quibdó", "Arauca", "San Andrés", "Mocoa", "Leticia", "Inírida", 
  "San José del Guaviare", "Puerto Carreño", "Mitú"
].map(city => ({ value: city, label: city }));

const dispatchProductSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido."),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
});

const dispatchFormSchema = z.object({
  id: z.number().optional(),
  cotizacion: z.string().min(1, 'La cotización es requerida.'),
  cliente: z.string().min(1, 'El cliente es requerido.'),
  vendedor: z.string().optional(),
  ciudad: z.string().min(1, 'La ciudad es requerida.'),
  direccion: z.string().min(1, 'La dirección es requerida.'),
  observacion: z.string().optional(),
  products: z.array(dispatchProductSchema).min(1, "Debe agregar al menos un producto al despacho."),
});

export type DispatchFormValues = z.infer<typeof dispatchFormSchema>;

interface DispatchFormProps {
  initialData?: Partial<DispatchFormValues>;
  onSave: (data: DispatchFormValues) => void;
  onCancel: () => void;
}

export function DispatchForm({ initialData, onSave, onCancel }: DispatchFormProps) {
  const { inventoryData } = useContext(InventoryContext)!;
  const { toast } = useToast();

  const productOptions = useMemo(() => {
    const options: { value: string; label: string, available: number }[] = [];
    for (const brand in inventoryData) {
      for (const subCategory in inventoryData[brand]) {
        for (const productName in inventoryData[brand][subCategory]) {
          const item = inventoryData[brand][subCategory][productName];
          const availableInBodega = item.bodega - item.separadasBodega;
          if (availableInBodega > 0) {
            options.push({
              value: productName,
              label: `${productName} (Disp: ${availableInBodega})`,
              available: availableInBodega
            });
          }
        }
      }
    }
    return options;
  }, [inventoryData]);

  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      cotizacion: '',
      cliente: '',
      vendedor: '',
      ciudad: '',
      direccion: '',
      observacion: '',
      products: [],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });
  
  useEffect(() => {
    if (initialData) {
        form.reset({
            ...initialData,
            products: initialData.products || [],
        });
    }
  }, [initialData, form]);

  function onSubmit(data: DispatchFormValues) {
    onSave(data);
  }
  
  const handleAddProduct = () => {
    const productName = form.watch('productToAdd.name' as any);
    const quantity = Number(form.watch('productToAdd.quantity' as any));

    if (!productName || !quantity || quantity <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor seleccione un producto y una cantidad válida.' });
        return;
    }

    const productInfo = productOptions.find(p => p.value === productName);
    if (productInfo && quantity > productInfo.available) {
        toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad (${quantity}) excede la disponible en bodega (${productInfo.available}).` });
        return;
    }
    
    // Check if product is already in the list
    const existingProductIndex = fields.findIndex(field => field.name === productName);
    if(existingProductIndex > -1){
        toast({ variant: 'destructive', title: 'Error', description: 'El producto ya está en la lista. Edite la cantidad si es necesario.' });
        return;
    }
    
    append({ name: productName, quantity: quantity });
    form.setValue('productToAdd.name' as any, '');
    form.setValue('productToAdd.quantity' as any, '');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="cotizacion"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Número de Cotización</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: COT-2024-123" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="cliente"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre del Cliente</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Constructora ABC" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="ciudad"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Ciudad</FormLabel>
                <Combobox
                    options={colombianCities}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccione una ciudad"
                    searchPlaceholder="Buscar ciudad..."
                    emptyPlaceholder="No se encontró."
                    allowFreeText
                />
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="direccion"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Dirección de Entrega</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Calle 123 # 45 - 67" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Separator />

        <div>
            <h3 className="text-base font-medium mb-2">Productos del Despacho</h3>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input value={field.name} disabled className="flex-1" />
                        <Input value={field.quantity} disabled className="w-20" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
             {fields.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">Añada productos al despacho.</p>}
            <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                    <FormItem>
                        <FormMessage className="text-center pt-2" />
                    </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-[2fr_1fr_auto] gap-2 items-end pt-2">
             <FormField
                control={form.control}
                name={`productToAdd.name` as any}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <Combobox options={productOptions} onValueChange={field.onChange} value={field.value} placeholder="Seleccionar producto" />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name={`productToAdd.quantity` as any}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <Input type="number" placeholder="0" {...field} />
                </FormItem>
                )}
            />
            <Button type="button" onClick={handleAddProduct}>
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        
        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anotaciones y Datos de Envío (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                    placeholder="Ej: Entregar en portería, contactar antes de llegar..." 
                    {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{initialData?.id ? 'Guardar Cambios' : 'Crear Despacho'}</Button>
        </div>
      </form>
    </Form>
  );
}
