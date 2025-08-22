'use client';

import React, { useState, useMemo, useContext } from 'react';
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
import { useUser } from '@/app/(main)/layout';
import { InventoryContext, Reservation } from '@/context/inventory-context';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
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

export const initialPendingDispatches: PendingDispatch[] = [
    { id: 1, cotizacion: 'COT-001', cliente: 'ConstruCali', vendedor: 'John Doe', factura: '' },
]

const initialHistory: ValidatedItem[] = [
    { id: 'RES-003', quoteNumber: 'COT-2024-003', customer: 'Hogar Futuro', advisor: 'Jane Smith', status: 'Validada', validatedBy: 'Carlos Ruiz', validationDate: '2024-07-28', factura: 'FAC-001', type: 'Reserva' },
    { id: 'RES-004', quoteNumber: 'COT-2024-004', customer: 'Arquitectura Andina', advisor: 'John Doe', status: 'Rechazada', validatedBy: 'Usuario Admin', validationDate: '2024-07-27', factura: 'FAC-002', type: 'Reserva' },
    { id: 'DIS-001', quoteNumber: 'COT-002', customer: 'Diseños Modernos SAS', advisor: 'Jane Smith', status: 'Validada', validatedBy: 'Usuario Admin', validationDate: '2024-07-29', factura: 'FAC-201', type: 'Despacho' },
]

const TabTriggerWithIndicator = ({ value, hasAlert, children }: { value: string, hasAlert: boolean, children: React.ReactNode }) => {
    return (
        <TabsTrigger value={value} className="relative">
            {children}
            {hasAlert && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />}
        </TabsTrigger>
    );
};


export default function ValidationPage() {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('ValidationPage must be used within an InventoryProvider');
    }
    const { inventoryData, setInventoryData, reservations, setReservations, dispatchReservation } = context;

    const [pendingDispatches, setPendingDispatches] = useState(initialPendingDispatches);
    const [validationHistory, setValidationHistory] = useState<ValidatedItem[]>(initialHistory);
    const [facturaNumbers, setFacturaNumbers] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('todas');
    const { toast } = useToast();
    const { currentUser } = useUser();

    const canValidate = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador');

    const pendingReservations = useMemo(() => {
        return reservations.filter(r => r.status === 'En espera de validación');
    }, [reservations]);
    
    const handleInvoiceChange = (id: string, value: string) => {
        setFacturaNumbers(prev => ({ ...prev, [id]: value }));
    };

    const findProductLocation = (productName: string) => {
        for (const brand in inventoryData) {
            for (const subCategory in inventoryData[brand as keyof typeof inventoryData]) {
                if (inventoryData[brand as keyof typeof inventoryData][subCategory][productName]) {
                    return { brand, subCategory };
                }
            }
        }
        return null;
    };


    const handleReservationValidation = (reservation: Reservation, newStatus: 'Validada' | 'Rechazada') => {
        const factura = facturaNumbers[reservation.id];
        if (!factura) {
            toast({ variant: 'destructive', title: 'Error', description: 'Se requiere un número de factura para validar.' });
            return;
        }

        // If validated, update the inventory's "separadas" count
        if (newStatus === 'Validada' && (reservation.source === 'Bodega' || reservation.source === 'Zona Franca')) {
            const location = findProductLocation(reservation.product);
            if(location) {
                const { brand, subCategory } = location;
                setInventoryData(prevData => {
                    const newData = JSON.parse(JSON.stringify(prevData));
                    const productToUpdate = newData[brand][subCategory][reservation.product];
                    
                    if (reservation.source === 'Bodega') {
                        productToUpdate.separadasBodega += reservation.quantity;
                    } else {
                        productToUpdate.separadasZonaFranca += reservation.quantity;
                    }
                    return newData;
                });
            } else {
                 toast({ variant: 'destructive', title: 'Error de Inventario', description: `No se pudo encontrar el producto "${reservation.product}" para actualizar el stock.` });
                 return;
            }
        }


        // Update global reservation state
        setReservations(prev => 
            prev.map(r => r.id === reservation.id ? { ...r, status: newStatus } : r)
        );
        
        const newHistoryEntry: ValidatedItem = {
            id: reservation.id,
            quoteNumber: reservation.quoteNumber,
            customer: reservation.customer,
            advisor: reservation.advisor,
            status: newStatus,
            validatedBy: currentUser.name,
            validationDate: new Date().toISOString().split('T')[0],
            factura,
            type: 'Reserva',
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);

        toast({ title: 'Éxito', description: `Reserva ${reservation.quoteNumber} ha sido ${newStatus.toLowerCase()}.` });
    };
    
    const handleDispatchValidation = (dispatch: PendingDispatch, newStatus: 'Validada' | 'Rechazada') => {
        const factura = facturaNumbers[`dispatch-${dispatch.id}`];
        if (!factura) {
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
            factura,
            type: 'Despacho',
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);
    
        if (newStatus === 'Validada') {
            try {
                dispatchReservation(dispatch.cotizacion);
                toast({ title: 'Éxito', description: `Despacho para ${dispatch.cotizacion} ha sido validado y la reserva ha sido descontada.` });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error de Inventario', description: error.message });
            }
        } else {
            toast({ title: 'Éxito', description: `Despacho para ${dispatch.cotizacion} ha sido ${newStatus.toLowerCase()}.` });
        }
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
                <TabTriggerWithIndicator value="reservations" hasAlert={pendingReservations.length > 0}>
                    Reservas Pendientes ({pendingReservations.length})
                </TabTriggerWithIndicator>
                <TabTriggerWithIndicator value="dispatches" hasAlert={pendingDispatches.length > 0}>
                    Despachos Pendientes ({pendingDispatches.length})
                </TabTriggerWithIndicator>
            </TabsList>
            <TabsContent value="reservations">
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Asesor</TableHead>
                        <TableHead>Vence</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pendingReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                        <TableCell>{reservation.quoteNumber}</TableCell>
                        <TableCell>{reservation.customer}</TableCell>
                        <TableCell>
                            {reservation.product} ({reservation.quantity} u.)
                            <p className="text-xs text-muted-foreground">Origen: {reservation.sourceId}</p>
                        </TableCell>
                        <TableCell>{reservation.advisor}</TableCell>
                        <TableCell>{reservation.expirationDate || 'Sin Vencimiento'}</TableCell>
                        <TableCell>
                            <Input 
                                value={facturaNumbers[reservation.id] || ''}
                                onChange={(e) => handleInvoiceChange(reservation.id, e.target.value)}
                                placeholder="Ingrese factura..."
                                disabled={!canValidate}
                            />
                        </TableCell>
                        <TableCell className="text-right">
                            {canValidate && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(reservation, 'Validada')} disabled={!facturaNumbers[reservation.id]}>
                                        <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(reservation, 'Rechazada')} disabled={!facturaNumbers[reservation.id]}>
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    {pendingReservations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                                    value={facturaNumbers[`dispatch-${dispatch.id}`] || ''}
                                    onChange={(e) => handleInvoiceChange(`dispatch-${dispatch.id}`, e.target.value)}
                                    placeholder="Ingrese factura..."
                                    disabled={!canValidate}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                {canValidate && (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDispatchValidation(dispatch, 'Validada')} disabled={!facturaNumbers[`dispatch-${dispatch.id}`]}>
                                            <Check className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDispatchValidation(dispatch, 'Rechazada')} disabled={!facturaNumbers[`dispatch-${dispatch.id}`]}>
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
