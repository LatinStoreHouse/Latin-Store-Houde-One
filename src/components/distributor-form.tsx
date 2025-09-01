
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { Distributor } from '@/lib/distributors';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DistributorFormProps {
  distributor?: Distributor;
  onSave: (distributor: Omit<Distributor, 'id'>) => void;
  onCancel: () => void;
}

const countryOptions = [
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Panamá', label: 'Panamá' },
  { value: 'Perú', label: 'Perú' },
];

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", 
  "Bucaramanga", "Pereira", "Manizales", "Pasto", "Neiva"
].map(city => ({ value: city, label: city }));

export function DistributorForm({ distributor, onSave, onCancel }: DistributorFormProps) {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (distributor) {
      setName(distributor.name);
      setContactName(distributor.contactName);
      setPhone(distributor.phone);
      setEmail(distributor.email);
      setAddress(distributor.address);
      setCity(distributor.city);
      setCountry(distributor.country);
      setStatus(distributor.status);
      setNotes(distributor.notes || '');
    } else {
      // Reset form for new
      setName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setCountry('Colombia');
      setStatus('Activo');
      setNotes('');
    }
    setError(null);
  }, [distributor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactName || !phone || !email) {
      setError('Nombre, Contacto, Teléfono y Email son campos requeridos.');
      return;
    }
    setError(null);
    onSave({ name, contactName, phone, email, address, city, country, status, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Nombre del Distribuidor</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="contactName">Nombre del Contacto</Label>
            <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-2 col-span-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      {error && <p className="text-sm text-destructive -mt-2 text-center">{error}</p>}
       <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un país" />
                    </SelectTrigger>
                    <SelectContent>
                        {countryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                 <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione una ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                        {colombianCities.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>
       </div>
       <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añadir una nota sobre el distribuidor..."
                rows={3}
            />
        </div>
        <div className="flex items-center space-x-2">
            <Switch
                id="status"
                checked={status === 'Activo'}
                onCheckedChange={(checked) => setStatus(checked ? 'Activo' : 'Inactivo')}
            />
            <Label htmlFor="status">Distribuidor {status}</Label>
        </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{distributor ? 'Guardar Cambios' : 'Crear Distribuidor'}</Button>
      </div>
    </form>
  );
}
