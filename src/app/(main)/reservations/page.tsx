'use client';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Truck, AlertTriangle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initialInventoryData } from '@/lib/initial-inventory';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';
import { cn } from '@/lib/utils';


const getAllInventoryProducts = () => {
    const products: { name: string, data: any }[] = [];
    for (const brand in initialInventoryData) {
        const subcategories = initialInventoryData[brand as keyof typeof initialInventoryData];
        for (const subCategory in subcategories) {
            const productList = subcategories[subCategory as keyof typeof subcategories];
            for (const productName in productList) {
                products.push({
                    name: productName,
                    data: productList[productName as keyof typeof productList],
                });
            }
        }
    }
    return products;
}

export default function ReservationsPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('ReservationsPage must be used within an InventoryProvider');
  }
  const { containers, reservations, setReservations, releaseReservationStock } = context;
  const { currentUser } = useUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Form fields state
  const [customerName, setCustomerName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | string>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [reservationSource, setReservationSource] = useState<'Contenedor' | 'Bodega' | 'Zona Franca'>('Contenedor');
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();


  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      const cliente = searchParams.get('cliente') || '';
      const asesor = searchParams.get('asesor') || (currentUser?.name || '');
      const source = searchParams.get('source');
      const containerId = searchParams.get('containerId');
      
      if (source === 'Contenedor' && containerId) {
          setReservationSource('Contenedor');
          setSelectedContainerId(containerId);
      }

      setCustomerName(cliente);
      setAdvisorName(asesor);
      setIsFormOpen(true);
      // Clean up URL params, keeping the main path
      router.replace('/reservations', {scroll: false});
    }
  }, [searchParams, router, currentUser]);
  
  const resetFormFields = () => {
    setCustomerName('');
    setProductName('');
    setQuantity(0);
    setQuoteNumber('');
    setAdvisorName('');
    setExpirationDate('');
    setSelectedContainerId('');
    setReservationSource('Contenedor');
    setEditingReservation(null);
  };

  const inventoryProducts = useMemo(() => getAllInventoryProducts(), []);
  
  const activeContainers = useMemo(() => containers.filter(c => c.status !== 'Llegado'), [containers]);

  const containerOptions = useMemo(() => {
    return activeContainers.map(c => ({
        value: c.id,
        label: `${c.id} (Llegada: ${c.eta})`
    }));
  }, [activeContainers]);

  const productOptions = useMemo(() => {
    if (reservationSource === 'Contenedor') {
        if (!selectedContainerId) return [];
        const container = activeContainers.find(c => c.id === selectedContainerId);
        if (!container) return [];
        return container.products.map(p => ({ 
            value: p.name, 
            label: `${p.name}`, 
            available: p.quantity,
            sourceId: container.id 
        }));
    } else if (reservationSource === 'Bodega') {
        return inventoryProducts.map(p => ({ 
            value: p.name, 
            label: p.name, 
            available: p.data.bodega - p.data.separadasBodega, 
            sourceId: 'Bodega' 
        }));
    } else { // Zona Franca
        return inventoryProducts.map(p => ({ 
            value: p.name, 
            label: p.name, 
            available: p.data.zonaFranca - p.data.separadasZonaFranca, 
            sourceId: 'Zona Franca' 
        }));
    }
  }, [reservationSource, inventoryProducts, activeContainers, selectedContainerId]);
  
  const filteredReservations = useMemo(() => reservations.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ), [reservations, searchTerm]);

  const pendingValidationReservations = useMemo(() => filteredReservations.filter(r => r.status === 'En espera de validación'), [filteredReservations]);
  
  const allValidatedReservations = useMemo(() => filteredReservations.filter(r => r.status === 'Validada'), [filteredReservations]);

  const pendingArrivalReservations = useMemo(() => {
    const activeContainerIds = new Set(activeContainers.map(c => c.id));
    return allValidatedReservations.filter(r => r.source === 'Contenedor' && activeContainerIds.has(r.sourceId));
  }, [allValidatedReservations, activeContainers]);
  

  const historyReservations = useMemo(() => filteredReservations.filter(r => r.status === 'Despachada' || r.status === 'Rechazada'), [filteredReservations]);


  const handleSaveReservation = () => {
    if (!customerName || !productName || Number(quantity) <= 0 || !quoteNumber) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos requeridos.'});
        return;
    }
    
    if (reservationSource === 'Contenedor' && !selectedContainerId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un contenedor.'});
        return;
    }

    if (!editingReservation) {
      const quoteExists = reservations.some(r => r.quoteNumber.toLowerCase() === quoteNumber.toLowerCase());
      if (quoteExists) {
          toast({ variant: 'destructive', title: 'Error', description: 'El número de cotización ya existe.'});
          return;
      }
    }
    
    const productInfo = productOptions.find(p => p.value === productName);
    if (!productInfo) {
        toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.'});
        return;
    }
    
    // For new reservations, check against available stock. For edits, we allow it but it needs re-validation.
    if(!editingReservation && Number(quantity) > productInfo.available) {
        toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad solicitada (${quantity}) excede la disponible (${productInfo.available}).`});
        return;
    }
    
    if (editingReservation) {
        const originalReservation = reservations.find(r => r.id === editingReservation.id);
        if (!originalReservation) return;

        const needsRevalidation = 
            originalReservation.product !== productName ||
            originalReservation.quantity !== Number(quantity) ||
            originalReservation.expirationDate !== expirationDate;
        
        if (needsRevalidation) {
            // Release old stock if it was from warehouse/ZF
            if(originalReservation.status === 'Validada' && (originalReservation.source === 'Bodega' || originalReservation.source === 'Zona Franca')) {
                releaseReservationStock(originalReservation);
            }
        }

        const updatedReservation: Reservation = {
            ...originalReservation,
            customer: customerName,
            product: productName,
            quantity: Number(quantity),
            source: reservationSource,
            sourceId: productInfo.sourceId,
            quoteNumber: quoteNumber,
            expirationDate: expirationDate || undefined,
            status: needsRevalidation ? 'En espera de validación' : originalReservation.status
        };

        setReservations(prev => prev.map(r => r.id === editingReservation.id ? updatedReservation : r));
        toast({ title: 'Reserva Actualizada', description: needsRevalidation ? 'La reserva debe ser validada nuevamente.' : 'La reserva ha sido actualizada.' });
    } else {
        const newReservation: Reservation = {
            id: `RES-00${reservations.length + 1}`,
            customer: customerName,
            product: productName,
            quantity: Number(quantity),
            sourceId: productInfo.sourceId,
            advisor: advisorName || currentUser.name || 'Admin',
            quoteNumber: quoteNumber,
            status: 'En espera de validación',
            source: reservationSource,
            expirationDate: expirationDate || undefined,
        };
        setReservations([...reservations, newReservation]);
        toast({ title: 'Éxito', description: 'Reserva creada y pendiente de validación.' });
    }
    
    resetFormFields();
    setIsFormOpen(false);
  };
  
  const handleOpenEditDialog = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setCustomerName(reservation.customer);
    setAdvisorName(reservation.advisor);
    setProductName(reservation.product);
    setQuantity(reservation.quantity);
    setQuoteNumber(reservation.quoteNumber);
    setReservationSource(reservation.source);
    setExpirationDate(reservation.expirationDate || '');
    if (reservation.source === 'Contenedor') {
        setSelectedContainerId(reservation.sourceId);
    }
    setIsFormOpen(true);
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
  
  const getSelectedProductInfo = () => {
    if (!productName) return null;
    const product = productOptions.find(p => p.value === productName);
    if (!product) return null;
    
    let sourceText = product.sourceId;
    if (reservationSource === 'Contenedor') {
        sourceText = `Contenedor ${product.sourceId}`;
    } else {
        sourceText = reservationSource;
    }

    return `Disponible: ${product.available} en ${sourceText}`;
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
    
    const isExpired = (dateString?: string) => {
        if (!dateString) return false;
        const today = new Date();
        const expirationDate = new Date(dateString);
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
            <TableHead>Vence</TableHead>
            <TableHead>Estado</TableHead>
            {showActions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((reservation) => {
            const expired = isExpired(reservation.expirationDate);
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
                    {reservation.expirationDate ? (
                        <div className="flex items-center gap-2">
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

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas de Productos</CardTitle>
            <CardDescription>Cree y gestione las reservas de productos en tránsito o en bodega.</CardDescription>
          </div>
          <Button onClick={() => { setEditingReservation(null); setIsFormOpen(true); }}>
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
            <TabsTrigger value="pendientes-validacion">Pendiente Validación ({pendingValidationReservations.length})</TabsTrigger>
            <TabsTrigger value="separadas">Separadas (Validadas) ({allValidatedReservations.length})</TabsTrigger>
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

      {/* Reusable Dialog for Create/Edit */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetFormFields(); setIsFormOpen(open); }}>
          <DialogContent>
              <DialogHeader><DialogTitle>{editingReservation ? 'Editar Reserva' : 'Crear Nueva Reserva'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Origen del Producto</Label>
                      <RadioGroup value={reservationSource} onValueChange={(value) => {
                          setReservationSource(value as 'Contenedor' | 'Bodega' | 'Zona Franca');
                          setProductName('');
                          setSelectedContainerId('');
                      }} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Contenedor" id="source-container" />
                          <Label htmlFor="source-container">Contenedor en Tránsito</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Bodega" id="source-warehouse" />
                          <Label htmlFor="source-warehouse">Bodega</Label>
                        </div>
                          <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Zona Franca" id="source-free-zone" />
                          <Label htmlFor="source-free-zone">Zona Franca</Label>
                        </div>
                      </RadioGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label># Cotización</Label>
                        <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="ej. COT-2024-001" />
                    </div>
                      <div className="space-y-2">
                        <Label>Fecha Vencimiento (Opcional)</Label>
                        <Input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Nombre del Cliente</Label>
                      <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  </div>
                  {reservationSource === 'Contenedor' && (
                        <div className="space-y-2">
                          <Label>Contenedor</Label>
                          <Combobox
                              options={containerOptions}
                              value={selectedContainerId}
                              onValueChange={(value) => {
                                  setSelectedContainerId(value);
                                  setProductName(''); // Reset product when container changes
                              }}
                              placeholder="Seleccione un contenedor"
                              searchPlaceholder="Buscar contenedor..."
                              emptyPlaceholder="No hay contenedores en tránsito"
                          />
                      </div>
                  )}
                  <div className="space-y-2">
                      <Label>Producto</Label>
                      <Combobox
                          options={productOptions}
                          value={productName}
                          onValueChange={setProductName}
                          placeholder="Seleccione un producto"
                          searchPlaceholder="Buscar producto..."
                          emptyPlaceholder="No se encontraron productos"
                          disabled={reservationSource === 'Contenedor' && !selectedContainerId}
                      />
                      <p className="text-sm text-muted-foreground">{getSelectedProductInfo()}</p>
                  </div>
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                  <Button onClick={handleSaveReservation}>{editingReservation ? 'Guardar Cambios' : 'Crear Reserva'}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
