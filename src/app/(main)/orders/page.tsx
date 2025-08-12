'use client';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, Search, MoreHorizontal, Trash2, Copy, ChevronDown } from 'lucide-react';
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

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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
    validado: false,
    factura: '',
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
    validado: true,
    factura: 'FAC-201',
  },
  {
    id: 3,
    vendedor: 'John Doe',
    fechaSolicitud: '2024-06-15',
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
    validado: true,
    factura: 'FAC-202',
  },
];

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
  role: 'Asesor de Ventas' as Role,
};

export default function DispatchPage() {
  const [dispatchData, setDispatchData] = useState(initialDispatchData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const canEditAsesor = currentUser.role === 'Administrador' || currentUser.role === 'Asesor de Ventas';
  const canEditLogistica = currentUser.role === 'Administrador' || currentUser.role === 'Logística';
  const canEditContador = currentUser.role === 'Administrador' || currentUser.role === 'Contador';

  const handleInputChange = (id: number, field: string, value: string | boolean) => {
    setDispatchData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const addNewDispatch = () => {
    const newId = dispatchData.length > 0 ? Math.max(...dispatchData.map(d => d.id)) + 1 : 1;
    const newDispatch = {
        id: newId,
        vendedor: currentUser.name, // Default to current user
        fechaSolicitud: new Date().toISOString().split('T')[0],
        cotizacion: '',
        cliente: '',
        ciudad: '',
        direccion: '',
        remision: '',
        observacion: '',
        rutero: 'none',
        fechaDespacho: '',
        guia: '',
        convencion: 'none' as 'none',
        validado: false,
        factura: '',
    };
    setDispatchData(prev => [newDispatch, ...prev]);
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
        validado: false,
        factura: '',
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
        item.ciudad.toLowerCase().includes(searchTermLower) ||
        item.factura.toLowerCase().includes(searchTermLower);
        
    const matchesMonth = 
        selectedMonth === 'all' || 
        item.fechaSolicitud.substring(5, 7) === selectedMonth;

    return matchesSearch && matchesMonth;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    doc.autoTable({
      head: [
        [
          'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
          'Dirección', 'Remisión', 'Observación', 'Rutero', 'Fecha Desp.',
          'Guía', 'Convención', 'Validado', 'Factura #'
        ],
      ],
      body: filteredData.map(item => [
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
        item.validado ? 'Aprobado' : 'Pendiente',
        item.factura,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.save('Reporte de Despachos.pdf');
  };

  const handleExportHTML = () => {
    const tableHeaders = [
        'Vendedor', 'Fecha Sol.', 'Cotización', 'Cliente', 'Ciudad',
        'Dirección', 'Remisión', 'Observación', 'Rutero', 'Fecha Desp.',
        'Guía', 'Convención', 'Validado', 'Factura #'
    ];
    let html = '<table><thead><tr>';
    tableHeaders.forEach(header => html += `<th>${header}</th>`);
    html += '</tr></thead><tbody>';

    filteredData.forEach(item => {
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
        html += `<td>${item.validado ? 'Aprobado' : 'Pendiente'}</td>`;
        html += `<td>${item.factura}</td>`;
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
                {canEditAsesor && (
                    <Button onClick={addNewDispatch}>
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
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader>
              <TableRow>
                {/* Asesor */}
                <TableHead className="p-0">Vendedor</TableHead>
                <TableHead className="p-0">Fecha Sol.</TableHead>
                <TableHead className="p-0">Cotización</TableHead>
                <TableHead className="p-0">Cliente</TableHead>
                <TableHead className="p-0">Ciudad</TableHead>
                <TableHead className="p-0">Dirección</TableHead>
                <TableHead className="p-0">Remisión</TableHead>
                {/* Logística */}
                <TableHead className="p-0">Observación</TableHead>
                <TableHead className="p-0">Rutero</TableHead>
                <TableHead className="p-0">Fecha Desp.</TableHead>
                <TableHead className="p-0">Guía</TableHead>
                <TableHead className="p-0">Convención</TableHead>
                {/* Contador */}
                <TableHead className="p-0">Validado</TableHead>
                <TableHead className="p-0">Factura #</TableHead>
                <TableHead className="text-right p-0">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className={cn("h-full", getConventionClasses(item.convencion))}>
                  {/* Asesor Fields */}
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.vendedor} onChange={e => handleInputChange(item.id, 'vendedor', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" type="date" value={item.fechaSolicitud} onChange={e => handleInputChange(item.id, 'fechaSolicitud', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.cotizacion} onChange={e => handleInputChange(item.id, 'cotizacion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.cliente} onChange={e => handleInputChange(item.id, 'cliente', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell className="p-0 min-w-[200px]">
                    <Combobox
                      options={colombianCities}
                      value={item.ciudad}
                      onValueChange={(value) => handleInputChange(item.id, 'ciudad', value)}
                      placeholder="Seleccione una ciudad"
                      searchPlaceholder="Buscar ciudad..."
                      emptyPlaceholder="No se encontró la ciudad."
                      className="bg-background/50 border-0 rounded-none focus:ring-1 focus:ring-offset-0 h-full"
                      disabled={!canEditAsesor}
                      allowFreeText
                    />
                  </TableCell>
                  <TableCell className="p-0"><Input className="min-w-[200px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.direccion} onChange={e => handleInputChange(item.id, 'direccion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.remision} onChange={e => handleInputChange(item.id, 'remision', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  
                  {/* Logística Fields */}
                  <TableCell className="p-0"><Input className="min-w-[200px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.observacion} onChange={e => handleInputChange(item.id, 'observacion', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="min-w-[200px] p-0">
                     <Select
                        value={item.rutero}
                        onValueChange={(value) => handleInputChange(item.id, 'rutero', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="bg-background/50 border-0 rounded-none focus:ring-1 focus:ring-offset-0 h-full">
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
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" type="date" value={item.fechaDespacho} onChange={e => handleInputChange(item.id, 'fechaDespacho', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.guia} onChange={e => handleInputChange(item.id, 'guia', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="min-w-[200px] p-0">
                     <Select
                        value={item.convencion}
                        onValueChange={(value) => handleInputChange(item.id, 'convencion', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="bg-background/50 border-0 rounded-none focus:ring-1 focus:ring-offset-0 h-full">
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

                  {/* Contador Fields */}
                  <TableCell className="text-center p-0">
                    <Select
                      value={item.validado ? 'Aprobado' : 'Pendiente'}
                      onValueChange={(value) => handleInputChange(item.id, 'validado', value === 'Aprobado')}
                      disabled={!canEditContador}
                    >
                      <SelectTrigger className="w-32 bg-background/50 h-full border-0 rounded-none focus:ring-1 focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-0"><Input className="min-w-[150px] bg-background/50 h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" value={item.factura} onChange={e => handleInputChange(item.id, 'factura', e.target.value)} disabled={!canEditContador} /></TableCell>
                  <TableCell className="text-right p-0">
                    {(currentUser.role === 'Asesor de Ventas' && currentUser.name === item.vendedor) && (
                      <div className="flex items-center justify-end h-full">
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
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
