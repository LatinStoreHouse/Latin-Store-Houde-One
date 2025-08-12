'use client';
import React, { useState } from 'react';
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

interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  containerId: string;
  advisor: string;
}

// Mock data, in real app this would come from the transit page/state
const productsInTransit = [
    { value: 'CUT STONE 120 X 60', label: 'CUT STONE 120 X 60', available: 200, containerId: 'MSCU1234567' },
    { value: 'TRAVERTINO', label: 'TRAVERTINO', available: 150, containerId: 'MSCU1234567' },
    { value: 'BLACK 1.22 X 0.61', label: 'BLACK 1.22 X 0.61', available: 500, containerId: 'CMAU7654321' },
];

const initialReservations: Reservation[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, containerId: 'MSCU1234567', advisor: 'Jane Smith' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleCreateReservation = () => {
    if (!customerName || !productName || quantity <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos.'});
        return;
    }

    const productInTransit = productsInTransit.find(p => p.value === productName);
    if (!productInTransit) {
        toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado en tránsito.'});
        return;
    }

    const newReservation: Reservation = {
        id: `RES-00${reservations.length + 1}`,
        customer: customerName,
        product: productName,
        quantity,
        containerId: productInTransit.containerId,
        advisor: 'Usuario Admin', // Mock current user
    };

    setReservations([...reservations, newReservation]);
    setCustomerName('');
    setProductName('');
    setQuantity(0);
    setIsNewReservationDialogOpen(false);
    toast({ title: 'Éxito', description: 'Reserva creada correctamente.' });
  };

  const filteredReservations = reservations.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas de Contenedores</CardTitle>
            <CardDescription>Cree y gestione las reservas de productos en tránsito.</CardDescription>
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
                        <Label>Nombre del Cliente</Label>
                        <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productsInTransit}
                            value={productName}
                            onValueChange={setProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontraron productos"
                        />
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
                        placeholder="Buscar por cliente o producto..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Reserva</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Contenedor</TableHead>
                <TableHead>Asesor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.id}</TableCell>
                  <TableCell>{reservation.customer}</TableCell>
                  <TableCell>{reservation.product}</TableCell>
                  <TableCell>{reservation.quantity}</TableCell>
                  <TableCell>{reservation.containerId}</TableCell>
                  <TableCell>{reservation.advisor}</TableCell>
                </TableRow>
              ))}
              {filteredReservations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
