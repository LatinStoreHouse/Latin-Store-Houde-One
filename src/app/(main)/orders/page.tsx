

'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, Search, ChevronDown, Trash2, Copy, Edit, Calendar as CalendarIcon, PackageOpen, Warehouse, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useUser } from '@/context/user-context';
import { initialCustomerData } from '@/lib/customers';
import { DispatchForm } from '@/components/dispatch-form';
import { useToast } from '@/hooks/use-toast';
import { addPdfHeader } from '@/lib/pdf-utils';
import { Skeleton } from '@/components/ui/skeleton';

// Mocks - In a real app, this would come from a global state/context/API
const validationHistory = [
    { id: 'DIS-2', quoteNumber: 'COT-002', status: 'Validada', factura: 'FAC-201' },
    { id: 'DIS-3', quoteNumber: 'COT-003', status: 'Validada', factura: 'FAC-202' },
];

const ruteroOptions = [
    { value: 'none', label: 'Seleccionar rutero' },
    { value: 'Transportadora', label: 'Transportadora' },
    { value: 'Ruta Interna', label: 'Ruta Interna' },
    { value: 'Cliente Recoge', label: 'Cliente Recoge' },
];

const conventionOptions = [
    { value: 'none', label: 'Sin estado', bgColor: '', textColor: '' },
    { value: 'Prealistamiento de pedido', label: 'Prealistamiento de pedido', bgColor: 'bg-purple-200/50', textColor: 'text-purple-800' },
    { value: 'Listo en Bodega', label: 'Listo en Bodega', bgColor: 'bg-blue-200/50', textColor: 'text-blue-800' },
    { value: 'Despachado', label: 'Despachado', bgColor: 'bg-green-200/50', textColor: 'text-green-800' },
    { value: 'Producto Separado', label: 'Producto Separado', bgColor: 'bg-amber-200/50', textColor: 'text-amber-800' },
    { value: 'Transito naviero', label: 'Transito naviero', bgColor: 'bg-yellow-200/50', textColor: 'text-yellow-800' },
    { value: 'Novedad Bodega interno', label: 'Novedad Bodega interno', bgColor: 'bg-orange-200/50', textColor: 'text-orange-800' },
    { value: 'Entrega parcial', label: 'Entrega parcial', bgColor: 'bg-red-200/50', textColor: 'text-red-800' },
];

const getConventionClasses = (value: string) => {
    const option = conventionOptions.find(opt => opt.value === value);
    if (!option || !option.bgColor || value === 'none') return '';
    return `${option.bgColor} ${option.textColor}`;
};

export interface DispatchProduct {
    name: string;
    quantity: number;
    origin: 'Bodega' | 'Zona Franca';
}
export interface DispatchData {
    id: number;
    vendedor: string;
    fechaSolicitud: string;
    cotizacion: string;
    cliente: string;
    ciudad: string;
    direccion: string;
    remision: string;
    observacion: string;
    rutero: string;
    fechaDespacho: string;
    guia: string;
    convencion: string;
    products: DispatchProduct[];
}

export const initialDispatchData: DispatchData[] = [
  {
    id: 1,
    vendedor: 'John Doe',
    fechaSolicitud: '2024-07-28',
    cotizacion: 'COT-001',
    cliente: 'ConstruCali',
    ciudad: 'Cali',
    direccion: 'Calle Falsa 123',
    remision: 'REM-001',
    observacion: '',
    rutero: 'Transportadora',
    fechaDespacho: '',
    guia: '',
    convencion: 'Prealistamiento de pedido',
    products: [{ name: 'Cut stone', quantity: 10, origin: 'Bodega' }, { name: 'Adhesivo', quantity: 5, origin: 'Bodega' }]
  },
  {
    id: 2,
    vendedor: 'Jane Smith',
    fechaSolicitud: '2024-07-29',
    cotizacion: 'COT-002',
    cliente: 'Diseños Modernos SAS',
    ciudad: 'Bogotá',
    direccion: 'Av. Siempre Viva 45',
    remision: 'REM-002',
    observacion: 'Entrega urgente',
    rutero: 'R-BOG-01',
    fechaDespacho: '2024-07-30',
    guia: 'TCC-98765',
    convencion: 'Despachado',
    products: [{ name: 'Black', quantity: 20, origin: 'Bodega' }]
  },
  {
    id: 3,
    vendedor: 'John Doe',
    fechaSolicitud: '2023-06-15',
    cotizacion: 'COT-003',
    cliente: 'Arquitectos Unidos',
    ciudad: 'Medellín',
    direccion: 'Carrera 10 # 20-30',
    remision: 'REM-003',
    observacion: '',
    rutero: 'R-MED-05',
    fechaDespacho: '2024-06-18',
    guia: 'ENV-12345',
    convencion: 'Entrega parcial',
    products: [{ name: 'Concreto gris', quantity: 15, origin: 'Zona Franca' }],
  },
];


