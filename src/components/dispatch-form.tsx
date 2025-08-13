'use client';

import { useForm } from 'react-hook-form';
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
import { useEffect } from 'react';
import { Combobox } from './ui/combobox';

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", 
  "Soacha", "Soledad", "Bucaramanga", "Ibagué", "Santa Marta", "Villavicencio", 
  "Pereira", "Manizales", "Pasto", "Neiva", "Armenia", "Popayán", "Sincelejo", 
  "Montería", "Valledupar", "Tunja", "Riohacha", "Florencia", "Yopal", 
  "Quibdó", "Arauca", "San Andrés", "Mocoa", "Leticia", "Inírida", 
  "San José del Guaviare", "Puerto Carreño", "Mitú"
].map(city => ({ value: city, label: city }));

const dispatchFormSchema = z.object({
  id: z.number().optional(),
  cotizacion: z.string().min(1, 'La cotización es requerida.'),
  cliente: z.string().min(1, 'El cliente es requerido.'),
  ciudad: z.string().min(1, 'La ciudad es requerida.'),
  direccion: z.string().min(1, 'La dirección es requerida.'),
});

export type DispatchFormValues = z.infer<typeof dispatchFormSchema>;

interface DispatchFormProps {
  initialData?: DispatchFormValues;
  onSave: (data: DispatchFormValues) => void;
  onCancel: () => void;
}

export function DispatchForm({ initialData, onSave, onCancel }: DispatchFormProps) {
  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: initialData || {
      cotizacion: '',
      cliente: '',
      ciudad: '',
      direccion: '',
    },
  });
  
  useEffect(() => {
    if (initialData) {
        form.reset(initialData);
    }
  }, [initialData, form]);

  function onSubmit(data: DispatchFormValues) {
    onSave(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{initialData ? 'Guardar Cambios' : 'Crear Despacho'}</Button>
        </div>
      </form>
    </Form>
  );
}
