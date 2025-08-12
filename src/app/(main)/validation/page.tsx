'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/roles';

// Mock data that would come from a global state or API
interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  containerId: string;
  advisor: string;
  quoteNumber: string;
  status: 'En espera de validación' | 'Validada' | 'Rechazada';
}

const initialReservations: Reservation[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, containerId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'En espera de validación' },
    { id: 'RES-002', customer: 'Diseños SAS', product: 'BLACK 1.22 X 0.61', quantity: 100, containerId: 'CMAU7654321', advisor: 'John Doe', quoteNumber: 'COT-2024-002', status: 'En espera de validación' },
];

const currentUserRole: Role = 'Administrador';

export default function ValidationPage() {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations.filter(r => r.status === 'En espera de validación'));
    const { toast } = useToast();

    const canValidate = currentUserRole === 'Administrador' || currentUserRole === 'Contador';

    const handleValidation = (reservationId: string, newStatus: 'Validada' | 'Rechazada') => {
        // In a real app, this would also update the global state/API
        setReservations(reservations.filter(r => r.id !== reservationId));
        toast({ title: 'Éxito', description: `Reserva ${newStatus.toLowerCase()}.` });
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckSquare className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Validación de Contaduría</CardTitle>
            <CardDescription>
              Revise y apruebe las reservas y otras solicitudes pendientes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
         <Card>
            <CardHeader>
                <CardTitle>Reservas Pendientes</CardTitle>
                <CardDescription>Reservas de contenedores que necesitan aprobación.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Contenedor</TableHead>
                        <TableHead>Asesor</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>{reservation.quoteNumber}</TableCell>
                          <TableCell>{reservation.customer}</TableCell>
                          <TableCell>{reservation.product}</TableCell>
                          <TableCell>{reservation.quantity}</TableCell>
                          <TableCell>{reservation.containerId}</TableCell>
                          <TableCell>{reservation.advisor}</TableCell>
                          <TableCell className="text-right">
                            {canValidate && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleValidation(reservation.id, 'Validada')}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleValidation(reservation.id, 'Rechazada')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {reservations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No hay reservas pendientes de validación.
                            </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      </CardContent>
    </Card>
  );
}
