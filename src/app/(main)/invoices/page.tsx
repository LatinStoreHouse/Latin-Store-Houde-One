'use client';

import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar as CalendarIcon, Download, ChevronDown, Receipt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/roles';
import { Input } from '@/components/ui/input';
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

interface Invoice {
    id: string;
    quoteNumber: string;
    customer: string;
    advisor: string;
    status: 'Validada' | 'Rechazada';
    validationDate: string;
    factura: string;
    type: 'Reserva' | 'Despacho';
}

const initialHistory: Invoice[] = [
    { id: 'RES-003', quoteNumber: 'COT-2024-003', customer: 'Hogar Futuro', advisor: 'Jane Smith', status: 'Validada', validationDate: '2024-07-28', factura: 'FAC-001', type: 'Reserva' },
    { id: 'DIS-001', quoteNumber: 'COT-002', customer: 'Diseños Modernos SAS', advisor: 'Jane Smith', status: 'Validada', validationDate: '2024-07-29', factura: 'FAC-201', type: 'Despacho' },
    { id: 'COT-001', quoteNumber: 'COT-001', customer: 'ConstruCali', advisor: 'John Doe', status: 'Validada', validationDate: '2024-07-30', factura: 'FAC-202', type: 'Despacho' },
]

// This is a mocked current user. In a real app, this would come from an auth context.
// Change role to 'Asesor de Ventas' to see the filtering in action.
const currentUser = {
    name: 'Admin Latin',
    role: 'Administrador' as Role, // or 'Asesor de Ventas'
    // name: 'Jane Smith', 
    // role: 'Asesor de Ventas' as Role,
}

export default function InvoicesPage() {
    const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>(initialHistory);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>(undefined);

    const filteredHistory = useMemo(() => {
        let history = invoiceHistory;

        // Filter by current user's name if they are not an administrator
        if (currentUser.role !== 'Administrador') {
            history = history.filter(item => item.advisor === currentUser.name);
        }

        return history
            .filter(item => {
                const term = searchTerm.toLowerCase();
                return item.customer.toLowerCase().includes(term) ||
                       item.quoteNumber.toLowerCase().includes(term) ||
                       item.factura.toLowerCase().includes(term);
            })
             .filter(item => {
                if (!date?.from) return true; // No date filter applied
                const itemDate = new Date(item.validationDate);
                const fromDate = new Date(date.from);
                const toDate = date.to ? new Date(date.to) : new Date(date.from);
                
                // Adjust to include the whole day
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);

                return itemDate >= fromDate && itemDate <= toDate;
            });
    }, [invoiceHistory, searchTerm, date]);

    const getStatusBadgeVariant = (status: Invoice['status']) => {
        switch (status) {
            case 'Validada': return 'success';
            case 'Rechazada': return 'destructive';
            default: return 'secondary';
        }
    }
    
     const handleExportPDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Latin Store House', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Historial de Cotizaciones", 14, 30);


        doc.autoTable({
          startY: 35,
          head: [
            ['# Cotización', 'Factura #', 'Cliente', 'Asesor', 'Estado', 'Fecha Validación']
          ],
          body: filteredHistory.map(item => [
            item.quoteNumber,
            item.factura,
            item.customer,
            item.advisor,
            item.status,
            item.validationDate,
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
        
        doc.save('Historial de Cotizaciones.pdf');
    };

    const handleExportXLSX = () => {
        const dataToExport = filteredHistory.map(item => ({
            '# Cotización': item.quoteNumber,
            'Factura #': item.factura,
            'Cliente': item.customer,
            'Asesor': item.advisor,
            'Estado': item.status,
            'Fecha Validación': item.validationDate,
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Facturas");
        XLSX.writeFile(wb, "Historial de Cotizaciones.xlsx");
    };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Receipt className="h-6 w-6" /> Historial de Cotizaciones
                        </CardTitle>
                        <CardDescription>Busque y filtre a través de todas sus cotizaciones facturadas.</CardDescription>
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
                </div>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead>Cliente</TableHead>
                        {currentUser.role === 'Administrador' && <TableHead>Asesor</TableHead>}
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Validación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.quoteNumber}</TableCell>
                          <TableCell>{item.factura}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          {currentUser.role === 'Administrador' && <TableCell>{item.advisor}</TableCell>}
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>{item.validationDate}</TableCell>
                        </TableRow>
                      ))}
                      {filteredHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={currentUser.role === 'Administrador' ? 6 : 5} className="text-center text-muted-foreground">
                                No se encontraron facturas.
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
