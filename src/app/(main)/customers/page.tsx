'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Instagram, Mail, Trash2, Edit, UserPlus, MessageSquare, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CustomerForm } from '@/components/customer-form';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkMessageForm } from '@/components/bulk-message-form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { initialCustomerData, Customer, CustomerStatus, statusColors } from '@/lib/customers';


const sourceIcons: { [key: string]: React.ElementType } = {
  Instagram: Instagram,
  Email: Mail,
  WhatsApp: () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>,
};


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkMessageModalOpen, setIsBulkMessageModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleOpenModal = (customer?: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleSaveCustomer = (customerData: Omit<Customer, 'id'>) => {
    if (!customerData.phone && !customerData.email) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debe proporcionar al menos un teléfono o un correo electrónico.",
      })
      return;
    }

    if (selectedCustomer) {
      // Edit
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, ...customerData } : c));
      toast({ title: 'Cliente Actualizado', description: 'Los datos del cliente se han actualizado.' });
    } else {
      // Add
      const newCustomer = { ...customerData, id: Date.now() };
      setCustomers([...customers, newCustomer]);
      toast({ title: 'Cliente Agregado', description: 'El nuevo cliente se ha guardado.' });
    }
    setIsModalOpen(false);
  };
  
  const handleDeleteCustomer = (id: number) => {
     setCustomers(customers.filter(c => c.id !== id));
     toast({ title: 'Cliente Eliminado' });
  }
  
  const handleSelectCustomer = (id: number, checked: boolean) => {
    if (checked) {
        setSelectedCustomers([...selectedCustomers, id]);
    } else {
        setSelectedCustomers(selectedCustomers.filter(customerId => customerId !== id));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
        setSelectedCustomers([]);
    }
  }

  const customersForBulkMessage = customers.filter(c => selectedCustomers.includes(c.id));

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Clientes</CardTitle>
        <CardDescription>
          Busque, vea y gestione a sus clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedCustomers.length === 0}>
                    Acciones Masivas
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsBulkMessageModalOpen(true)} disabled={selectedCustomers.length === 0}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Enviar Mensaje/Campaña
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => handleOpenModal()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 w-10">
                <Checkbox
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    aria-label="Seleccionar todo"
                />
              </TableHead>
              <TableHead className="p-2">Cliente</TableHead>
              <TableHead className="p-2">Fuente</TableHead>
              <TableHead className="p-2">Asesor Asignado</TableHead>
              <TableHead className="p-2">Estado</TableHead>
              <TableHead className="text-right p-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} data-state={selectedCustomers.includes(customer.id) ? "selected" : ""}>
                <TableCell className="p-2">
                    <Checkbox 
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, Boolean(checked))}
                        checked={selectedCustomers.includes(customer.id)}
                        aria-label={`Seleccionar ${customer.name}`}
                    />
                </TableCell>
                <TableCell className="p-2">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell className="p-2">
                  <Badge variant="outline" className="flex w-fit items-center gap-2">
                    {React.createElement(sourceIcons[customer.source] || 'div')}
                    {customer.source}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">{customer.assignedTo}</TableCell>
                <TableCell className="p-2">
                  <Badge
                     className={cn("border", statusColors[customer.status])}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleOpenModal(customer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
                <DialogDescription>
                  {selectedCustomer ? 'Actualice los detalles del cliente.' : 'Complete el formulario para crear un nuevo cliente.'}
                </DialogDescription>
            </DialogHeader>
            <CustomerForm
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
                onCancel={() => setIsModalOpen(false)}
            />
        </DialogContent>
    </Dialog>
    
    <Dialog open={isBulkMessageModalOpen} onOpenChange={setIsBulkMessageModalOpen}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Enviar Mensaje Masivo</DialogTitle>
                <DialogDescription>
                  Redacte un mensaje para enviar a los {selectedCustomers.length} clientes seleccionados.
                </DialogDescription>
            </DialogHeader>
            <BulkMessageForm customers={customersForBulkMessage} />
        </DialogContent>
    </Dialog>
    </>
  );
}
