'use client';

import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Check, X, Search, Calendar as CalendarIcon, Download, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  source: 'Contenedor' | 'Bodega' | 'Zona Franca';
  sourceId: string;
  advisor: string;
  quoteNumber: string;
}

interface ValidatedItem {
    id: string;
    quoteNumber: string;
    customer: string;
    advisor: string;
    status: 'Validada' | 'Rechazada';
    validatedBy: string;
    validationDate: string;
    factura: string;
    type: 'Reserva' | 'Despacho';
}

interface PendingDispatch {
    id: number;
    cotizacion: string;
    cliente: string;
    vendedor: string;
    factura: string;
}

const initialPendingReservations: (Reservation & { status: 'En espera de validación', factura: string })[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, source: 'Contenedor', sourceId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'En espera de validación', factura: '' },
    { id: 'RES-002', customer: 'Diseños SAS', product: 'BLACK 1.22 X 0.61', quantity: 100, source: 'Contenedor', sourceId: 'CMAU7654321', advisor: 'John Doe', quoteNumber: 'COT-2024-002', status: 'En espera de validación', factura: '' },
];

const initialPendingDispatches: PendingDispatch[] = [
    { id: 1, cotizacion: 'COT-001', cliente: 'ConstruCali', vendedor: 'John Doe', factura: '' },
]

const initialHistory: ValidatedItem[] = [
    { id: 'RES-003', quoteNumber: 'COT-2024-003', customer: 'Hogar Futuro', advisor: 'Jane Smith', status: 'Validada', validatedBy: 'Carlos Ruiz', validationDate: '2024-07-28', factura: 'FAC-001', type: 'Reserva' },
    { id: 'RES-004', quoteNumber: 'COT-2024-004', customer: 'Arquitectura Andina', advisor: 'John Doe', status: 'Rechazada', validatedBy: 'Usuario Admin', validationDate: '2024-07-27', factura: 'FAC-002', type: 'Reserva' },
    { id: 'DIS-001', quoteNumber: 'COT-002', customer: 'Diseños Modernos SAS', advisor: 'Jane Smith', status: 'Validada', validatedBy: 'Usuario Admin', validationDate: '2024-07-29', factura: 'FAC-201', type: 'Despacho' },
]

const currentUser = {
    name: 'Usuario Admin',
    role: 'Administrador' as Role,
}

