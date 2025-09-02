
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { Partner } from '@/lib/partners';
import { Switch } from './ui/switch';
import { Combobox } from './ui/combobox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { LocationCombobox } from './location-combobox';
import { FileUp, Trash2, PlusCircle } from 'lucide-react';

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
  const [phones, setPhones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');
  const [type, setType] = useState<'Partner' | 'Distribuidor'>('Distribuidor');
  const [notes, setNotes] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [existingContract, setExistingContract] = useState<string | undefined>('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (partner) {
      setName(partner.name);
      setTaxId(partner.taxId);
      setContactName(partner.contactName);
      setPhones(partner.phone.length > 0 ? partner.phone : ['']);
      setEmails(partner.email.length > 0 ? partner.email : ['']);
      setAddress(partner.address);
      setCity(partner.city);
      setCountry(partner.country);
      setStatus(partner.status);
      setType(partner.type);
      setNotes(partner.notes || '');
      setDiscountPercentage(partner.discountPercentage || '');
      setStartDate(partner.startDate || '');
      setExistingContract(partner.contractNotes);
      if (partner.address) {
        setLocation({ address: partner.address, lat: 0, lng: 0});
      }
    } else {
      setName('');
      setTaxId('');
      setContactName('');
      setPhones(['']);
      setEmails(['']);
      setAddress('');
      setCity('');
      setCountry('Colombia');
      setStatus('Activo');
      setType('Distribuidor');
      setNotes('');
      setDiscountPercentage('');
      setStartDate('');
      setContractFile(null);
      setExistingContract('');
      setLocation(null);
    }
    setError(null);
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactName || !taxId || phones.some(p => !p) || emails.some(em => !em)) {
      setError('Nombre, Contacto, NIT/Cédula, y al menos un teléfono y correo son requeridos.');
      return;
    }
    setError(null);
    onSave({ 
        name, 
        taxId, 
        contactName, 
        phone: phones.filter(p => p), 
        email: emails.filter(em => em), 
        address: location?.address || address, 
        city: location ? location.address.split(',').slice(-2, -1)[0]?.trim() || city : city, 
        country, 
        status, 
        type, 
        notes,
        discountPercentage: Number(discountPercentage) || undefined,
        startDate,
        contractNotes: contractFile ? contractFile.name : existingContract
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
      setExistingContract(e.target.files[0].name);
    }
  };

  const handleContactChange = (index: number, value: string, type: 'phone' | 'email') => {
      if (type === 'phone') {
          const newPhones = [...phones];
          newPhones[index] = value;
          setPhones(newPhones);
      } else {
          const newEmails = [...emails];
          newEmails[index] = value;
          setEmails(newEmails);
      }
  };

  const addContactField = (type: 'phone' | 'email') => {
      if (type === 'phone') {
          setPhones([...phones, '']);
      } else {
          setEmails([...emails, '']);
      }
  };

  const removeContactField = (index: number, type: 'phone' | 'email') => {
      if (type === 'phone') {
          if (phones.length > 1) {
              setPhones(phones.filter((_, i) => i !== index));
          }
      } else {
           if (emails.length > 1) {
              setEmails(emails.filter((_, i) => i !== index));
           }
      }
  };

  const handleRemoveFile = () => {
    setContractFile(null);
    setExistingContract('');
    if(fileInputRef.current) fileInputRef.current.value = '';
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
        <div className="space-y-2 col-span-2">
            <Label htmlFor="contactName">Nombre del Contacto Principal</Label>
            <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        </div>
      </div>
      
       <div className="space-y-2">
            <Label>Teléfonos</Label>
            {phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input type="tel" value={phone} onChange={(e) => handleContactChange(index, e.target.value, 'phone')} />
                    {index === phones.length - 1 ? (
                        <Button type="button" size="icon" onClick={() => addContactField('phone')}><PlusCircle className="h-4 w-4" /></Button>
                    ) : (
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeContactField(index, 'phone')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                </div>
            ))}
        </div>
        <div className="space-y-2">
            <Label>Correos Electrónicos</Label>
            {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input type="email" value={email} onChange={(e) => handleContactChange(index, e.target.value, 'email')} />
                    {index === emails.length - 1 ? (
                        <Button type="button" size="icon" onClick={() => addContactField('email')}><PlusCircle className="h-4 w-4" /></Button>
                    ) : (
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeContactField(index, 'email')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                </div>
            ))}
        </div>
        
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
       
       <div className="space-y-2">
            <Label htmlFor="location">Dirección / Ciudad</Label>
             <LocationCombobox
                value={location}
                onChange={handleLocationChange}
                city={city}
            />
       </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Entrada</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="discountPercentage">Porcentaje de Descuento (%)</Label>
                <Input 
                    id="discountPercentage" 
                    type="number"
                    value={discountPercentage} 
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="Ej: 10"
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Contrato (PDF)</Label>
            <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange} 
            />
            {existingContract ? (
                <div className="flex items-center justify-between rounded-md border p-2">
                    <span className="text-sm truncate">{existingContract}</span>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Subir Archivo de Contrato (PDF)
                </Button>
            )}
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
