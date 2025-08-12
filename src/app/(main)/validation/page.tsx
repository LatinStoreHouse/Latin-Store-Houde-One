'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Check, X, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface ValidatedReservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  containerId: string;
  advisor: string;
  quoteNumber: string;
  status: 'Validada' | 'Rechazada';
  validatedBy: string;
  validationDate: string;
}

interface PendingReservation {
  id: string;
  customer: string;

  product: string;
  quantity: number;
  containerId: string;
  advisor: string;
  quoteNumber: string;
  status: 'En espera de validación';
}

const initialPendingReservations: PendingReservation[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, containerId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'En espera de validación' },
    { id: 'RES-002', customer: 'Diseños SAS', product: 'BLACK 1.22 X 0.61', quantity: 100, containerId: 'CMAU7654321', advisor: 'John Doe', quoteNumber: 'COT-2024-002', status: 'En espera de validación' },
];

const initialHistory: ValidatedReservation[] = [
    { id: 'RES-003', customer: 'Hogar Futuro', product: 'TRAVERTINO', quantity: 20, containerId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-003', status: 'Validada', validatedBy: 'Carlos Ruiz', validationDate: '2024-07-28' },
    { id: 'RES-004', customer: 'Arquitectura Andina', product: 'BLACK 1.22 X 0.61', quantity: 75, containerId: 'CMAU7654321', advisor: 'John Doe', quoteNumber: 'COT-2024-004', status: 'Rechazada', validatedBy: 'Usuario Admin', validationDate: '2024-07-27' },
]

const currentUser = {
    name: 'Usuario Admin',
    role: 'Administrador' as Role,
}

export default function ValidationPage() {
    const [pendingReservations, setPendingReservations] = useState<PendingReservation[]>(initialPendingReservations);
    const [validationHistory, setValidationHistory] = useState<ValidatedReservation[]>(initialHistory);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('todas');
    const { toast } = useToast();

    const canValidate = currentUser.role === 'Administrador' || currentUser.role === 'Contador';

    const handleValidation = (reservation: PendingReservation, newStatus: 'Validada' | 'Rechazada') => {
        setPendingReservations(pendingReservations.filter(r => r.id !== reservation.id));
        
        const newHistoryEntry: ValidatedReservation = {
            ...reservation,
            status: newStatus,
            validatedBy: currentUser.name,
            validationDate: new Date().toISOString().split('T')[0],
        };
        setValidationHistory([newHistoryEntry, ...validationHistory]);

        toast({ title: 'Éxito', description: `Reserva ${reservation.quoteNumber} ha sido ${newStatus.toLowerCase()}.` });
    };

    const filteredHistory = useMemo(() => {
        return validationHistory
            .filter(item => {
                const term = searchTerm.toLowerCase();
                return item.customer.toLowerCase().includes(term) ||
                       item.product.toLowerCase().includes(term) ||
                       item.quoteNumber.toLowerCase().includes(term);
            })
            .filter(item => {
                if (activeTab === 'todas') return true;
                return item.status.toLowerCase() === activeTab;
            });
    }, [validationHistory, searchTerm, activeTab]);

    const getStatusBadgeVariant = (status: ValidatedReservation['status']) => {
        switch (status) {
            case 'Validada': return 'default';
            case 'Rechazada': return 'destructive';
        }
    }


  return (
    <div className="space-y-6">
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
                        {pendingReservations.map((reservation) => (
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
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleValidation(reservation, 'Validada')}>
                                            <Check className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleValidation(reservation, 'Rechazada')}>
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
                </CardContent>
            </Card>
        </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Historial de Validaciones</CardTitle>
                <CardDescription>Busque y filtre a través de todas las validaciones completadas.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente, producto o cotización..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Tabs defaultValue="todas" onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList>
                            <TabsTrigger value="todas">Todas</TabsTrigger>
                            <TabsTrigger value="validada">Validadas</TabsTrigger>
                            <TabsTrigger value="rechazada">Rechazadas</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead># Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Validado Por</TableHead>
                        <TableHead>Fecha Validación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>{reservation.quoteNumber}</TableCell>
                          <TableCell>{reservation.customer}</TableCell>
                          <TableCell>{reservation.product}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(reservation.status)}>{reservation.status}</Badge>
                          </TableCell>
                          <TableCell>{reservation.validatedBy}</TableCell>
                          <TableCell>{reservation.validationDate}</TableCell>
                        </TableRow>
                      ))}
                      {filteredHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
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