export default function ValidationPage() {
    const [pendingReservations, setPendingReservations] = useState(initialPendingReservations);
    const [pendingDispatches, setPendingDispatches] = useState(initialPendingDispatches);
    const [validationHistory, setValidationHistory] = useState<ValidatedItem[]>(initialHistory);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('todas');
    const { toast } = useToast();

    const canValidate = currentUser.role === 'Administrador' || currentUser.role === 'Contador';
    
    const handleInvoiceChange = (id: string, value: string, type: 'reservation' | 'dispatch') => {
        if (type === 'reservation') {
            setPendingReservations(
                pendingReservations.map(r => r.id === id ? { ...r, factura: value } : r)
            );
        } else {
             setPendingDispatches(
                pendingDispatches.map(d => d.id === Number(id) ? { ...d, factura: value } : d)
            );
        }
    };

    const handleReservationValidation = (reservation: (typeof pendingReservations)[0], newStatus: 'Validada' | 'Rechazada') => {
        if (!reservation.factura) {
            toast({ variant: 'destructive', title: 'Error', description: 'Se requiere un número de factura para validar.' });
            return;
        }

        setPendingReservations(pendingReservations.filter(r => r.id !== reservation.id));
        
        const newHistoryEntry: ValidatedItem = {
            id: reservation.id,
            quoteNumber: reservation.quoteNumber,
            customer: reservation.customer,
            advisor: reservation.advisor,
            status: newStatus,
            validatedBy: currentUser.name,
            validationDate: new Date().toISOString().split('T')[0],
            factura: reservation.factura,
            type: 'Reserva',
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);

        toast({ title: 'Éxito', description: `Reserva ${reservation.quoteNumber} ha sido ${newStatus.toLowerCase()}.` });
    };
    
    const handleDispatchValidation = (dispatch: PendingDispatch, newStatus: 'Validada' | 'Rechazada') => {
        if (!dispatch.factura) {
            toast({ variant: 'destructive', title: 'Error', description: 'Se requiere un número de factura para validar.' });
            return;
        }
    
        setPendingDispatches(pendingDispatches.filter(d => d.id !== dispatch.id));
    
        const newHistoryEntry: ValidatedItem = {
            id: `DIS-${dispatch.id}`,
            quoteNumber: dispatch.cotizacion,
            customer: dispatch.cliente,
            advisor: dispatch.vendedor,
            status: newStatus,
            validatedBy: currentUser.name,
            validationDate: new Date().toISOString().split('T')[0],
            factura: dispatch.factura,
            type: 'Despacho',
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);
    
        toast({ title: 'Éxito', description: `Despacho para ${dispatch.cotizacion} ha sido ${newStatus.toLowerCase()}.` });
    };

    const filteredHistory = useMemo(() => {
        return validationHistory
            .filter(item => {
                const term = searchTerm.toLowerCase();
                return item.customer.toLowerCase().includes(term) ||
                       item.quoteNumber.toLowerCase().includes(term) ||
                       item.factura.toLowerCase().includes(term);
            })
             .filter(item => {
                const itemDate = new Date(item.validationDate);
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
                
                return matchesDate;
            })
            .filter(item => {
                if (activeTab === 'todas') return true;
                const typeMatch = activeTab === 'reservas' ? 'Reserva' : 'Despacho';
                if (activeTab === 'reservas' || activeTab === 'despachos') return item.type === typeMatch;
                return item.status.toLowerCase() === activeTab;
            });
    }, [validationHistory, searchTerm, date, activeTab]);

    const getStatusBadgeVariant = (status: ValidatedItem['status']) => {
        switch (status) {
            case 'Validada': return 'success';
            case 'Rechazada': return 'destructive';
        }
    }
    
     const handleExportPDF = async () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Latin Store House', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Historial de Validaciones", 14, 30);


        doc.autoTable({
          startY: 35,
          head: [
            ['Tipo', '# Cotización', 'Factura #', 'Cliente', 'Estado', 'Validado Por', 'Fecha Validación']
          ],
          body: filteredHistory.map(item => [
            item.type,
            item.quoteNumber,
            item.factura,
            item.customer,
            item.status,
            item.validatedBy,
            item.validationDate,
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
        
        doc.save('Historial de Validaciones.pdf');
    };

    const handleExportXLSX = () => {
        const dataToExport = filteredHistory.map(item => ({
            'Tipo': item.type,
            '# Cotización': item.quoteNumber,
            'Factura #': item.factura,
            'Cliente': item.customer,
            'Estado': item.status,
            'Validado Por': item.validatedBy,
            'Fecha Validación': item.validationDate,
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Validaciones");
        XLSX.writeFile(wb, "Historial de Validaciones.xlsx");
    };


  return (
    <div className="space-y-6">
        <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Validación de Contaduría</CardTitle>
                <CardDescription>
                Revise y apruebe las solicitudes pendientes de reservas y despachos.
                </CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="reservations" className="w-full">
            <TabsList>
                <TabsTrigger value="reservations">Reservas Pendientes ({pendingReservations.length})</TabsTrigger>
                <TabsTrigger value="dispatches">Despachos Pendientes ({pendingDispatches.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="reservations">
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Asesor</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pendingReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                        <TableCell>{reservation.quoteNumber}</TableCell>
                        <TableCell>{reservation.customer}</TableCell>
                        <TableCell>{reservation.product}</TableCell>
                        <TableCell>{reservation.quantity}</TableCell>
                        <TableCell>{reservation.sourceId}</TableCell>
                        <TableCell>{reservation.advisor}</TableCell>
                        <TableCell>
                            <Input 
                                value={reservation.factura}
                                onChange={(e) => handleInvoiceChange(reservation.id, e.target.value, 'reservation')}
                                placeholder="Ingrese factura..."
                                disabled={!canValidate}
                            />
                        </TableCell>
                        <TableCell className="text-right">
                            {canValidate && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(reservation, 'Validada')} disabled={!reservation.factura}>
                                        <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(reservation, 'Rechazada')} disabled={!reservation.factura}>
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    {pendingReservations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                No hay reservas pendientes de validación.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="dispatches">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pendingDispatches.map((dispatch) => (
                        <TableRow key={dispatch.id}>
                            <TableCell>{dispatch.cotizacion}</TableCell>
                            <TableCell>{dispatch.cliente}</TableCell>
                            <TableCell>{dispatch.vendedor}</TableCell>
                            <TableCell>
                                <Input 
                                    value={dispatch.factura}
                                    onChange={(e) => handleInvoiceChange(String(dispatch.id), e.target.value, 'dispatch')}
                                    placeholder="Ingrese factura..."
                                    disabled={!canValidate}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                {canValidate && (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDispatchValidation(dispatch, 'Validada')} disabled={!dispatch.factura}>
                                            <Check className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDispatchValidation(dispatch, 'Rechazada')} disabled={!dispatch.factura}>
                                            <X className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {pendingDispatches.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No hay despachos pendientes de validación.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </TabsContent>
           </Tabs>
        </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Historial de Validaciones</CardTitle>
                        <CardDescription>Busque y filtre a través de todas las validaciones completadas.</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Historial
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportPDF}>Descargar como PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportXLSX}>Descargar como XLSX</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente, cotización o factura..."
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
                            "w-full sm:w-[300px] justify-start text-left font-normal",
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
                    <Tabs defaultValue="todas" onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:inline-flex">
                            <TabsTrigger value="todas">Todas</TabsTrigger>
                            <TabsTrigger value="reservas">Reservas</TabsTrigger>
                            <TabsTrigger value="despachos">Despachos</TabsTrigger>
                            <TabsTrigger value="validada">Validadas</TabsTrigger>
                            <TabsTrigger value="rechazada">Rechazadas</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Validado Por</TableHead>
                        <TableHead>Fecha Validación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                          <TableCell>{item.quoteNumber}</TableCell>
                          <TableCell>{item.factura}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>{item.validatedBy}</TableCell>
                          <TableCell>{item.validationDate}</TableCell>
                        </TableRow>
                      ))}
                      {filteredHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No se encontraron registros en el historial.
                            </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
