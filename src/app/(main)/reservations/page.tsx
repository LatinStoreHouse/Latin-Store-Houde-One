'use client';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Truck } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initialInventoryData } from '@/lib/initial-inventory';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';


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
  const { containers, reservations, setReservations } = context;
  const { currentUser } = useUser();

  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
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
      setIsNewReservationDialogOpen(true);
      // Clean up URL params, keeping the main path
      router.replace('/reservations', {scroll: false});
    }
  }, [searchParams, router, currentUser]);

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
            available: p.quantity, // In transit, all quantity is "available" for reservation
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
  
  const pendingDispatchReservations = useMemo(() => {
    return allValidatedReservations.filter(r => r.source === 'Bodega' || r.source === 'Zona Franca');
  }, [allValidatedReservations]);

  const historyReservations = useMemo(() => filteredReservations.filter(r => r.status === 'Despachada' || r.status === 'Rechazada'), [filteredReservations]);


  const handleCreateReservation = () => {
    if (!customerName || !productName || quantity <= 0 || !quoteNumber) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos.'});
        return;
    }
    
    if (reservationSource === 'Contenedor' && !selectedContainerId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un contenedor.'});
        return;
    }

    const quoteExists = reservations.some(r => r.quoteNumber.toLowerCase() === quoteNumber.toLowerCase());
    if (quoteExists) {
        toast({ variant: 'destructive', title: 'Error', description: 'El número de cotización ya existe.'});
        return;
    }

    const productInfo = productOptions.find(p => p.value === productName);
    if (!productInfo) {
        toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.'});
        return;
    }
    
    if(quantity > productInfo.available) {
        toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad solicitada (${quantity}) excede la disponible (${productInfo.available}).`});
        return;
    }

    const newReservation: Reservation = {
        id: `RES-00${reservations.length + 1}`,
        customer: customerName,
        product: productName,
        quantity,
        sourceId: productInfo.sourceId,
        advisor: advisorName || 'Usuario Admin', // Mock current user or from params
        quoteNumber: quoteNumber,
        status: 'En espera de validación',
        source: reservationSource,
        expirationDate: expirationDate || undefined,
    };

    setReservations([...reservations, newReservation]);
    setCustomerName('');
    setProductName('');
    setQuantity(0);
    setQuoteNumber('');
    setAdvisorName('');
    setExpirationDate('');
    setSelectedContainerId('');
    setIsNewReservationDialogOpen(false);
    toast({ title: 'Éxito', description: 'Reserva creada y pendiente de validación.' });
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
  
  const ReservationsTable = ({ data, showActions = false }: { data: Reservation[], showActions?: boolean }) => (
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
            {showActions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.quoteNumber}</TableCell>
              <TableCell>{reservation.customer}</TableCell>
              <TableCell>{reservation.product}</TableCell>
              <TableCell>{reservation.quantity}</TableCell>
              <TableCell>{renderOrigin(reservation)}</TableCell>
              <TableCell>{reservation.advisor}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(reservation.status)}>
                    {reservation.status}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleCreateDispatch(reservation)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Crear Despacho
                    </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="text-center text-muted-foreground">
                    No se encontraron reservas.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  );

  return (
    <div>
      <Card className="mb-6">
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
        </CardContent>
      </Card>
      
      <Tabs defaultValue="pendientes-validacion" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="pendientes-validacion">Pendiente Validación ({pendingValidationReservations.length})</TabsTrigger>
            <TabsTrigger value="separadas">Separadas (Validadas) ({allValidatedReservations.length})</TabsTrigger>
            <TabsTrigger value="pendientes-llegada">Pendiente Llegada ({pendingArrivalReservations.length})</TabsTrigger>
            <TabsTrigger value="pendientes-despacho">Pendiente Despacho ({pendingDispatchReservations.length})</TabsTrigger>
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
         <TabsContent value="pendientes-despacho" className="pt-4">
           <Card>
            <CardContent className="p-0">
              <ReservationsTable data={pendingDispatchReservations} showActions={true} />
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
    </div>
  );
}
