
'use client';
import React, { useState, useMemo, useContext } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Customer, initialCustomerData } from '@/lib/customers';

interface CustomerSelectorProps {
  onCustomerSelect: (customer: Customer | null) => void;
  onNameChange: (name: string) => void;
}

export function CustomerSelector({ onCustomerSelect, onNameChange }: CustomerSelectorProps) {
  const [customerType, setCustomerType] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [newCustomerName, setNewCustomerName] = useState('');

  const customerOptions = useMemo(() => {
    return initialCustomerData.map(c => {
      const identifiers = [c.email, c.phone, c.taxId].filter(Boolean).join(' / ');
      return {
        value: c.id.toString(),
        label: `${c.name} (${identifiers})`
      };
    });
  }, []);

  const handleCustomerTypeChange = (type: 'existing' | 'new') => {
    setCustomerType(type);
    setSelectedCustomerId(undefined);
    setNewCustomerName('');
    onCustomerSelect(null);
    onNameChange('');
  };

  const handleExistingCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = initialCustomerData.find(c => c.id.toString() === customerId);
    if (customer) {
        onCustomerSelect(customer);
        onNameChange(customer.name);
    }
  };
  
  const handleNewCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomerName(e.target.value);
    onNameChange(e.target.value);
    onCustomerSelect(null);
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
        <RadioGroup value={customerType} onValueChange={(v) => handleCustomerTypeChange(v as 'existing' | 'new')} className="flex gap-6">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="type-existing" />
                <Label htmlFor="type-existing">Cliente Existente</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="type-new" />
                <Label htmlFor="type-new">Cliente Nuevo</Label>
            </div>
        </RadioGroup>
        
        {customerType === 'existing' ? (
            <div className="space-y-2">
                <Label>Seleccionar Cliente</Label>
                <Combobox
                    options={customerOptions}
                    value={selectedCustomerId}
                    onValueChange={handleExistingCustomerChange}
                    placeholder="Busque y seleccione un cliente..."
                    searchPlaceholder="Buscar por nombre, correo, tel..."
                    emptyPlaceholder="No se encontró el cliente."
                />
            </div>
        ) : (
             <div className="space-y-2">
                <Label htmlFor="customer-name">Nombre del Nuevo Cliente</Label>
                <Input
                    id="customer-name"
                    value={newCustomerName}
                    onChange={handleNewCustomerNameChange}
                    placeholder="Ingrese el nombre del cliente..."
                />
            </div>
        )}
    </div>
  );
}
