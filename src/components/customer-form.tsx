

'use client';
import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, CustomerStatus, customerSources, customerStatuses } from '@/lib/customers';
import { Textarea } from './ui/textarea';
import { User } from '@/lib/roles';
import { LocationCombobox } from './location-combobox';
import { InventoryContext } from '@/context/inventory-context';


interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Omit<Customer, 'id' | 'registrationDate'> & { registrationDate?: string }) => void;
  onCancel: () => void;
  currentUser: User;
}

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones', 'Admin Latin', 'Laura Diaz'];


export function CustomerForm({ customer, onSave, onCancel, currentUser }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState<Customer['source']>('Instagram');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Contactado');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; } | null>(null);


  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email);
      setTaxId(customer.taxId || '');
      setCity(customer.city);
      setAddress(customer.address);
      setSource(customer.source);
      setAssignedTo(customer.assignedTo);
      setStatus(customer.status);
      setNotes(customer.notes || '');
      if (customer.address) {
        setLocation({ address: customer.address, lat: 0, lng: 0}); // We don't have lat/lng, but this keeps the value
      }
    } else {
      // Reset form for new customer
      setName('');
      setPhone('');
      setEmail('');
      setTaxId('');
      setCity('');
      setAddress('');
      setSource('Instagram');
      // Auto-assign to current user if they are a sales advisor
      const isSalesAdvisor = currentUser.roles.includes('Asesor de Ventas') || currentUser.roles.includes('Líder de Asesores');
      setAssignedTo(isSalesAdvisor ? currentUser.name : '');
      setStatus('Contactado');
      setNotes('');
      setLocation(null);
    }
    setError(null);
  }, [customer, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      setError('Debe proporcionar un teléfono o un correo electrónico.');
      return;
    }
    setError(null);
    onSave({ 
      name, 
      phone, 
      email, 
      taxId,
      city: location ? location.address.split(',').slice(-2, -1)[0]?.trim() || city : city,
      address: location ? location.address : address,
      source, 
      assignedTo, 
      status, 
      notes 
    });
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number; address: string } | null) => {
    setLocation(newLocation);
    if (newLocation) {
        setAddress(newLocation.address);
        // Extract city from address if possible (this is a simple example)
        const cityPart = newLocation.address.split(',').slice(-2, -1)[0]?.trim();
        setCity(cityPart || '');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Nombre Completo / Razón Social</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="taxId">NIT / Cédula</Label>
            <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2 col-span-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
       
       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Fuente</Label>
            <Select value={source} onValueChange={(value) => setSource(value as Customer['source'])}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Seleccione una fuente" />
              </SelectTrigger>
              <SelectContent>
                {customerSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Asesor Asignado</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Seleccione un asesor" />
              </SelectTrigger>
              <SelectContent>
                {salesAdvisors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
       </div>
        <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as CustomerStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {customerStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas (Visible para Admin/Marketing)</Label>
            <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añadir una nota sobre el cliente..."
                rows={3}
            />
        </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{customer ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
      </div>
    </form>
  );
}
