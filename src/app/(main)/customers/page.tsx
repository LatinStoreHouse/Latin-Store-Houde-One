

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import { MoreHorizontal, Search, Instagram, Mail, Trash2, Edit, UserPlus, MessageSquare, ChevronDown, ListFilter, X, Truck, BookUser, Calendar as CalendarIcon, Globe, Calculator, StickyNote, BarChart, Download, DollarSign, Share2, Users, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CustomerForm } from '@/components/customer-form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Customer, CustomerStatus, statusColors, customerStatuses, customerSources } from '@/lib/customers';
import { Role, roles } from '@/lib/roles';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useUser } from '@/app/(main)/layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { initialDistributorData } from '@/lib/distributors';
import { initialPartnerData } from '@/lib/partners';
import { initialCustomerData } from '@/lib/customers';
import Link from 'next/link';


const sourceIcons: { [key: string]: React.ElementType } = {
  Instagram: Instagram,
  Email: Mail,
  WhatsApp: MessageSquare,
  'Sitio Web': Globe,
  'Referido': UserPlus,
  'Oficina': Store
};

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones', 'Admin Latin', 'Laura Diaz'];
const allPartners = [
    ...initialDistributorData.map(d => ({ value: d.name, label: d.name })),
    ...initialPartnerData.map(p => ({ value: p.name, label: p.name })),
];


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [redirectNotes, setRedirectNotes] = useState('');
  const [transferAdvisor, setTransferAdvisor] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [advisorFilter, setAdvisorFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const { currentUser } = useUser();
  const userPermissions = useMemo(() => {
    const permissions = new Set<string>();
    currentUser.roles.forEach(userRole => {
      const roleConfig = roles.find(r => r.name === userRole);
      if (roleConfig) {
        roleConfig.permissions.forEach(p => permissions.add(p));
      }
    });
    return Array.from(permissions);
  }, [currentUser.roles]);

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
  
  const canCreateCampaign = userPermissions.includes('marketing:create');
  const canCreateDispatch = userPermissions.includes('orders:create');
  const canCreateReservation = userPermissions.includes('reservations:create');
  const canUseCalculators = userPermissions.includes('calculators:use');
  const canManagePartners = userPermissions.includes('partners:manage');
  
  const handleOpenModal = (customer?: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleOpenRedirectModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsRedirectModalOpen(true);
  };

  const handleOpenTransferModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsTransferModalOpen(true);
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

  const handleRedirectCustomer = () => {
    if (!selectedCustomer || !selectedPartner) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un socio.' });
      return;
    }
    const partnerName = allPartners.find(d => d.value === selectedPartner)?.label;
    const newNote = `Cliente redireccionado a ${partnerName}. Nota: ${redirectNotes}`;

    setCustomers(customers.map(c => c.id === selectedCustomer.id ? { 
        ...c, 
        status: 'Redireccionado',
        redirectedTo: partnerName,
        notes: c.notes ? `${c.notes}\n---\n${newNote}` : newNote 
    } : c));

    toast({ title: 'Cliente Redireccionado', description: `${selectedCustomer.name} ha sido redireccionado y el estado actualizado.` });
    setIsRedirectModalOpen(false);
    setRedirectNotes('');
    setSelectedPartner('');
  };

  const handleTransferCustomer = () => {
    if (!selectedCustomer || !transferAdvisor) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un asesor.' });
      return;
    }
    
    const newNote = `Cliente transferido de ${selectedCustomer.assignedTo} a ${transferAdvisor} por ${currentUser.name}. Nota: ${transferNotes}`;

    setCustomers(customers.map(c => c.id === selectedCustomer.id ? { 
        ...c, 
        assignedTo: transferAdvisor,
        notes: c.notes ? `${c.notes}\n---\n${newNote}` : newNote 
    } : c));

    toast({ title: 'Cliente Transferido', description: `${selectedCustomer.name} ha sido asignado a ${transferAdvisor}.` });
    setIsTransferModalOpen(false);
    setTransferAdvisor('');
    setTransferNotes('');
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
  
  const advisorOptions = salesAdvisors.map(name => ({ value: name, label: name }));

  const areFiltersActive = sourceFilter.length > 0 || advisorFilter.length > 0 || statusFilter.length > 0 || date !== undefined;

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Clientes</CardTitle>
            <CardDescription>
              Busque, vea y gestione a sus clientes.
            </CardDescription>
          </div>
          <div className="flex gap-2">
           <Button onClick={() => handleOpenModal()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
          </div>
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
              <TableHead className="p-2 text-center">Fuente</TableHead>
              <TableHead className="p-2 text-center">Asesor Asignado</TableHead>
              <TableHead className="p-2 text-center">Fecha Reg.</TableHead>
              <TableHead className="p-2 text-center">Estado</TableHead>
              <TableHead className="text-center p-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => {
              const Icon = sourceIcons[customer.source];
              const isOwner = currentUser.name === customer.assignedTo;
              const isAdmin = currentUser.roles.includes('Administrador');
              const canEditThisCustomer = isOwner || isAdmin;

              return (
              <TableRow key={customer.id} data-state={selectedCustomers.includes(customer.id) ? "selected" : ""}>
                <TableCell className="p-2">
                    <Checkbox 
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, Boolean(checked))}
                        checked={selectedCustomers.includes(customer.id)}
                        aria-label={`Seleccionar ${customer.name}`}
                    />
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex items-center gap-2">
                     <Link href={`/customers/${customer.id}`} className="font-medium hover:underline text-primary">
                        {customer.name}
                    </Link>
                    {customer.notes && (
                      <Tooltip>
                        <TooltipTrigger>
                          <StickyNote className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{customer.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3" />
                    {customer.city}
                  </div>
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Badge variant="outline" className="flex w-fit items-center gap-2 mx-auto">
                    <Icon />
                    {customer.source}
                  </Badge>
                </TableCell>
                <TableCell className="p-2 text-center">{customer.assignedTo}</TableCell>
                <TableCell className="p-2 text-center">{customer.registrationDate}</TableCell>
                <TableCell className="p-2 text-center">
                  {customer.status === 'Redireccionado' && customer.redirectedTo ? (
                    <Tooltip>
                        <TooltipTrigger>
                           <Badge className={cn("border cursor-help", statusColors[customer.status])}>
                                {customer.status}
                           </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p className="max-w-xs">Redirigido a: <strong>{customer.redirectedTo}</strong></p>
                           {customer.notes && <p className="max-w-xs mt-2 text-muted-foreground">{customer.notes}</p>}
                        </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge className={cn("border", statusColors[customer.status])}>
                        {customer.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleOpenModal(customer)} disabled={!canEditThisCustomer}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenTransferModal(customer)} disabled={!canEditThisCustomer}>
                        <Users className="mr-2 h-4 w-4" />
                        Transferir Cliente
                    </DropdownMenuItem>
                    {canManagePartners && (
                        <DropdownMenuItem onClick={() => handleOpenRedirectModal(customer)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Redireccionar a Socio
                        </DropdownMenuItem>
                    )}
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
                    <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-destructive" disabled={!canEditThisCustomer}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
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
                currentUser={currentUser}
            />
        </DialogContent>
    </Dialog>

     <Dialog open={isRedirectModalOpen} onOpenChange={setIsRedirectModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Redireccionar Cliente a Socio Comercial</DialogTitle>
                <DialogDescription>
                  Seleccione un socio y agregue una nota para el cliente <span className="font-semibold">{selectedCustomer?.name}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Socio Comercial (Distribuidor/Partner)</Label>
                    <Combobox
                        options={allPartners}
                        value={selectedPartner}
                        onValueChange={setSelectedPartner}
                        placeholder="Seleccione un socio"
                        searchPlaceholder='Buscar socio...'
                        emptyPlaceholder='No se encontró el socio.'
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nota de Redirección (Opcional)</Label>
                    <Textarea 
                        value={redirectNotes}
                        onChange={(e) => setRedirectNotes(e.target.value)}
                        placeholder="Ej: Cliente interesado en compra al por mayor..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRedirectModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleRedirectCustomer}>Redireccionar Cliente</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

     <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transferir Cliente a otro Asesor</DialogTitle>
                <DialogDescription>
                  Reasigne el cliente <span className="font-semibold">{selectedCustomer?.name}</span> a un nuevo asesor.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Nuevo Asesor Responsable</Label>
                    <Combobox
                        options={advisorOptions.filter(a => a.value !== selectedCustomer?.assignedTo)}
                        value={transferAdvisor}
                        onValueChange={setTransferAdvisor}
                        placeholder="Seleccione un asesor"
                        searchPlaceholder='Buscar asesor...'
                        emptyPlaceholder='No se encontró el asesor.'
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nota de Transferencia (Opcional)</Label>
                    <Textarea 
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        placeholder="Ej: Cliente necesita seguimiento en su cotización..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleTransferCustomer}>Confirmar Transferencia</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    </TooltipProvider>
  );
}
