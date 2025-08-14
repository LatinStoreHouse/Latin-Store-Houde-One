'use client';
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, Search, ChevronDown, Trash2, Copy, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { Role } from '@/lib/roles';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DispatchForm, type DispatchFormValues } from '@/components/dispatch-form';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

// Mocked data for dispatch requests
const initialDispatchData = [
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
  },
];

type DispatchData = typeof initialDispatchData[0];


// In a real app, this would come from an auth context.
const currentUser = {
  name: 'John Doe',
  role: 'Administrador' as Role,
};

export default function DispatchPage() {
  const [dispatchData, setDispatchData] = useState(initialDispatchData);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<DispatchData | null>(null);
  
  const canEditLogistica = currentUser.role === 'Administrador' || currentUser.role === 'Logística';
  const canCreateDispatch = currentUser.role === 'Administrador' || currentUser.role === 'Asesor de Ventas';
  
  const handleInputChange = (id: number, field: keyof DispatchData, value: string | boolean) => {
    setDispatchData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleSaveDispatch = (data: DispatchFormValues & { id?: number }) => {
    if (data.id) { // Editing existing
        setDispatchData(prev => prev.map(d => d.id === data.id ? {...d, ...data} : d));
    } else { // Creating new
        const newId = dispatchData.length > 0 ? Math.max(...dispatchData.map(d => d.id)) + 1 : 1;
        const newDispatch: DispatchData = {
            id: newId,
            vendedor: currentUser.name,
            fechaSolicitud: new Date().toISOString().split('T')[0],
            cotizacion: data.cotizacion,
            cliente: data.cliente,
            ciudad: data.ciudad,
            direccion: data.direccion,
            remision: '',
            observacion: data.observacion || '',
            rutero: 'none',
            fechaDespacho: '',
            guia: '',
            convencion: 'Prealistamiento de pedido',
        };
        setDispatchData(prev => [newDispatch, ...prev]);
    }
    setIsFormOpen(false);
    setEditingDispatch(null);
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


  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    doc.autoTable({
      head: [
        [
          'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
          'Dirección', 'Remisión', 'Observación', 'Rutero', 'Fecha Desp.',
          'Guía', 'Convención', 'Factura #', 'Estado Validación'
        ],
      ],
      body: filteredData.map(item => {
        const { status, factura } = getValidationStatus(item.cotizacion);
        return [
          item.vendedor,
          item.fechaSolicitud,
          item.cotizacion,
          item.cliente,
          item.ciudad,
          item.direccion,
          item.remision,
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

  const handleExportXLSX = () => {
    const tableHeaders = [
        'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
        'Dirección', 'Remisión', 'Observación', 'Rutero', 'Fecha Desp.',
        'Guía', 'Convención', 'Factura #', 'Estado Validación'
    ];
    
    const dataToExport = filteredData.map(item => {
        const { status, factura } = getValidationStatus(item.cotizacion);
        return {
            'Vendedor': item.vendedor,
            'Fecha Sol.': item.fechaSolicitud,
            'Cotización': item.cotizacion,
            'Cliente': item.cliente,
            'Ciudad': item.ciudad,
            'Dirección': item.direccion,
            'Remisión': item.remision,
            'Observación': item.observacion,
            'Rutero': item.rutero,
            'Fecha Desp.': item.fechaDespacho,
            'Guía': item.guia,
            'Convención': item.convencion,
            'Factura #': factura,
            'Estado Validación': status,
        }
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport, { header: tableHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Despachos");
    XLSX.writeFile(wb, "Reporte de Despachos.xlsx");
  };

  return (
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
                        <Button variant="outline">
                            <FileDown className="mr-2 h-4 w-4" />
                            Descargar
                            <ChevronDown className="ml-2 h-4 w-4" />
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
                <TableHead className="text-right p-2">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const validation = getValidationStatus(item.cotizacion);
                const isReadOnly = validation.status !== 'Pendiente';

                return (
                <TableRow key={item.id} className={cn("h-auto", getConventionClasses(item.convencion))}>
                  {/* Asesor Fields */}
                  <TableCell className="p-2 align-middle">{item.vendedor}</TableCell>
                  <TableCell className="p-2 align-middle">{item.fechaSolicitud}</TableCell>
                  <TableCell className="p-2 align-middle">{item.cotizacion}</TableCell>
                  <TableCell className="p-2 align-middle">{item.cliente}</TableCell>
                  <TableCell className="p-2 align-middle">{item.ciudad}</TableCell>
                  <TableCell className="p-2 align-middle">{item.direccion}</TableCell>
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
                  <TableCell className="text-right p-0">
                    <div className="flex items-center justify-end h-full">
                      {(currentUser.role === 'Administrador' || (currentUser.name === item.vendedor && !isReadOnly)) && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(item)} className="h-full rounded-none">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicateDispatch(item.id)} className="h-full rounded-none">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-full rounded-none">
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </CardContent>
       <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingDispatch(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingDispatch ? 'Editar Solicitud de Despacho' : 'Crear Solicitud de Despacho'}</DialogTitle>
                <DialogDescription>
                  {editingDispatch ? 'Actualice los detalles de la solicitud.' : 'Complete el formulario para enviar una nueva solicitud de despacho a validación.'}
                </DialogDescription>
            </DialogHeader>
            <DispatchForm 
                initialData={editingDispatch ?? undefined}
                onSave={handleSaveDispatch} 
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingDispatch(null);
                }}
            />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
