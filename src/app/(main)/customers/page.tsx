

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';
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
import { MoreHorizontal, Search, Instagram, Mail, Trash2, Edit, UserPlus, MessageSquare, ChevronDown, ListFilter, X, Truck, BookUser, Calendar as CalendarIcon, MapPin, Calculator, StickyNote, BarChart, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import { useUser } from '@/app/(main)/layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MonthPicker } from '@/components/month-picker';
import { ResponsiveContainer, Pie, Cell, Tooltip as RechartsTooltip, Legend, PieChart } from 'recharts';
import { Separator } from '@/components/ui/separator';


const sourceIcons: { [key: string]: React.ElementType | React.ReactNode } = {
  Instagram: Instagram,
  Email: Mail,
  WhatsApp: <Image src="/imagenes/logos/Logo Whatsapp.svg" alt="WhatsApp" width={16} height={16} />,
  'Sitio Web': () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  'Referido': UserPlus
};

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones'];

const PIE_COLORS = ['#29ABE2', '#00BCD4', '#f44336', '#E2E229', '#E29ABE', '#FFC107', '#4CAF50'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsDate, setStatsDate] = useState(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [advisorFilter, setAdvisorFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const { currentUser } = useUser();
  const currentUserRole = currentUser.roles[0];
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
  const canEditCustomers = userPermissions.includes('customers:edit');
  const canEditNotes = userPermissions.includes('customers:edit') || userPermissions.includes('marketing:view');
  const isAdvisor = currentUserRole === 'Asesor de Ventas';
  
  const advisorStats = useMemo(() => {
    if (!isAdvisor) return null;
    
    // Stats for the selected month
    const year = statsDate.getFullYear();
    const month = statsDate.getMonth();
    const newCustomersThisMonth = customers.filter(c => {
        const regDate = new Date(c.registrationDate);
        return c.assignedTo === currentUser.name && regDate.getFullYear() === year && regDate.getMonth() === month;
    });

    // Stats for all time for the pie chart
    const allAdvisorCustomers = customers.filter(c => c.assignedTo === currentUser.name);
    const statusDistribution = allAdvisorCustomers.reduce((acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        newCustomersCount: newCustomersThisMonth.length,
        newCustomersList: newCustomersThisMonth,
        statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
    }

  }, [isAdvisor, statsDate, customers, currentUser.name]);
  
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
  
  const handleDownloadStats = () => {
    if (!advisorStats) return;
    const doc = new jsPDF();
    const monthName = statsDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    
    doc.setFontSize(18);
    doc.text(`Reporte de Asesor - ${currentUser.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Mes: ${monthName}`, 14, 30);

    doc.setFontSize(12);
    doc.text(`Nuevos Clientes en ${monthName}: ${advisorStats.newCustomersCount}`, 14, 45);

    doc.autoTable({
        startY: 50,
        head: [['Nombre', 'Email', 'Teléfono', 'Fuente']],
        body: advisorStats.newCustomersList.map(c => [c.name, c.email, c.phone, c.source]),
    });
    
    doc.save(`Reporte_${currentUser.name}_${format(statsDate, 'yyyy-MM')}.pdf`);
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
          <div className="flex gap-2">
            {isAdvisor && (
                <Button variant="outline" onClick={() => setIsStatsModalOpen(true)}>
                    <BarChart className="mr-2 h-4 w-4" />
                    Mis Estadísticas
                </Button>
            )}
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
              <TableHead className="p-2">Fuente</TableHead>
              <TableHead className="p-2">Asesor Asignado</TableHead>
              <TableHead className="p-2">Fecha Reg.</TableHead>
              <TableHead className="p-2">Estado</TableHead>
              {canEditCustomers && <TableHead className="text-right p-2">Acciones</TableHead>}
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{customer.name}</span>
                    {canEditNotes && customer.notes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <StickyNote className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{customer.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {customer.city}
                  </div>
                </TableCell>
                <TableCell className="p-2">
                  <Badge variant="outline" className="flex w-fit items-center gap-2">
                    {typeof sourceIcons[customer.source] === 'function' ? React.createElement(sourceIcons[customer.source] as React.ElementType) : sourceIcons[customer.source]}
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
                {canEditCustomers && (
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
                )}
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
                canEditNotes={canEditNotes}
                currentUser={currentUser}
            />
        </DialogContent>
    </Dialog>
    
    {isAdvisor && advisorStats && (
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Estadísticas de {currentUser.name}</DialogTitle>
                    <DialogDescription>
                        Revise su rendimiento de captación de clientes y el estado general de su cartera.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Rendimiento Mensual</CardTitle>
                                <div className="flex items-center justify-between">
                                 <p className="text-sm text-muted-foreground">Nuevos clientes en el mes seleccionado.</p>
                                 <MonthPicker date={statsDate} onDateChange={setStatsDate} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{advisorStats.newCustomersCount}</p>
                                <p className="text-muted-foreground">Nuevos clientes en {statsDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</p>
                                <Separator className="my-4" />
                                <h4 className="font-semibold mb-2">Clientes Captados este Mes:</h4>
                                {advisorStats.newCustomersList.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Fuente</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {advisorStats.newCustomersList.map(c => (
                                                <TableRow key={c.id}>
                                                    <TableCell>{c.name}</TableCell>
                                                    <TableCell>{c.source}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">No hay nuevos clientes este mes.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4">
                       <Card>
                         <CardHeader>
                            <CardTitle className="text-lg">Estado General de Clientes</CardTitle>
                             <CardDescription>Distribución de todos sus clientes por estado.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={advisorStats.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {advisorStats.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                         </CardContent>
                       </Card>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleDownloadStats}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Reporte del Mes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}
    

    
