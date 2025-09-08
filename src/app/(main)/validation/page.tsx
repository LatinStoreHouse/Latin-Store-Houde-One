

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
import type { DispatchData } from '@/app/(main)/orders/page';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Utility function to safely get base64 from an image
const getImageBase64 = (src: string): Promise<{ base64: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve({ base64: dataURL, width: img.width, height: img.height });
            } catch (e) {
                console.error("Error converting canvas to data URL", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image for PDF conversion:", src, e);
            resolve(null); // Resolve with null if the image fails to load
        };
    });
};

const addPdfHeader = async (doc: jsPDF) => {
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    if (latinLogoData) {
        const logoWidth = 25;
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        doc.addImage(latinLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Latin Store House S.A.S', pageWidth - 14, 15, { align: 'right' });
    doc.text('NIT: 901.401.708-1', pageWidth - 14, 19, { align: 'right' });
};


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

export const initialPendingDispatches: DispatchData[] = [
    { id: 1, cotizacion: 'COT-001', cliente: 'ConstruCali', vendedor: 'John Doe', products: [{name: 'Cut stone', quantity: 10, origin: 'Bodega'}, {name: 'Adhesivo', quantity: 5, origin: 'Bodega'}], fechaSolicitud: '2024-07-28', ciudad: 'Cali', direccion: 'Calle Falsa 123', remision: 'REM-001', observacion: '', rutero: 'Transportadora', fechaDespacho: '', guia: '', convencion: 'Prealistamiento de pedido' },
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
    const { inventoryData, setInventoryData, reservations, setReservations, dispatchReservation, dispatchDirectFromInventory, addNotification } = context;

    const [pendingDispatches, setPendingDispatches] = useState(initialPendingDispatches);
    const [validationHistory, setValidationHistory] = useState<ValidatedItem[]>(initialHistory);
    const [facturaNumbers, setFacturaNumbers] = useState<Record<string, string>>({});
    const [bulkFacturaNumber, setBulkFacturaNumber] = useState('');
    const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
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


    const handleReservationValidation = (reservationsToValidate: Reservation[], newStatus: 'Validada' | 'Rechazada', invoice: string) => {
        if (!invoice && newStatus === 'Validada') {
            toast({ variant: 'destructive', title: 'Error', description: 'Se requiere un número de factura para validar.' });
            return;
        }

        const updatedReservations = [...reservations];
        const newHistoryEntries: ValidatedItem[] = [];
        let inventoryUpdateSuccessful = true;

        const inventoryUpdates = (currentInventory: typeof inventoryData) => {
            const newInventory = JSON.parse(JSON.stringify(currentInventory));

            for (const reservation of reservationsToValidate) {
                if (newStatus === 'Validada' && (reservation.source === 'Bodega' || reservation.source === 'Zona Franca')) {
                    const location = findProductLocation(reservation.product);
                    if (location) {
                        const { brand, subCategory } = location;
                        const productToUpdate = newInventory[brand][subCategory][reservation.product];
                        
                        if (reservation.source === 'Bodega') {
                            productToUpdate.separadasBodega += reservation.quantity;
                        } else {
                            productToUpdate.separadasZonaFranca += reservation.quantity;
                        }
                    } else {
                        toast({ variant: 'destructive', title: 'Error de Inventario', description: `No se pudo encontrar el producto "${reservation.product}" para actualizar el stock.` });
                        inventoryUpdateSuccessful = false;
                        break; 
                    }
                }
            }
            return inventoryUpdateSuccessful ? newInventory : currentInventory;
        }

        setInventoryData(inventoryUpdates, currentUser);

        if (!inventoryUpdateSuccessful) return;

        for (const reservation of reservationsToValidate) {
             const index = updatedReservations.findIndex(r => r.id === reservation.id);
             if (index !== -1) {
                updatedReservations[index] = { ...updatedReservations[index], status: newStatus };
             }

            newHistoryEntries.push({
                id: reservation.id,
                quoteNumber: reservation.quoteNumber,
                customer: reservation.customer,
                advisor: reservation.advisor,
                status: newStatus,
                validatedBy: currentUser.name,
                validationDate: new Date().toISOString().split('T')[0],
                factura: invoice || 'N/A',
                type: 'Reserva',
            });
            
             // Notify the advisor
            addNotification({
                title: `Reserva ${newStatus}`,
                message: `Tu reserva para "${reservation.product}" (${reservation.quoteNumber}) fue ${newStatus.toLowerCase()}${newStatus === 'Validada' ? `. Factura: ${invoice}` : '.'}`,
                user: reservation.advisor,
                href: '/reservations'
            });
        }
        
        setReservations(updatedReservations);
        setValidationHistory(prevHistory => [...newHistoryEntries, ...prevHistory]);
        setSelectedReservations([]);
        setBulkFacturaNumber('');

        toast({ title: 'Éxito', description: `${reservationsToValidate.length} reserva(s) han sido ${newStatus.toLowerCase()}s.` });
    };

    const handleBulkValidate = (status: 'Validada' | 'Rechazada') => {
        const reservationsToProcess = pendingReservations.filter(r => selectedReservations.includes(r.id));
        if (reservationsToProcess.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay reservaciones seleccionadas.' });
            return;
        }
        handleReservationValidation(reservationsToProcess, status, bulkFacturaNumber);
    }
    
    const handleDispatchValidation = (dispatch: DispatchData, newStatus: 'Validada' | 'Rechazada') => {
        const factura = facturaNumbers[`dispatch-${dispatch.id}`];
        if (!factura && newStatus === 'Validada') {
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
            factura: factura || 'N/A',
            type: 'Despacho',
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);
    
        if (newStatus === 'Validada') {
            try {
                // Check if a reservation exists for this quote
                const existingReservation = reservations.find(r => r.quoteNumber === dispatch.cotizacion && r.status === 'Validada');
                
                if (existingReservation) {
                    dispatchReservation(dispatch.cotizacion);
                    toast({ title: 'Éxito', description: `Despacho para ${dispatch.cotizacion} validado. Stock descontado de la reserva.` });
                } else {
                    // No reservation found, dispatch directly from inventory
                    if (dispatch.products.length === 0) {
                        toast({ variant: 'destructive', title: 'Error de Despacho', description: `La solicitud ${dispatch.cotizacion} no tiene productos para despachar.` });
                        // Re-add the dispatch to the pending list as it failed
                        setPendingDispatches(prev => [dispatch, ...prev]);
                        setValidationHistory(prev => prev.filter(h => h.id !== `DIS-${dispatch.id}`));
                        return;
                    }
                    dispatchDirectFromInventory(dispatch.products);
                    toast({ title: 'Éxito', description: `Despacho para ${dispatch.cotizacion} validado. Stock descontado directamente de bodega.` });
                }

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error de Inventario', description: error.message });
                 // Re-add the dispatch to the pending list as it failed
                setPendingDispatches(prev => [dispatch, ...prev]);
                setValidationHistory(prev => prev.filter(h => h.id !== `DIS-${dispatch.id}`));
            }
        }
        
        addNotification({
            title: `Despacho ${newStatus}`,
            message: `El despacho para "${dispatch.cliente}" (${dispatch.cotizacion}) fue ${newStatus.toLowerCase()}. Factura: ${factura}.`,
            user: dispatch.vendedor,
            href: '/orders'
        });
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

    const handleSelectReservation = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedReservations(prev => [...prev, id]);
        } else {
            setSelectedReservations(prev => prev.filter(resId => resId !== id));
        }
    }

    const handleSelectAllReservations = (checked: boolean) => {
        if (checked) {
            setSelectedReservations(pendingReservations.map(r => r.id));
        } else {
            setSelectedReservations([]);
        }
    }
    
     const handleExportPDF = async () => {
        const doc = new jsPDF({ format: 'letter' });
        
        await addPdfHeader(doc);
        
        doc.setFontSize(14);
        doc.text("Historial de Validaciones", 14, 45);


        doc.autoTable({
          startY: 50,
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
                 {selectedReservations.length > 0 && (
                    <div className="my-4 p-4 border rounded-lg bg-muted/50 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1">
                            <Label htmlFor="bulk-invoice" className="font-semibold">
                                Validar {selectedReservations.length} {selectedReservations.length === 1 ? 'reserva seleccionada' : 'reservas seleccionadas'}
                            </Label>
                             <p className="text-sm text-muted-foreground">Asigne una factura y valide en lote.</p>
                        </div>
                        <div className="flex w-full sm:w-auto items-center gap-2">
                             <Input 
                                id="bulk-invoice"
                                value={bulkFacturaNumber}
                                onChange={(e) => setBulkFacturaNumber(e.target.value)}
                                placeholder="Ingrese factura..."
                                className="w-full sm:w-auto bg-background"
                            />
                            <Button size="sm" onClick={() => handleBulkValidate('Validada')} disabled={!bulkFacturaNumber}>
                                <Check className="h-4 w-4 mr-2" /> Validar
                            </Button>
                             <Button size="sm" variant="destructive" onClick={() => handleBulkValidate('Rechazada')}>
                                <X className="h-4 w-4 mr-2" /> Rechazar
                            </Button>
                        </div>
                    </div>
                 )}
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox 
                                onCheckedChange={(checked) => handleSelectAllReservations(Boolean(checked))}
                                checked={pendingReservations.length > 0 && selectedReservations.length === pendingReservations.length}
                                aria-label="Seleccionar todo"
                            />
                        </TableHead>
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
                    {pendingReservations.map((reservation) => {
                        const singleReservationArray = [reservation];
                        return (
                        <TableRow key={reservation.id}>
                        <TableCell>
                             <Checkbox 
                                onCheckedChange={(checked) => handleSelectReservation(reservation.id, Boolean(checked))}
                                checked={selectedReservations.includes(reservation.id)}
                                aria-label={`Seleccionar reserva ${reservation.quoteNumber}`}
                            />
                        </TableCell>
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
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(singleReservationArray, 'Validada', facturaNumbers[reservation.id] || '')} disabled={!facturaNumbers[reservation.id]}>
                                        <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReservationValidation(singleReservationArray, 'Rechazada', facturaNumbers[reservation.id] || 'N/A')}>
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                        </TableRow>
                    )})}
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
                        <TableHead>Productos</TableHead>
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
                                {dispatch.products.map(p => `${p.quantity}x ${p.name}`).join(', ')}
                            </TableCell>
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
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDispatchValidation(dispatch, 'Rechazada')}>
                                            <X className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {pendingDispatches.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
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
