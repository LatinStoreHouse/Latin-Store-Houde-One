
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { Partner } from '@/lib/partners';
import { Switch } from './ui/switch';
import { Combobox } from './ui/combobox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { LocationCombobox } from './location-combobox';

interface PartnerFormProps {
  partner?: Partner;
  onSave: (partner: Omit<Partner, 'id'>) => void;
  onCancel: () => void;
}

const countryOptions = [
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Panamá', label: 'Panamá' },
  { value: 'Perú', label: 'Perú' },
].map(c => ({ value: c.label, label: c.label }));


export function DistributorForm({ partner, onSave, onCancel }: PartnerFormProps) {
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');
  const [type, setType] = useState<'Partner' | 'Distribuidor'>('Distribuidor');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; } | null>(null);

  useEffect(() => {
    if (partner) {
      setName(partner.name);
      setTaxId(partner.taxId);
      setContactName(partner.contactName);
      setPhone(partner.phone);
      setEmail(partner.email);
      setAddress(partner.address);
      setCity(partner.city);
      setCountry(partner.country);
      setStatus(partner.status);
      setType(partner.type);
      setNotes(partner.notes || '');
      if (partner.address) {
        setLocation({ address: partner.address, lat: 0, lng: 0});
      }
    } else {
      // Reset form for new
      setName('');
      setTaxId('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setCountry('Colombia');
      setStatus('Activo');
      setType('Distribuidor');
      setNotes('');
      setLocation(null);
    }
    setError(null);
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactName || !phone || !email || !taxId) {
      setError('Nombre, Contacto, Teléfono, Email y NIT/Cédula son campos requeridos.');
      return;
    }
    setError(null);
    onSave({ 
        name, 
        taxId, 
        contactName, 
        phone, 
        email, 
        address: location?.address || address, 
        city: location ? location.address.split(',').slice(-2, -1)[0]?.trim() || city : city, 
        country, 
        status, 
        type, 
        notes 
    });
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number; address: string } | null) => {
    setLocation(newLocation);
    if (newLocation) {
        setAddress(newLocation.address);
        const cityPart = newLocation.address.split(',').slice(-2, -1)[0]?.trim();
        const countryPart = newLocation.address.split(',').pop()?.trim();
        setCity(cityPart || '');
        if (countryPart) {
          const matchingCountry = countryOptions.find(c => c.label.toLowerCase() === countryPart.toLowerCase());
          if (matchingCountry) {
            setCountry(matchingCountry.value);
          }
        }
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
       <div className="space-y-2">
            <Label>Tipo de Socio</Label>
             <RadioGroup value={type} onValueChange={(value) => setType(value as 'Partner' | 'Distribuidor')} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Distribuidor" id="type-dist" />
                  <Label htmlFor="type-dist">Distribuidor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Partner" id="type-part" />
                  <Label htmlFor="type-part">Partner</Label>
                </div>
              </RadioGroup>
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="name">Nombre del Socio</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="taxId">NIT / Cédula</Label>
            <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} required />
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
       
       <div className="space-y-2">
            <Label htmlFor="location">Dirección / Ciudad</Label>
             <LocationCombobox
                value={location}
                onChange={handleLocationChange}
                city={city}
            />
       </div>

       <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añadir una nota sobre el socio..."
                rows={3}
            />
        </div>
        <div className="flex items-center space-x-2">
            <Switch
                id="status"
                checked={status === 'Activo'}
                onCheckedChange={(checked) => setStatus(checked ? 'Activo' : 'Inactivo')}
            />
            <Label htmlFor="status">Socio {status}</Label>
        </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{partner ? 'Guardar Cambios' : 'Crear Socio'}</Button>
      </div>
    </form>
  );
}
