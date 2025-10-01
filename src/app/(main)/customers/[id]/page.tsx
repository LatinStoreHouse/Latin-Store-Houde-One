
'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initialCustomerData, Customer } from '@/lib/customers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, StickyNote, Edit, UserCircle, BadgeCent } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Quote, Reservation } from '@/context/inventory-context';
import { initialQuotes } from '@/lib/quotes-history';
import { initialReservations } from '@/lib/sales-history';
import { DispatchData, initialDispatchData } from '@/app/(main)/orders/page';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm } from '@/components/customer-form';
import { useUser } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';

function CustomerQuotes({ quotes }: { quotes: Quote[] }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead># Cotización</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length > 0 ? quotes.map(q => (
                            <TableRow key={q.id}>
                                <TableCell>{q.quoteNumber}</TableCell>
                                <TableCell>{q.calculatorType}</TableCell>
                                <TableCell>{new Date(q.creationDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: q.currency }).format(q.total)}
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No hay cotizaciones guardadas para este cliente.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function CustomerReservations({ reservations }: { reservations: Reservation[] }) {
    const getStatusBadgeVariant = (status: Reservation['status']) => {
        switch (status) {
            case 'Validada': return 'success';
            case 'En espera de validación': return 'secondary';
            case 'Rechazada': return 'destructive';
            case 'Despachada': return 'default';
            default: return 'outline';
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead># Cotización</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {reservations.length > 0 ? reservations.map(r => (
                            <TableRow key={r.id}>
                                <TableCell>{r.product}</TableCell>
                                <TableCell>{r.quoteNumber}</TableCell>
                                <TableCell className="text-center">{r.quantity}</TableCell>
                                <TableCell>{r.source === 'Contenedor' ? `Cont. ${r.sourceId}` : r.sourceId}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No hay reservas para este cliente.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function CustomerDispatches({ dispatches }: { dispatches: DispatchData[] }) {
    const getConventionClasses = (value: string) => {
        const conventionOptions = [
            { value: 'Prealistamiento de pedido', bgColor: 'bg-purple-200/50', textColor: 'text-purple-800' },
            { value: 'Listo en Bodega', bgColor: 'bg-blue-200/50', textColor: 'text-blue-800' },
            { value: 'Despachado', bgColor: 'bg-green-200/50', textColor: 'text-green-800' },
            { value: 'Producto Separado', bgColor: 'bg-amber-200/50', textColor: 'text-amber-800' },
            { value: 'Transito naviero', bgColor: 'bg-yellow-200/50', textColor: 'text-yellow-800' },
            { value: 'Novedad Bodega interno', bgColor: 'bg-orange-200/50', textColor: 'text-orange-800' },
            { value: 'Entrega parcial', bgColor: 'bg-red-200/50', textColor: 'text-red-800' },
        ];
        const option = conventionOptions.find(opt => opt.value === value);
        return option ? `${option.bgColor} ${option.textColor}` : '';
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead># Cotización</TableHead>
                            <TableHead>Fecha Solicitud</TableHead>
                            <TableHead>Convención</TableHead>
                            <TableHead>Guía #</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dispatches.length > 0 ? dispatches.map(d => (
                            <TableRow key={d.id}>
                                <TableCell>{d.cotizacion}</TableCell>
                                <TableCell>{d.fechaSolicitud}</TableCell>
                                <TableCell>
                                    <Badge className={getConventionClasses(d.convencion)}>{d.convencion}</Badge>
                                </TableCell>
                                <TableCell>{d.guia || 'N/A'}</TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No hay despachos para este cliente.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser } = useUser();
    const { toast } = useToast();

    const [quotes, setQuotes] = useState(initialQuotes);
    const [reservations, setReservations] = useState(initialReservations);
    
    const id = params.id as string;
    
    // Simulate finding and updating the customer in a local state
    const [customer, setCustomer] = useState(() => initialCustomerData.find(c => c.id.toString() === id));
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const customerQuotes = useMemo(() => {
        if (!customer) return [];
        return quotes.filter(q => q.customerName === customer.name);
    }, [customer, quotes]);

    const customerReservations = useMemo(() => {
        if (!customer) return [];
        return reservations.filter(r => r.customer === customer.name);
    }, [customer, reservations]);

    const customerDispatches = useMemo(() => {
        if (!customer) return [];
        return initialDispatchData.filter(d => d.cliente === customer.name);
    }, [customer]);

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'registrationDate'>) => {
        if (!customer) return;

        const updatedCustomer = { ...customer, ...customerData } as Customer;
        setCustomer(updatedCustomer);
        
        // Here you would also update the global state / database
        // For now, we just update the local state of this page.
        const index = initialCustomerData.findIndex(c => c.id === customer.id);
        if (index > -1) {
            initialCustomerData[index] = updatedCustomer;
        }

        toast({ title: 'Cliente Actualizado', description: 'Los datos del cliente se han actualizado.' });
        setIsEditModalOpen(false);
    };

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Cliente no Encontrado</CardTitle>
                        <CardDescription>No se pudo encontrar un cliente con el ID proporcionado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/customers')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
                    <p className="text-muted-foreground">Vista 360 del cliente</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Información de Contacto</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone || 'No registrado'}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <BadgeCent className="h-4 w-4 text-muted-foreground" />
                        <span>NIT/Cédula: {customer.taxId || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center gap-3 col-span-1 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.address || 'No registrada'}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Asesor: {customer.assignedTo || 'No asignado'}</span>
                    </div>
                     {customer.notes && (
                         <div className="flex items-start gap-3 col-span-full">
                            <StickyNote className="h-4 w-4 text-muted-foreground mt-1" />
                            <p className="border-l-2 pl-3 italic text-muted-foreground">{customer.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="quotes">
                <TabsList>
                    <TabsTrigger value="quotes">Cotizaciones ({customerQuotes.length})</TabsTrigger>
                    <TabsTrigger value="reservations">Reservas ({customerReservations.length})</TabsTrigger>
                    <TabsTrigger value="dispatches">Despachos ({customerDispatches.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="quotes">
                   <CustomerQuotes quotes={customerQuotes} />
                </TabsContent>
                <TabsContent value="reservations">
                    <CustomerReservations reservations={customerReservations} />
                </TabsContent>
                <TabsContent value="dispatches">
                    <CustomerDispatches dispatches={customerDispatches} />
                </TabsContent>
            </Tabs>

             <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                          Actualice los detalles del cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                        customer={customer}
                        onSave={handleSaveCustomer}
                        onCancel={() => setIsEditModalOpen(false)}
                        currentUser={currentUser}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
