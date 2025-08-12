'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  containerId: string;
  advisor: string;
  quoteNumber: string;
  status: 'En espera de validación' | 'Validada' | 'Rechazada';
  source: 'Contenedor' | 'Bodega';
}

// Mock data, in real app this would come from the transit page/state
const productsInTransit = [
    { value: 'CUT STONE 120 X 60', label: 'CUT STONE 120 X 60', available: 200, containerId: 'MSCU1234567' },
    { value: 'TRAVERTINO', label: 'TRAVERTINO', available: 150, containerId: 'MSCU1234567' },
    { value: 'BLACK 1.22 X 0.61', label: 'BLACK 1.22 X 0.61', available: 500, containerId: 'CMAU7654321' },
];

// Mock data from inventory
const productsInStock = [
    { value: 'CONCRETO ENCOFRADO', label: 'CONCRETO ENCOFRADO', available: 77 },
    { value: 'TAPIA NEGRA', label: 'TAPIA NEGRA', available: 23 },
    { value: 'ADHESIVO TRASLUCIDO', label: 'ADHESIVO TRASLUCIDO', available: 87 },
];

const initialReservations: Reservation[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, containerId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'En espera de validación', source: 'Contenedor' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [reservationSource, setReservationSource] = useState<'Contenedor' | 'Bodega'>('Contenedor');
  const { toast } = useToast();

  const productOptions = useMemo(() => {
    if (reservationSource === 'Contenedor') {
        return productsInTransit;
    }
    return productsInStock.map(p => ({ ...p, containerId: 'Bodega' }));
  }, [reservationSource]);

  const handleCreateReservation = () => {
    if (!customerName || !productName || quantity <= 0 || !quoteNumber) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos.'});
        return;
    }

    const productInfo = productOptions.find(p => p.value === productName);
    if (!productInfo) {
        toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.'});
        return;
    }

    const newReservation: Reservation = {
        id: `RES-00${reservations.length + 1}`,
        customer: customerName,
        product: productName,
        quantity,
        containerId: productInfo.containerId,
        advisor: 'Usuario Admin', // Mock current user
        quoteNumber: quoteNumber,
        status: 'En espera de validación',
        source: reservationSource,
    };

    setReservations([...reservations, newReservation]);
    setCustomerName('');
    setProductName('');
    setQuantity(0);
    setQuoteNumber('');
    setIsNewReservationDialogOpen(false);
    toast({ title: 'Éxito', description: 'Reserva creada y pendiente de validación.' });
  };
  
  const filteredReservations = reservations.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getSelectedProductInfo = () => {
    if (!productName) return null;
    const product = productOptions.find(p => p.value === productName);
    if (!product) return null;

    if (reservationSource === 'Contenedor') {
        return `Disponible: ${product.available} en Contenedor ${product.containerId}`;
    }
    return `Disponible: ${product.available} en Bodega`;
  };
  
  const getStatusBadgeVariant = (status: Reservation['status']) => {
    switch (status) {
        case 'Validada': return 'default';
        case 'En espera de validación': return 'secondary';
        case 'Rechazada': return 'destructive';
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas de Productos</CardTitle>
            <CardDescription>Cree y gestione las reservas de productos en tránsito o en bodega.</CardDescription>
          </div>
          <Dialog open={isNewReservationDialogOpen} onOpenChange={setIsNewReservationDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Reserva
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Crear Nueva Reserva</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label>Origen del Producto</Label>
                        <RadioGroup value={reservationSource} onValueChange={(value) => setReservationSource(value as 'Contenedor' | 'Bodega')} className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Contenedor" id="source-container" />
                            <Label htmlFor="source-container">Contenedor en Tránsito</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Bodega" id="source-warehouse" />
                            <Label htmlFor="source-warehouse">Inventario de Bodega</Label>
                          </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label># Cotización</Label>
                        <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="ej. COT-2024-001" />
                    </div>
                    <div className="space-y-2">
                        <Label>Nombre del Cliente</Label>
                        <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={productName}
                            onValueChange={setProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontraron productos"
                        />
                        <p className="text-sm text-muted-foreground">{getSelectedProductInfo()}</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleCreateReservation}>Crear Reserva</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por cliente, producto o cotización..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.quoteNumber}</TableCell>
                  <TableCell>{reservation.customer}</TableCell>
                  <TableCell>{reservation.product}</TableCell>
                  <TableCell>{reservation.quantity}</TableCell>
                  <TableCell>{reservation.source === 'Contenedor' ? reservation.containerId : 'Bodega'}</TableCell>
                  <TableCell>{reservation.advisor}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                        {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReservations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No se encontraron reservas.
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
