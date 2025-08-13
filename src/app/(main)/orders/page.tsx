'use client';
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, Search, ChevronDown, Trash2, Copy, Edit } from 'lucide-react';
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
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DispatchForm, type DispatchFormValues } from '@/components/dispatch-form';

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


const months = [
    { value: 'all', label: 'Todos los Meses' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

const colombianCities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", 
  "Soacha", "Soledad", "Bucaramanga", "Ibagué", "Santa Marta", "Villavicencio", 
  "Pereira", "Manizales", "Pasto", "Neiva", "Armenia", "Popayán", "Sincelejo", 
  "Montería", "Valledupar", "Tunja", "Riohacha", "Florencia", "Yopal", 
  "Quibdó", "Arauca", "San Andrés", "Mocoa", "Leticia", "Inírida", 
  "San José del Guaviare", "Puerto Carreño", "Mitú"
].map(city => ({ value: city, label: city }));

// In a real app, this would come from an auth context.
const currentUser = {
  name: 'John Doe',
  role: 'Administrador' as Role,
};

export default function DispatchPage() {
  const [dispatchData, setDispatchData] = useState(initialDispatchData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<DispatchData | null>(null);
  const [observationOptions, setObservationOptions] = useState([
    { value: 'none', label: 'Sin observación' },
    { value: 'Entrega Urgente', label: 'Entrega Urgente' },
    { value: 'Cliente ausente', label: 'Cliente ausente' },
    { value: 'Dirección incorrecta', label: 'Dirección incorrecta' },
  ]);
  const [newObservation, setNewObservation] = useState('');

  const canEditLogistica = currentUser.role === 'Administrador' || currentUser.role === 'Logística';
  const canCreateDispatch = currentUser.role === 'Administrador' || currentUser.role === 'Asesor de Ventas';
  
  const handleInputChange = (id: number, field: string, value: string | boolean) => {
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
        const newDispatch = {
            id: newId,
            vendedor: currentUser.name,
            fechaSolicitud: new Date().toISOString().split('T')[0],
            ...data,
            remision: '',
            observacion: 'none',
            rutero: 'none',
            fechaDespacho: '',
            guia: '',
            convencion: 'none' as 'none',
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
        convencion: 'none' as 'none',
    };
    setDispatchData(prev => [newDispatch, ...prev]);
  };

  const handleAddNewObservation = () => {
    if (newObservation && !observationOptions.find(opt => opt.value === newObservation)) {
        const newOption = { value: newObservation, label: newObservation };
        setObservationOptions(prev => [...prev, newOption]);
        setNewObservation('');
    }
  };
  
  const years = useMemo(() => {
    const allYears = new Set(dispatchData.map(item => item.fechaSolicitud.substring(0, 4)));
    const yearOptions = Array.from(allYears).sort().reverse().map(year => ({ value: year, label: year }));
    return [{ value: 'all', label: 'Todos los Años' }, ...yearOptions];
  }, [dispatchData]);

  const filteredData = dispatchData.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
        item.cliente.toLowerCase().includes(searchTermLower) ||
        item.vendedor.toLowerCase().includes(searchTermLower) ||
        item.cotizacion.toLowerCase().includes(searchTermLower) ||
        item.remision.toLowerCase().includes(searchTermLower) ||
        item.ciudad.toLowerCase().includes(searchTermLower);
        
    const matchesMonth = 
        selectedMonth === 'all' || 
        item.fechaSolicitud.substring(5, 7) === selectedMonth;

    const matchesYear =
        selectedYear === 'all' ||
        item.fechaSolicitud.substring(0, 4) === selectedYear;

    return matchesSearch && matchesMonth && matchesYear;
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
        case 'Validada': return 'default';
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

  const handleExportHTML = () => {
    const tableHeaders = [
        'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
        'Dirección', 'Remisión', 'Observación', 'Rutero', 'Fecha Desp.',
        'Guía', 'Convención', 'Factura #', 'Estado Validación'
    ];
    let html = '<table><thead><tr>';
    tableHeaders.forEach(header => html += `<th>${header}</th>`);
    html += '</tr></thead><tbody>';

    filteredData.forEach(item => {
        const { status, factura } = getValidationStatus(item.cotizacion);
        html += '<tr>';
        html += `<td>${item.vendedor}</td>`;
        html += `<td>${item.fechaSolicitud}</td>`;
        html += `<td>${item.cotizacion}</td>`;
        html += `<td>${item.cliente}</td>`;
        html += `<td>${item.ciudad}</td>`;
        html += `<td>${item.direccion}</td>`;
        html += `<td>${item.remision}</td>`;
        html += `<td>${item.observacion}</td>`;
        html += `<td>${item.rutero}</td>`;
        html += `<td>${item.fechaDespacho}</td>`;
        html += `<td>${item.guia}</td>`;
        html += `<td>${item.convencion}</td>`;
        html += `<td>${factura}</td>`;
        html += `<td>${status}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte de Despachos.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                        <DropdownMenuItem onClick={handleExportHTML}>Descargar para Excel (HTML)</DropdownMenuItem>
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
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por mes" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por año" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                            {year.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
                {/* Logística */}
                <TableHead className="p-2">Remisión</TableHead>
                <TableHead className="p-2">
                    <div className="flex items-center">
                        Observación
                        {canEditLogistica && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Añadir Nueva Observación</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newObservation}
                                            onChange={(e) => setNewObservation(e.target.value)}
                                            placeholder="Escriba una nueva observación"
                                        />
                                        <Button onClick={handleAddNewObservation}>Añadir</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </TableHead>
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
                  
                  {/* Logística Fields */}
                  <TableCell className="p-0"><Input className="h-full bg-transparent border-0 rounded-none focus-visible:ring-0" value={item.remision} onChange={e => handleInputChange(item.id, 'remision', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="p-0 min-w-[200px]">
                    <Select
                        value={item.observacion}
                        onValueChange={(value) => handleInputChange(item.id, 'observacion', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="h-full bg-transparent border-0 rounded-none focus:ring-0">
                           <SelectValue placeholder="Seleccionar observación" />
                        </SelectTrigger>
                        <SelectContent>
                           {observationOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                  </TableCell>
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
                      {(currentUser.name === item.vendedor && !isReadOnly) && (
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
