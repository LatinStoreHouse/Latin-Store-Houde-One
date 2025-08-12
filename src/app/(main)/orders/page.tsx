'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown } from 'lucide-react';
import { Role } from '@/lib/roles';

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
    convencion: '',
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
    convencion: 'Feria Construcción',
    validado: true,
    factura: 'FAC-201',
  },
];

// In a real app, this would come from an auth context.
const currentUserRole: Role = 'Administrador';

export default function DispatchPage() {
  const [dispatchData, setDispatchData] = useState(initialDispatchData);

  const canEditAsesor = currentUserRole === 'Administrador' || currentUserRole === 'Asesor de Ventas';
  const canEditLogistica = currentUserRole === 'Administrador' || currentUserRole === 'Logística';
  const canEditContador = currentUserRole === 'Administrador' || currentUserRole === 'Contador';

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
        vendedor: '',
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Despachos y Facturación</CardTitle>
            <CardDescription>
                Gestione las solicitudes de despacho, la logística y la facturación.
            </CardDescription>
        </div>
        <div className="flex gap-2">
            {canEditAsesor && (
                <Button onClick={addNewDispatch}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Despacho
                </Button>
            )}
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatchData.map((item) => (
                <TableRow key={item.id}>
                  {/* Asesor Fields */}
                  <TableCell><Input value={item.vendedor} onChange={e => handleInputChange(item.id, 'vendedor', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input type="date" value={item.fechaSolicitud} onChange={e => handleInputChange(item.id, 'fechaSolicitud', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input value={item.cotizacion} onChange={e => handleInputChange(item.id, 'cotizacion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input value={item.cliente} onChange={e => handleInputChange(item.id, 'cliente', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input value={item.ciudad} onChange={e => handleInputChange(item.id, 'ciudad', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input value={item.direccion} onChange={e => handleInputChange(item.id, 'direccion', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  <TableCell><Input value={item.remision} onChange={e => handleInputChange(item.id, 'remision', e.target.value)} disabled={!canEditAsesor} /></TableCell>
                  
                  {/* Logística Fields */}
                  <TableCell><Input value={item.observacion} onChange={e => handleInputChange(item.id, 'observacion', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input value={item.rutero} onChange={e => handleInputChange(item.id, 'rutero', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input type="date" value={item.fechaDespacho} onChange={e => handleInputChange(item.id, 'fechaDespacho', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input value={item.guia} onChange={e => handleInputChange(item.id, 'guia', e.target.value)} disabled={!canEditLogistica} /></TableCell>
                  <TableCell><Input value={item.convencion} onChange={e => handleInputChange(item.id, 'convencion', e.target.value)} disabled={!canEditLogistica} /></TableCell>

                  {/* Contador Fields */}
                  <TableCell className="text-center">
                    <Select
                      value={item.validado ? 'Aprobado' : 'Pendiente'}
                      onValueChange={(value) => handleInputChange(item.id, 'validado', value === 'Aprobado')}
                      disabled={!canEditContador}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input value={item.factura} onChange={e => handleInputChange(item.id, 'factura', e.target.value)} disabled={!canEditContador} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
