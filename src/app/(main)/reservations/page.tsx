

'use client';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Truck, MoreHorizontal, Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';
import { cn } from '@/lib/utils';
import { ReservationForm } from '@/components/reservation-form';


export default function ReservationsPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('ReservationsPage must be used within an InventoryProvider');
  }
  const { containers, reservations, setReservations, releaseReservationStock } = context;
  const { currentUser } = useUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();


  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setIsFormOpen(true);
      router.replace('/reservations', {scroll: false});
    }
  }, [searchParams, router]);
  
  const filteredReservations = useMemo(() => reservations.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ), [reservations, searchTerm]);

  const pendingValidationReservations = useMemo(() => filteredReservations.filter(r => r.status === 'En espera de validación'), [filteredReservations]);
  
  const allValidatedReservations = useMemo(() => filteredReservations.filter(r => r.status === 'Validada'), [filteredReservations]);
  
  const expiredOrDueReservations = useMemo(() => {
      const isAdmin = currentUser.roles.includes('Administrador');
      const isAdvisor = currentUser.roles.includes('Asesor de Ventas');
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      return allValidatedReservations.filter(r => {
          if (r.isPaid) return false; // Paid reservations don't expire
          if (isAdvisor && !isAdmin && r.advisor !== currentUser.name) {
            return false;
          }
          if (!r.expirationDate) return false;
          const expiration = new Date(r.expirationDate);
          expiration.setHours(0,0,0,0);
          return expiration <= tomorrow;
      });
  }, [allValidatedReservations, currentUser]);


  const pendingArrivalReservations = useMemo(() => {
    const activeContainerIds = new Set(containers.filter(c => c.status !== 'Ya llego').map(c => c.id));
    return allValidatedReservations.filter(r => r.source === 'Contenedor' && activeContainerIds.has(r.sourceId));
  }, [allValidatedReservations, containers]);
  

  const historyReservations = useMemo(() => filteredReservations.filter(r => r.status === 'Despachada' || r.status === 'Rechazada'), [filteredReservations]);

  const handleSaveReservations = (newReservations: Reservation[]) => {
    setReservations(prev => [...prev, ...newReservations]);
    setIsFormOpen(false);
    toast({
        title: 'Reservas Creadas',
        description: `Se han creado ${newReservations.length} nuevas reservas para la cotización ${newReservations[0].quoteNumber}.`
    });
  };
  
  const handleOpenEditDialog = (reservation: Reservation) => {
    // This flow needs to be re-evaluated. For now, we'll just log it.
    // Editing multi-product reservations might be complex.
    console.log("Editing a reservation is not fully supported in this new flow yet.", reservation);
    toast({ variant: 'destructive', title: 'Función no disponible', description: 'La edición de reservas individuales se debe re-evaluar con el nuevo sistema de cotizaciones.' });
    // setEditingReservation(reservation);
    // setIsFormOpen(true);
  };
  
  const handleDeleteReservation = (reservationId: string) => {
    const reservationToDelete = reservations.find(r => r.id === reservationId);
    if (!reservationToDelete) return;

    if (reservationToDelete.status === 'Validada' && (reservationToDelete.source === 'Bodega' || reservationToDelete.source === 'Zona Franca')) {
        releaseReservationStock(reservationToDelete);
    }

    setReservations(prev => prev.filter(r => r.id !== reservationId));
    toast({ variant: 'destructive', title: 'Reserva Eliminada' });
  };
  
  const getStatusBadgeVariant = (status: Reservation['status']) => {
    switch (status) {
        case 'Validada': return 'success';
        case 'En espera de validación': return 'secondary';
        case 'Rechazada': return 'destructive';
        case 'Despachada': return 'default';
    }
  }
  
  const renderOrigin = (reservation: Reservation) => {
    if (reservation.source === 'Contenedor') {
      const container = containers.find(c => c.id === reservation.sourceId);
      const eta = container ? ` (Llega: ${container.eta})` : '';
      return `Contenedor ${reservation.sourceId}${eta}`;
    }
    return reservation.source;
  }

  const handleCreateDispatch = (reservation: Reservation) => {
    const params = new URLSearchParams();
    params.set('action', 'create');
    params.set('cliente', reservation.customer);
    params.set('vendedor', reservation.advisor);
    params.set('cotizacion', reservation.quoteNumber);
    router.push(`/orders?${params.toString()}`);
  }
  
  const ReservationsTable = ({ data, showActions = false }: { data: Reservation[], showActions?: boolean }) => {
    
    const isExpired = (reservation: Reservation) => {
        if (reservation.isPaid || !reservation.expirationDate) return false;
        const today = new Date();
        const expirationDate = new Date(reservation.expirationDate);
        today.setHours(0, 0, 0, 0);
        return expirationDate < today;
    }

    return (
     <Table>
        <TableHeader>
          <TableRow>
            <TableHead># Cotización</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Asesor</TableHead>
            <TableHead>Vence / Estado Pago</TableHead>
            <TableHead>Estado</TableHead>
            {showActions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((reservation) => {
            const expired = isExpired(reservation);
            const isOwner = currentUser.name === reservation.advisor;
            const isAdmin = currentUser.roles.includes('Administrador');
            return (
                <TableRow key={reservation.id}>
                <TableCell>{reservation.quoteNumber}</TableCell>
                <TableCell>{reservation.customer}</TableCell>
                <TableCell>{reservation.product}</TableCell>
                <TableCell>{reservation.quantity}</TableCell>
                <TableCell>{renderOrigin(reservation)}</TableCell>
                <TableCell>{reservation.advisor}</TableCell>
                <TableCell className={cn(expired && 'text-destructive')}>
                    {reservation.isPaid ? (
                         <Badge variant="success" className="gap-2">
                            <CheckCircle className="h-4 w-4" /> Pagado
                         </Badge>
                    ) : reservation.expirationDate ? (
                        <div className="flex flex-col items-start gap-1">
                           <span>{reservation.expirationDate}</span>
                           {expired && <Badge variant="destructive">Expirada</Badge>}
                        </div>
                    ) : 'N/A'}
                </TableCell>
                <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                        {reservation.status}
                    </Badge>
                </TableCell>
                {showActions && (
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!isAdmin && !isOwner}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleCreateDispatch(reservation)}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Crear Despacho
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(reservation)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Reserva
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar Reserva
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará la reserva y se liberará el stock si estaba separado.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteReservation(reservation.id)} className="bg-destructive hover:bg-destructive/90">
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                )}
                </TableRow>
            )
          })}
          {data.length === 0 && (
            <TableRow>
                <TableCell colSpan={showActions ? 9 : 8} className="text-center text-muted-foreground">
                    No se encontraron reservas.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  };
  
  const TabTriggerWithIndicator = ({ value, count, hasAlert, children }: { value: string, count: number, hasAlert: boolean, children: React.ReactNode }) => {
    return (
        <TabsTrigger value={value} className="relative">
            {children} ({count})
            {hasAlert && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />}
        </TabsTrigger>
    );
  };


  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas de Productos</CardTitle>
            <CardDescription>Cree y gestione las reservas de productos en tránsito o en bodega.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Reserva
          </Button>
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
        </CardContent>
      </Card>
      
      <Tabs defaultValue="pendientes-validacion" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabTriggerWithIndicator value="pendientes-validacion" count={pendingValidationReservations.length} hasAlert={pendingValidationReservations.length > 0}>
                Pendiente Validación
            </TabTriggerWithIndicator>
            <TabTriggerWithIndicator value="separadas" count={allValidatedReservations.length} hasAlert={expiredOrDueReservations.length > 0}>
                Separadas (Validadas)
            </TabTriggerWithIndicator>
            <TabsTrigger value="pendientes-llegada">Pendiente Llegada ({pendingArrivalReservations.length})</TabsTrigger>
            <TabsTrigger value="historial">Historial ({historyReservations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes-validacion" className="pt-4">
           <Card>
            <CardContent className="p-0">
              <ReservationsTable data={pendingValidationReservations} />
            </CardContent>
           </Card>
        </TabsContent>
        <TabsContent value="separadas" className="pt-4">
           <Card>
            <CardContent className="p-0">
              <ReservationsTable data={allValidatedReservations} showActions={true} />
            </CardContent>
           </Card>
        </TabsContent>
         <TabsContent value="pendientes-llegada" className="pt-4">
           <Card>
            <CardContent className="p-0">
              <ReservationsTable data={pendingArrivalReservations} />
            </CardContent>
           </Card>
        </TabsContent>
        <TabsContent value="historial" className="pt-4">
          <Card>
            <CardContent className="p-0">
              <ReservationsTable data={historyReservations} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Crear Nueva Reserva</DialogTitle>
                 <DialogDescription>
                    Construya una cotización con múltiples productos y cree las reservas correspondientes.
                </DialogDescription>
            </DialogHeader>
            <ReservationForm 
                onSave={handleSaveReservations}
                onCancel={() => setIsFormOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
