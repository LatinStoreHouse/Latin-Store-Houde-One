'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, CustomerStatus, customerSources, customerStatuses } from '@/lib/customers';


interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Omit<Customer, 'id' | 'status'> & { status: CustomerStatus }) => void;
  onCancel: () => void;
}

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones'];

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<Customer['source']>('Instagram');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Contactado');
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email);
      setSource(customer.source);
      setAssignedTo(customer.assignedTo);
      setStatus(customer.status);
    } else {
      // Reset form for new customer
      setName('');
      setPhone('');
      setEmail('');
      setSource('Instagram');
      setAssignedTo('');
      setStatus('Contactado');
    }
    setError(null);
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      setError('Debe proporcionar un teléfono o un correo electrónico.');
      return;
    }
    setError(null);
    onSave({ name, phone, email, source, assignedTo, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive -mt-2 text-center">{error}</p>}
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
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{customer ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
      </div>
    </form>
  );
}
