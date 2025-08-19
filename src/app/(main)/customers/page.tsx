'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Instagram, Mail, Trash2, Edit, UserPlus, MessageSquare, ChevronDown, ListFilter, X, Truck, BookUser, Calendar as CalendarIcon, MapPin, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CustomerForm } from '@/components/customer-form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { initialCustomerData, Customer, CustomerStatus, statusColors, customerSources, customerStatuses } from '@/lib/customers';
import { Role, roles } from '@/lib/roles';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { currentUser } from '@/app/(main)/layout';


const sourceIcons: { [key: string]: React.ElementType } = {
  Instagram: Instagram,
  Email: Mail,
  WhatsApp: () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>,
  'Sitio Web': () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  'Referido': UserPlus
};

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [advisorFilter, setAdvisorFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const currentUserRole = currentUser.roles[0];

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        const searchMatch =
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.city.toLowerCase().includes(searchTerm.toLowerCase());

        const sourceMatch = sourceFilter.length === 0 || sourceFilter.includes(customer.source);
        const advisorMatch = advisorFilter.length === 0 || advisorFilter.includes(customer.assignedTo);
        const statusMatch = statusFilter.length === 0 || statusFilter.includes(customer.status);

        const itemDate = new Date(customer.registrationDate);
        const fromDate = date?.from ? new Date(date.from) : null;
        const toDate = date?.to ? new Date(date.to) : null;

        if(fromDate) fromDate.setHours(0,0,0,0);
        if(toDate) toDate.setHours(23,59,59,999);
        
        const dateMatch =
            !date ||
            (!fromDate && !toDate) ||
            (fromDate && !toDate && itemDate >= fromDate) ||
            (!fromDate && toDate && itemDate <= toDate) ||
            (fromDate && toDate && itemDate >= fromDate && itemDate <= toDate);

        return searchMatch && sourceMatch && advisorMatch && statusMatch && dateMatch;
    });
  }, [customers, searchTerm, sourceFilter, advisorFilter, statusFilter, date]);
  
  const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];
  const canCreateCampaign = userPermissions.includes('marketing:create');
  const canCreateDispatch = userPermissions.includes('orders:create');
  const canCreateReservation = userPermissions.includes('reservations:create');
  const canUseCalculators = userPermissions.includes('calculators:use');
  
  const handleOpenModal = (customer?: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'registrationDate'>) => {
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
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, ...customerData } as Customer : c));
      toast({ title: 'Cliente Actualizado', description: 'Los datos del cliente se han actualizado.' });
    } else {
      // Add
      const newCustomer: Customer = { 
          ...customerData, 
          id: Date.now(), 
          address: customerData.address || '',
          registrationDate: new Date().toISOString().split('T')[0]
        };
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

  const handleBulkAction = () => {
    if (selectedCustomers.length > 0) {
      const customerIds = selectedCustomers.join(',');
      router.push(`/marketing/campaigns/create?customer_ids=${customerIds}`);
    }
  };

  const handleCreateDispatch = (customer: Customer) => {
    const params = new URLSearchParams();
    params.set('action', 'create');
    params.set('cliente', customer.name);
    params.set('vendedor', customer.assignedTo);
    if(customer.address) params.set('direccion', customer.address);
    router.push(`/orders?${params.toString()}`);
  }

  const handleCreateReservation = (customer: Customer) => {
    const params = new URLSearchParams();
    params.set('action', 'create');
    params.set('cliente', customer.name);
    params.set('asesor', customer.assignedTo);
    router.push(`/reservations?${params.toString()}`);
  }
  
  const handleCreateQuote = (customer: Customer, type: 'stoneflex' | 'starwood') => {
    const params = new URLSearchParams();
    params.set('customerName', customer.name);
    const url = type === 'stoneflex' ? '/stoneflex-clay-calculator' : '/starwood-calculator';
    router.push(`${url}?${params.toString()}`);
  };

  const toggleFilter = (filterSetter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    filterSetter(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSourceFilter([]);
    setAdvisorFilter([]);
    setStatusFilter([]);
    setDate(undefined);
  }

  const areFiltersActive = sourceFilter.length > 0 || advisorFilter.length > 0 || statusFilter.length > 0 || date !== undefined;

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Clientes</CardTitle>
            <CardDescription>
              Busque, vea y gestione a sus clientes.
            </CardDescription>
          </div>
           <Button onClick={() => handleOpenModal()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, tel, email o ubicación..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-full sm:w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Filtrar por fecha</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span>Filtros</span>
                        {areFiltersActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por Fuente</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {customerSources.map(source => (
                        <DropdownMenuCheckboxItem
                            key={source}
                            checked={sourceFilter.includes(source)}
                            onCheckedChange={() => toggleFilter(setSourceFilter, source)}
                        >
                            {source}
                        </DropdownMenuCheckboxItem>
                    ))}
                    
                    <DropdownMenuLabel>Filtrar por Asesor</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {salesAdvisors.map(advisor => (
                        <DropdownMenuCheckboxItem
                            key={advisor}
                            checked={advisorFilter.includes(advisor)}
                            onCheckedChange={() => toggleFilter(setAdvisorFilter, advisor)}
                        >
                            {advisor}
                        </DropdownMenuCheckboxItem>
                    ))}

                    <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {customerStatuses.map(status => (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={statusFilter.includes(status)}
                            onCheckedChange={() => toggleFilter(setStatusFilter, status)}
                        >
                            {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {areFiltersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="h-4 w-4" />
                    Limpiar
                </Button>
            )}
          </div>
        </div>
        <div className="flex justify-start mb-4">
          {canCreateCampaign && selectedCustomers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                      Acciones ({selectedCustomers.length})
                      <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBulkAction} disabled={selectedCustomers.length === 0}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Enviar Mensaje/Campaña
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 w-10">
                <Checkbox
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
                    aria-label="Seleccionar todo"
                />
              </TableHead>
              <TableHead className="p-2">Cliente</TableHead>
              <TableHead className="p-2">Fuente</TableHead>
              <TableHead className="p-2">Asesor Asignado</TableHead>
              <TableHead className="p-2">Fecha Reg.</TableHead>
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
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {customer.city}
                  </div>
                </TableCell>
                <TableCell className="p-2">
                  <Badge variant="outline" className="flex w-fit items-center gap-2">
                    {React.createElement(sourceIcons[customer.source as keyof typeof sourceIcons] || 'div')}
                    {customer.source}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">{customer.assignedTo}</TableCell>
                <TableCell className="p-2">{customer.registrationDate}</TableCell>
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
                       {canCreateDispatch && (
                        <DropdownMenuItem onClick={() => handleCreateDispatch(customer)}>
                          <Truck className="mr-2 h-4 w-4" />
                          Crear Despacho
                        </DropdownMenuItem>
                      )}
                      {canCreateReservation && (
                        <DropdownMenuItem onClick={() => handleCreateReservation(customer)}>
                            <BookUser className="mr-2 h-4 w-4" />
                            Crear Reserva
                        </DropdownMenuItem>
                      )}
                       {canUseCalculators && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Calculator className="mr-2 h-4 w-4" />
                            Crear Cotización
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleCreateQuote(customer, 'stoneflex')}>
                              Cotización StoneFlex
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateQuote(customer, 'starwood')}>
                              Cotización Starwood
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
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
    </>
  );
}
