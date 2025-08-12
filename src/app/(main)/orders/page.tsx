'use client';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, Search, MoreHorizontal, Trash2 } from 'lucide-react';
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

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const conventionOptions = [
    { value: '', label: 'Sin estado', bgColor: '', textColor: '' },
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
    if (!option || !option.bgColor) return '';
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
    rutero: '',
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
        rutero: '',
        fechaDespacho: '',
        guia: '',
        convencion: '',
        validado: false,
        factura: '',
    };
    setDispatchData(prev => [newDispatch, ...prev]);
  }

  const handleDeleteDispatch = (id: number) => {
    setDispatchData(prevData => prevData.filter(item => item.id !== id));
  }

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
                <Button variant="outline" onClick={handleExportPDF}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar a PDF
                </Button>
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
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha Sol.</TableHead>
                <TableHead>Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Remisión</TableHead>
                {/* Logística */}
                <TableHead>Observación</TableHead>
                <TableHead>Rutero</TableHead>
                <TableHead>Fecha Desp.</TableHead>
                <TableHead>Guía</TableHead>
                <TableHead>Convención</TableHead>
                {/* Contador */}
                <TableHead>Validado</TableHead>
                <TableHead>Factura #</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className={cn(getConventionClasses(item.convencion))}>
                  {/* Asesor Fields */}
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.vendedor} onChange={e => handleInputChange(item.id, 'vendedor', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" type="date" value={item.fechaSolicitud} onChange={e => handleInputChange(item.id, 'fechaSolicitud', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.cotizacion} onChange={e => handleInputChange(item.id, 'cotizacion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.cliente} onChange={e => handleInputChange(item.id, 'cliente', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.ciudad} onChange={e => handleInputChange(item.id, 'ciudad', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[200px] bg-background/50" value={item.direccion} onChange={e => handleInputChange(item.id, 'direccion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.remision} onChange={e => handleInputChange(item.id, 'remision', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  
                  {/* Logística Fields */}
                  <TableCell><Input className="min-w-[200px] bg-background/50" value={item.observacion} onChange={e => handleInputChange(item.id, 'observacion', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.rutero} onChange={e => handleInputChange(item.id, 'rutero', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" type="date" value={item.fechaDespacho} onChange={e => handleInputChange(item.id, 'fechaDespacho', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.guia} onChange={e => handleInputChange(item.id, 'guia', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell className="min-w-[200px]">
                     <Select
                        value={item.convencion}
                        onValueChange={(value) => handleInputChange(item.id, 'convencion', value)}
                        disabled={!canEditLogistica}
                    >
                        <SelectTrigger className="bg-background/50 border-0 focus:ring-0">
                           <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                           {conventionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    {option.value && <div className={cn("w-2 h-2 rounded-full", option.bgColor.replace('/50',''))}></div>}
                                    {option.label}
                                </div>
                            </SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Contador Fields */}
                  <TableCell className="text-center">
                    <Select
                      value={item.validado ? 'Aprobado' : 'Pendiente'}
                      onValueChange={(value) => handleInputChange(item.id, 'validado', value === 'Aprobado')}
                      disabled={!canEditContador}
                    >
                      <SelectTrigger className="w-32 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="min-w-[150px] bg-background/50" value={item.factura} onChange={e => handleInputChange(item.id, 'factura', e.target.value)} disabled={!canEditContador} /></TableCell>
                  <TableCell className="text-right">
                    {(currentUser.role === 'Asesor de Ventas' && currentUser.name === item.vendedor) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
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