function DispatchPageContent() {
  const [dispatchData, setDispatchData] = useState<DispatchData[]>(initialDispatchData);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<DispatchData | null>(null);
  const [viewingDispatch, setViewingDispatch] = useState<DispatchData | null>(null);
  const { toast } = useToast();
  
  const { currentUser } = useUser();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const canEditLogistica = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Logística');
  const canCreateDispatch = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');
  const canSeeActions = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');


  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
        const cliente = searchParams.get('cliente') || '';
        const vendedor = searchParams.get('vendedor') || '';
        const cotizacion = searchParams.get('cotizacion') || '';
        const customerData = initialCustomerData.find(c => c.name === cliente);

        setEditingDispatch({
            id: 0, // temp id
            cliente,
            vendedor,
            cotizacion,
            direccion: customerData?.address || '',
            ciudad: customerData?.city || '',
            fechaSolicitud: new Date().toISOString().split('T')[0],
            remision: '',
            observacion: '',
            rutero: 'none',
            fechaDespacho: '',
            guia: '',
            convencion: 'Prealistamiento de pedido',
            products: [],
        });
        setIsFormOpen(true);
        // Clean up URL params
        router.replace('/orders', { scroll: false });
    }
  }, [searchParams, router]);
  
  const handleInputChange = (id: number, field: keyof DispatchData, value: string | boolean) => {
    setDispatchData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleOpenEditDialog = (item: DispatchData) => {
    setEditingDispatch(item);
    setIsFormOpen(true);
  }

  const handleOpenCreateDialog = () => {
    setEditingDispatch(null);
    setIsFormOpen(true);
  }

  const handleDeleteDispatch = (id: number) => {
    setDispatchData(prevData => prevData.filter(item => item.id !== id));
  }

  const handleDuplicateDispatch = (id: number) => {
    const originalDispatch = dispatchData.find(item => item.id === id);
    if (!originalDispatch) return;

    const newId = dispatchData.length > 0 ? Math.max(...dispatchData.map(d => d.id)) + 1 : 1;
    const newDispatch = {
        ...originalDispatch,
        id: newId,
        fechaSolicitud: new Date().toISOString().split('T')[0],
        rutero: 'none',
        fechaDespacho: '',
        guia: '',
        convencion: 'Prealistamiento de pedido',
    };
    setDispatchData(prev => [newDispatch, ...prev]);
  };
  
  const handleSaveDispatch = (data: DispatchData) => {
    if (editingDispatch) {
        setDispatchData(prev => prev.map(d => d.id === data.id ? data : d));
        toast({ title: 'Despacho Actualizado', description: 'La solicitud de despacho ha sido actualizada.'});
    } else {
        setDispatchData(prev => [data, ...prev]);
        toast({ title: 'Despacho Creado', description: 'La nueva solicitud de despacho ha sido creada.'});
    }
    setIsFormOpen(false);
  }

  const filteredData = dispatchData.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
        item.cliente.toLowerCase().includes(searchTermLower) ||
        item.vendedor.toLowerCase().includes(searchTermLower) ||
        item.cotizacion.toLowerCase().includes(searchTermLower) ||
        item.remision.toLowerCase().includes(searchTermLower) ||
        item.ciudad.toLowerCase().includes(searchTermLower);
        
    const itemDate = new Date(item.fechaSolicitud);
    const fromDate = date?.from ? new Date(date.from) : null;
    const toDate = date?.to ? new Date(date.to) : null;

    if(fromDate) fromDate.setHours(0,0,0,0);
    if(toDate) toDate.setHours(23,59,59,999);

    const matchesDate = 
        !date || 
        (!fromDate && !toDate) ||
        (fromDate && !toDate && itemDate >= fromDate) ||
        (!fromDate && toDate && itemDate <= toDate) ||
        (fromDate && toDate && itemDate >= fromDate && itemDate <= toDate);

    return matchesSearch && matchesDate;
  });
  
  const getValidationStatus = (cotizacion: string) => {
    const validatedItem = validationHistory.find(v => v.quoteNumber === cotizacion);
    if (validatedItem) {
        return { status: validatedItem.status, factura: validatedItem.factura };
    }
    return { status: 'Pendiente', factura: '' };
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Validada': return 'success';
        case 'Rechazada': return 'destructive';
        default: return 'secondary';
    }
  }


  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      format: 'letter'
    });
    
    await addPdfHeader(doc);
    
    doc.setFontSize(14);
    doc.text('Reporte de Despachos', 14, 45);

    (doc as any).autoTable({
      startY: 50,
      head: [
        [
          'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
          'Dirección', 'Productos', 'Observación', 'Rutero', 'Fecha Desp.',
          'Guía', 'Convención', 'Factura #', 'Estado Validación'
        ],
      ],
      body: filteredData.map(item => {
        const { status, factura } = getValidationStatus(item.cotizacion);
        const productString = item.products.map(p => `${p.name} (x${p.quantity} - ${p.origin})`).join(', ');
        return [
          item.vendedor,
          item.fechaSolicitud,
          item.cotizacion,
          item.cliente,
          item.ciudad,
          item.direccion,
          productString,
          item.observacion,
          item.rutero,
          item.fechaDespacho,
          item.guia,
          item.convencion,
          factura,
          status,
      ]}),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.save('Reporte de Despachos.pdf');
  };

  const handleExportXLSX = async () => {
    const { utils, writeFile } = await import('xlsx');
    const tableHeaders = [
        'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
        'Dirección', 'Productos', 'Observación', 'Rutero', 'Fecha Desp.',
        'Guía', 'Convención', 'Factura #', 'Estado Validación'
    ];
    
    const dataToExport = filteredData.map(item => {
        const { status, factura } = getValidationStatus(item.cotizacion);
        const productString = item.products.map(p => `${p.name} (x${p.quantity} - ${p.origin})`).join(', ');
        return {
            'Vendedor': item.vendedor,
            'Fecha Sol.': item.fechaSolicitud,
            'Cotización': item.cotizacion,
            'Cliente': item.cliente,
            'Ciudad': item.ciudad,
            'Dirección': item.direccion,
            'Productos': productString,
            'Observación': item.observacion,
            'Rutero': item.rutero,
            'Fecha Desp.': item.fechaDespacho,
            'Guía': item.guia,
            'Convención': item.convencion,
            'Factura #': factura,
            'Estado Validación': status,
        }
    });

    const ws = utils.json_to_sheet(dataToExport, { header: tableHeaders });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Despachos");
    writeFile(wb, "Reporte de Despachos.xlsx");
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Despachos y Facturación</CardTitle>
                <CardDescription>
                    Gestione las solicitudes de despacho, la logística y la facturación.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                {canCreateDispatch && (
                  <Button onClick={handleOpenCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Despacho
                  </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleExportPDF}>Descargar como PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportXLSX}>Descargar como XLSX</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Buscar por cliente, vendedor, cotización..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
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
                    <span>Seleccione un rango de fechas</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader>
              <TableRow>
                {/* Asesor */}
                <TableHead className="p-2">Vendedor</TableHead>
                <TableHead className="p-2">Fecha Sol.</TableHead>
                <TableHead className="p-2">Cotización</TableHead>
                <TableHead className="p-2">Cliente</TableHead>
                <TableHead className="p-2">Ciudad</TableHead>
                <TableHead className="p-2">Dirección</TableHead>
                <TableHead className="p-2">Productos</TableHead>
                <TableHead className="p-2">Observación</TableHead>
                {/* Logística */}
                <TableHead className="p-2">Remisión</TableHead>
                <TableHead className="p-2">Rutero</TableHead>
                <TableHead className="p-2">Fecha Desp.</TableHead>
                <TableHead className="p-2">Guía</TableHead>
                <TableHead className="p-2">Convención</TableHead>
                {/* Contador (Read-only from validation) */}
                <TableHead className="p-2">Factura #</TableHead>
                <TableHead className="p-2 text-center">Estado Validación</TableHead>
                {canSeeActions && <TableHead className="text-right p-2">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const validation = getValidationStatus(item.cotizacion);
                const isOwner = currentUser.name === item.vendedor;
                const isAdmin = currentUser.roles.includes('Administrador');

                return (
                <TableRow key={item.id} className={cn("h-auto", getConventionClasses(item.convencion))}>
                  {/* Asesor Fields */}
                  <TableCell className="p-2 align-middle">{item.vendedor}</TableCell>
                  <TableCell className="p-2 align-middle">{item.fechaSolicitud}</TableCell>
                  <TableCell className="p-2 align-middle">{item.cotizacion}</TableCell>
                  <TableCell className="p-2 align-middle">{item.cliente}</TableCell>
                  <TableCell className="p-2 align-middle">{item.ciudad}</TableCell>
                  <TableCell className="p-2 align-middle">{item.direccion}</TableCell>
                  <TableCell className="p-2 align-middle">
                      {item.products.length > 0 ? (
                        <Button variant="outline" size="sm" onClick={() => { setViewingDispatch(item); setIsDetailModalOpen(true); }}>
                            <PackageOpen className="h-4 w-4 mr-2" />
                            Ver ({item.products.length})
                        </Button>
                      ) : (
                        'N/A'
                      )}
                  </TableCell>
                  <TableCell className="p-2 align-middle text-sm text-muted-foreground whitespace-pre-wrap min-w-[200px]">{item.observacion}</TableCell>
                  
                  {/* Logística Fields */}
                  <TableCell className="p-0"><Input className="h-full bg-transparent border-0 rounded-none focus-visible:ring-0" value={item.remision} onChange={e => handleInputChange(item.id, 'remision', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="p-0 min-w-[200px]">
                     <Select
                        value={item.rutero}
                        onValueChange={(value) => handleInputChange(item.id, 'rutero', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="h-full bg-transparent border-0 rounded-none focus:ring-0">
                           <SelectValue placeholder="Seleccionar rutero" />
                        </SelectTrigger>
                        <SelectContent>
                           {ruteroOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-0"><Input className="h-full bg-transparent border-0 rounded-none focus-visible:ring-0" type="date" value={item.fechaDespacho} onChange={e => handleInputChange(item.id, 'fechaDespacho', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="p-0"><Input className="h-full bg-transparent border-0 rounded-none focus-visible:ring-0" value={item.guia} onChange={e => handleInputChange(item.id, 'guia', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="p-0 min-w-[200px]">
                     <Select
                        value={item.convencion}
                        onValueChange={(value) => handleInputChange(item.id, 'convencion', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="h-full bg-transparent border-0 rounded-none focus:ring-0">
                           <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                           {conventionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    {option.value && option.value !== 'none' && <div className={cn("w-2 h-2 rounded-full", option.bgColor?.replace('/50',''))}></div>}
                                    {option.label}
                                </div>
                            </SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Contador Fields (Read-Only from validation) */}
                   <TableCell className="p-2 align-middle text-sm text-center">
                    {validation.factura || 'N/A'}
                  </TableCell>
                  <TableCell className="p-2 align-middle text-center">
                    <Badge variant={getStatusBadgeVariant(validation.status)}>
                      {validation.status}
                    </Badge>
                  </TableCell>
                  {canSeeActions && (
                      <TableCell className="text-right p-0">
                        <div className="flex items-center justify-end h-full">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(item)} className="h-full rounded-none" disabled={!isAdmin && !isOwner}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicateDispatch(item.id)} className="h-full rounded-none">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-full rounded-none" disabled={!isAdmin && !isOwner}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de despacho.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDispatch(item.id)} className="bg-destructive hover:bg-destructive/90">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                  )}
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{editingDispatch ? 'Editar Solicitud de Despacho' : 'Crear Nueva Solicitud de Despacho'}</DialogTitle>
            </DialogHeader>
            <DispatchForm 
                dispatch={editingDispatch}
                onSave={handleSaveDispatch}
                onCancel={() => setIsFormOpen(false)}
            />
        </DialogContent>
    </Dialog>

    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Productos del Despacho</DialogTitle>
                <DialogDescription>Cotización #{viewingDispatch?.cotizacion}</DialogDescription>
            </DialogHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {viewingDispatch?.products.map((p, i) => (
                        <TableRow key={`${p.name}-${i}`}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                     {p.origin === 'Bodega' ? <Warehouse className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                                    {p.origin}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{p.quantity}</TableCell>
                        </TableRow>
                    ))}
                     {viewingDispatch?.products.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No se especificaron productos.
                            </TableCell>
                        </TableRow>
                     )}
                </TableBody>
            </Table>
        </DialogContent>
    </Dialog>
    </>
  );
}

export default function DispatchPage() {
    return (
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <DispatchPageContent />
        </Suspense>
    );
}

