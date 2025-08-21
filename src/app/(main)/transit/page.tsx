

'use client';
import React, { useState, useMemo, useContext } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Container, Ship, CalendarIcon, FileDown, Edit, CheckCircle, FileUp, FileType, X, ChevronDown, Trash2, BookUser } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import { ContainerHistoryItem } from '@/components/container-history-item';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryContext, Product, Reservation } from '@/context/inventory-context';
import { Container as ContainerType, ContainerStatus } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';
import { initialReservations } from '@/lib/sales-history';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const containerStatuses: ContainerStatus[] = ['En producción', 'En tránsito', 'En puerto', 'Atrasado', 'Llegado'];

const ContainerCard = ({ container, canEditStatus, canEditContainer, canCreateReservation, onEdit, onStatusChange, onReceive, onReserve }: {
    container: ContainerType;
    canEditStatus: boolean;
    canEditContainer: boolean;
    canCreateReservation: boolean;
    onEdit: (container: ContainerType) => void;
    onStatusChange: (containerId: string, newStatus: ContainerStatus) => void;
    onReceive: (containerId: string, reservations: Reservation[]) => void;
    onReserve: (containerId: string) => void;
}) => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error("Context not found");
    const { reservations } = context;


    const getReservationsForProduct = (containerId: string, productName: string): Reservation[] => {
        return reservations.filter(
            (r) => r.sourceId === containerId && r.product === productName && r.status === 'Validada'
        );
    };

    const getValidatedReservedQuantity = (productReservations: Reservation[]): number => {
        return productReservations.reduce((sum, r) => sum + r.quantity, 0);
    };

    const getStatusBadgeColor = (status: ContainerType['status']) => {
        switch (status) {
            case 'En producción': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'En tránsito': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'En puerto': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Atrasado': return 'bg-red-100 text-red-800 border-red-200';
            case 'Llegado': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Container className="h-6 w-6" /> {container.id}
                            </CardTitle>
                            <CardDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Llegada a Puerto: {container.eta}</span>
                            </CardDescription>
                        </div>
                    </div>
                     {canEditStatus ? (
                        <Select value={container.status} onValueChange={(value) => onStatusChange(container.id, value as ContainerStatus)}>
                            <SelectTrigger className={cn("w-[180px]", getStatusBadgeColor(container.status))}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {containerStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     ) : (
                        <Badge className={cn("text-base", getStatusBadgeColor(container.status))}>{container.status}</Badge>
                     )}
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Cantidad Total</TableHead>
                                <TableHead className="text-right">Unidades Separadas (Validadas)</TableHead>
                                <TableHead className="text-right">Total Disponible</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {container.products.map((product, index) => {
                                const productReservations = getReservationsForProduct(container.id, product.name);
                                const reservedQuantity = getValidatedReservedQuantity(productReservations);
                                const availableQuantity = product.quantity - reservedQuantity;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell className="text-right">{product.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            {reservedQuantity > 0 ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-medium underline decoration-dashed cursor-help">
                                                            {reservedQuantity}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-bold mb-2">Reservas Validadas:</p>
                                                        <ul className="list-disc pl-4">
                                                            {productReservations.map(r => (
                                                                <li key={r.id}>
                                                                    {r.quantity} unid. por {r.advisor}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                reservedQuantity
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{availableQuantity}</TableCell>
                                    </TableRow>
                                )
                            })}
                            {container.products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No hay productos en este contenedor.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TooltipProvider>
            </CardContent>
             <CardFooter className="flex justify-end p-4 gap-2">
                {canCreateReservation && container.status !== 'Llegado' && (
                     <Button variant="default" size="sm" onClick={() => onReserve(container.id)}>
                        <BookUser className="mr-2 h-4 w-4" />
                        Crear Reserva
                    </Button>
                )}
                {canEditContainer && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onEdit(container)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    {container.status !== 'Llegado' && (
                       <>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar como Recibido
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Recepción</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        ¿Está seguro de que desea marcar este contenedor como recibido? El contenido se agregará al inventario de Zona Franca y esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onReceive(container.id, reservations.filter(r => r.source === 'Contenedor' && r.sourceId === container.id && r.status === 'Validada'))}>
                                        Confirmar Recepción
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                       </>
                    )}
                  </>
                )}
            </CardFooter>
        </Card>
    );
};

export default function TransitPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, containers, addContainer, editContainer, receiveContainer } = context;
  const { currentUser } = useUser();
  const router = useRouter();

  const [newContainerId, setNewContainerId] = useState('');
  const [newContainerEta, setNewContainerEta] = useState('');
  const [newContainerProducts, setNewContainerProducts] = useState<Product[]>([]);
  
  // State for the product form inside the dialog
  const [brand, setBrand] = useState('');
  const [line, setLine] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');

  const [isAddContainerDialogOpen, setIsAddContainerDialogOpen] = useState(false);
  const [isEditContainerDialogOpen, setIsEditContainerDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<ContainerType | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainersForExport, setSelectedContainersForExport] = useState<Record<string, boolean>>({});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xls'>('pdf');
  const [activeTab, setActiveTab] = useState('en-transito');
  const { toast } = useToast();
  
  const canEditContainer = currentUser.roles.includes('Administrador');
  const canEditStatus = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Logística') || currentUser.roles.includes('Contador');
  const canCreateReservation = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');

  const { activeContainers, historyContainers } = useMemo(() => {
    const active = containers.filter(c => c.status !== 'Llegado');
    const history = containers.filter(c => c.status === 'Llegado');
    return { activeContainers: active, historyContainers: history };
  }, [containers]);

  const brandOptions = useMemo(() => Object.keys(inventoryData).map(b => ({ value: b, label: b })), [inventoryData]);
  const lineOptions = useMemo(() => {
    if (!brand || !inventoryData[brand as keyof typeof inventoryData]) return [];
    return Object.keys(inventoryData[brand as keyof typeof inventoryData]).map(l => ({ value: l, label: l }));
  }, [brand, inventoryData]);


  const handleAddContainer = () => {
    if (!newContainerId || !newContainerEta) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete el ID y la fecha de llegada.' });
        return;
    }
    const newContainer: ContainerType = {
      id: newContainerId,
      eta: newContainerEta,
      carrier: '', // Carrier removed from form
      products: newContainerProducts,
      status: 'En producción',
      creationDate: new Date().toISOString().split('T')[0],
    };
    addContainer(newContainer);
    setNewContainerId('');
    setNewContainerEta('');
    setNewContainerProducts([]);
    setIsAddContainerDialogOpen(false);
    toast({ title: 'Éxito', description: 'Contenedor agregado correctamente.' });
  };
  
  const handleOpenEditDialog = (container: ContainerType) => {
    setEditingContainer(container);
    setIsEditContainerDialogOpen(true);
  };

  const handleEditContainer = () => {
    if (!editingContainer) return;
    editContainer(editingContainer.id, editingContainer);
    setIsEditContainerDialogOpen(false);
    setEditingContainer(null);
    toast({ title: 'Éxito', description: 'Contenedor actualizado correctamente.' });
  };
  
  const handleStatusChange = (containerId: string, newStatus: ContainerStatus) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // If status is "Llegado", trigger the receive confirmation dialog
    if (newStatus === 'Llegado') {
        const reservations = context.reservations.filter(r => r.source === 'Contenedor' && r.sourceId === containerId && r.status === 'Validada');
        receiveContainer(containerId, reservations);
        toast({
          title: `Contenedor ${containerId} Recibido`,
          description: "El contenido ha sido agregado al inventario de Zona Franca.",
        });
    } else {
        editContainer(containerId, { ...container, status: newStatus });
        toast({ title: 'Estado Actualizado', description: `El estado del contenedor ${containerId} ha sido actualizado a "${newStatus}".`});
    }
  };


  const handleCreateReservationFromContainer = (containerId: string) => {
    const params = new URLSearchParams();
    params.set('action', 'create');
    params.set('source', 'Contenedor');
    params.set('containerId', containerId);
    router.push(`/reservations?${params.toString()}`);
  }


  const handleAddProductToContainer = (isEditing: boolean) => {
    if (!brand || !line || !productName || Number(quantity) <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos del producto.' });
        return;
    }

    const productListSetter = isEditing 
        ? (updater: (prev: Product[]) => Product[]) => setEditingContainer(c => c ? {...c, products: updater(c.products)} : null)
        : setNewContainerProducts;
    
    productListSetter(prev => {
        const existingProductIndex = prev.findIndex(p => p.name === productName);
        if (existingProductIndex !== -1) {
            const updatedProducts = [...prev];
            updatedProducts[existingProductIndex].quantity += Number(quantity);
            return updatedProducts;
        } else {
            return [...prev, { name: productName, quantity: Number(quantity), brand, line }];
        }
    });

    setProductName('');
    setQuantity('');
  };
  
  const handleRemoveProductFromList = (productName: string, isEditing: boolean) => {
     const productListSetter = isEditing 
        ? (updater: (prev: Product[]) => Product[]) => setEditingContainer(c => c ? {...c, products: updater(c.products)} : null)
        : setNewContainerProducts;
    
    productListSetter(prev => prev.filter(p => p.name !== productName));
  }
  
  const handleExportOptionChange = (key: string, value: boolean) => {
    setSelectedContainersForExport(prev => ({
        ...prev,
        [key]: value
    }));
  }

  const handleExport = () => {
    const isHistory = activeTab === 'historial';
    const allContainersInView = isHistory ? historyContainers : activeContainers;
    const selectedIds = Object.keys(selectedContainersForExport).filter(id => selectedContainersForExport[id]);

    const containersToExport = selectedIds.length > 0
        ? allContainersInView.filter(c => selectedIds.includes(c.id))
        : allContainersInView;

    if (containersToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: `No hay contenedores para exportar.` });
        return;
    }
    
    if (exportFormat === 'pdf') {
        handleExportPDF(containersToExport);
    } else {
        handleExportXLS(containersToExport);
    }
    setIsExportDialogOpen(false);
  };

  const handleExportPDF = async (containersToExport: ContainerType[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Latin Store House', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Reporte de Contenedores', 14, 30);
    
    let yPos = 35;

    containersToExport.forEach((container) => {
        const bodyData = container.products.map(p => [p.name, p.quantity]);
        
        if (yPos > 250) { // Check for page break
            doc.addPage();
            yPos = 15;
        }

        doc.setFontSize(12);
        doc.text(`Contenedor: ${container.id} | Llegada a Puerto: ${container.eta}`, 14, yPos);
        yPos += 5;

        doc.autoTable({
            startY: yPos,
            head: [['Producto', 'Cantidad']],
            body: bodyData,
            tableWidth: 'auto',
        });
        
        yPos = (doc as any).autoTable.previous.finalY + 10;
    });

    doc.save(`Reporte_Contenedores.pdf`);
    toast({ title: 'Éxito', description: 'Reporte PDF generado.' });
  };

  const handleExportXLS = (containersToExport: ContainerType[]) => {
    let html = '<table><thead><tr><th>Contenedor</th><th>Llegada a Puerto</th><th>Estado</th><th>Fecha Creación</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>';

    containersToExport.forEach(container => {
        if (container.products.length > 0) {
            container.products.forEach((product, index) => {
                html += '<tr>';
                if (index === 0) {
                    html += `<td rowspan="${container.products.length}">${container.id}</td>`;
                    html += `<td rowspan="${container.products.length}">${container.eta}</td>`;
                    html += `<td rowspan="${container.products.length}">${container.status}</td>`;
                    html += `<td rowspan="${container.products.length}">${container.creationDate}</td>`;
                }
                html += `<td>${product.name}</td>`;
                html += `<td>${product.quantity}</td>`;
                html += '</tr>';
            });
        } else {
            html += '<tr>';
            html += `<td>${container.id}</td>`;
            html += `<td>${container.eta}</td>`;
            html += `<td>${container.status}</td>`;
            html += `<td>${container.creationDate}</td>`;
            html += `<td>-</td>`;
            html += `<td>-</td>`;
            html += '</tr>';
        }
    });

    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Contenedores.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Éxito', description: 'Reporte Excel generado.' });
  };
  
  const handleReceiveContainer = (containerId: string, reservations: Reservation[]) => {
     receiveContainer(containerId, reservations);
      toast({
          title: `Contenedor ${containerId} Recibido`,
          description: "El contenido ha sido agregado al inventario de Zona Franca. Se ha notificado al equipo sobre la llegada de nuevo material.",
      });
  };
  
  const handleOpenAddContainerDialog = () => {
    setNewContainerId('');
    setNewContainerEta('');
    setNewContainerProducts([]);
    setBrand('');
    setLine('');
    setProductName('');
    setQuantity('');
    setIsAddContainerDialogOpen(true);
  }

  const renderActiveList = (list: ContainerType[]) => (
      <div className="space-y-8">
          {list.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              canEditStatus={canEditStatus}
              canEditContainer={canEditContainer}
              canCreateReservation={canCreateReservation}
              onEdit={handleOpenEditDialog}
              onStatusChange={handleStatusChange}
              onReceive={handleReceiveContainer}
              onReserve={handleCreateReservationFromContainer}
            />
          ))}
          {list.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay contenedores en tránsito.</p>
          )}
      </div>
  );

  const renderHistoryList = (list: ContainerType[]) => (
       <Accordion type="single" collapsible className="w-full space-y-4">
        {list.map((container) => (
            <ContainerHistoryItem key={container.id} container={container} />
        ))}
        {list.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay contenedores en el historial.</p>
        )}
      </Accordion>
  );
  
  const containersForExportDialog = activeTab === 'historial' ? historyContainers : activeContainers;

  const ProductForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-2 p-4 border rounded-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={brand} onValueChange={(v) => {setBrand(v); setLine('');}}>
                <SelectTrigger><SelectValue placeholder="Seleccione una marca" /></SelectTrigger>
                <SelectContent>
                    {brandOptions.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
            <Label>Línea</Label>
            <Select value={line} onValueChange={setLine} disabled={!brand}>
                <SelectTrigger><SelectValue placeholder="Seleccione una línea" /></SelectTrigger>
                <SelectContent>
                    {lineOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
            </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2 items-end pt-2">
            <div className="space-y-2">
                <Label>Nombre del Producto</Label>
                <Input
                placeholder="Ingrese el nombre del nuevo producto"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                type="number"
                placeholder="Cant."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />
            </div>
            <Button onClick={() => handleAddProductToContainer(isEditing)} className="self-end">Agregar</Button>
        </div>
    </div>
  );

 const ProductList = ({ products, isEditing }: { products: Product[], isEditing: boolean }) => (
    <div className="rounded-md border max-h-48 overflow-y-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map(p => (
                    <TableRow key={p.name}>
                        <TableCell>
                            <div>{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.brand} &gt; {p.line}</div>
                        </TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProductFromList(p.name, isEditing)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {products.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                            No hay productos agregados.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
 );


  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Contenedores</CardTitle>
            <CardDescription>Agregue, edite y gestione los contenedores y sus productos.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {canEditContainer && (
                <Button onClick={handleOpenAddContainerDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Contenedor
                </Button>
            )}
             <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <FileDown className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Configurar Exportación</DialogTitle>
                        <DialogDescription>
                          Seleccione los contenedores a exportar. Si no selecciona ninguno, se exportarán todos los de la vista actual ({activeTab === 'historial' ? 'historial' : 'en tránsito'}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                       <div className="space-y-2">
                         <Label>Contenedores en {activeTab === 'historial' ? 'Historial' : 'Tránsito'}</Label>
                         <ScrollArea className="h-60 rounded-md border p-2">
                            {containersForExportDialog.map(c => (
                                <div key={c.id} className="flex items-center space-x-2 p-1">
                                    <Checkbox
                                        id={`export-${c.id}`}
                                        checked={selectedContainersForExport[c.id] || false}
                                        onCheckedChange={(checked) => handleExportOptionChange(c.id, Boolean(checked))}
                                    />
                                    <Label htmlFor={`export-${c.id}`} className="font-normal text-sm">{c.id}</Label>
                                </div>
                            ))}
                            {containersForExportDialog.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No hay contenedores.</p>}
                         </ScrollArea>
                       </div>
                       <div className="space-y-2">
                         <Label>Formato de Archivo</Label>
                          <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as 'pdf' | 'xls')} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pdf" id="format-pdf" />
                              <Label htmlFor="format-pdf">PDF</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="xls" id="format-xls" />
                              <Label htmlFor="format-xls">Excel (XLS)</Label>
                            </div>
                          </RadioGroup>
                       </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleExport}>Exportar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="en-transito" onValueChange={setActiveTab} className="w-full">
        <TabsList>
            <TabsTrigger value="en-transito">En Tránsito ({activeContainers.length})</TabsTrigger>
            <TabsTrigger value="historial">Historial ({historyContainers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="en-transito" className="pt-4">
           {renderActiveList(activeContainers)}
        </TabsContent>
        <TabsContent value="historial" className="pt-4">
           {renderHistoryList(historyContainers)}
        </TabsContent>
      </Tabs>
      
      {/* Add Container Dialog */}
      <Dialog open={isAddContainerDialogOpen} onOpenChange={setIsAddContainerDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
              <DialogTitle>Agregar Nuevo Contenedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="container-id">ID del Contenedor</Label>
                <Input id="container-id" value={newContainerId} onChange={(e) => setNewContainerId(e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="container-eta">Llegada a Puerto</Label>
                <Input id="container-eta" type="date" value={newContainerEta} onChange={(e) => setNewContainerEta(e.target.value)} />
                </div>
              </div>
              <Separator />
               <h4 className="font-medium text-center">Productos del Contenedor</h4>
              <ProductForm isEditing={false} />
              <ProductList products={newContainerProducts} isEditing={false} />
          </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddContainer}>Guardar Contenedor</Button>
          </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Edit Container Dialog */}
      {editingContainer && (
        <Dialog open={isEditContainerDialogOpen} onOpenChange={setIsEditContainerDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Contenedor {editingContainer.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-container-id">ID del Contenedor</Label>
                            <Input id="edit-container-id" value={editingContainer.id} onChange={(e) => setEditingContainer({...editingContainer, id: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-container-eta">Llegada a Puerto</Label>
                            <Input id="edit-container-eta" type="date" value={editingContainer.eta} onChange={(e) => setEditingContainer({...editingContainer, eta: e.target.value})} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select
                            value={editingContainer.status}
                            onValueChange={(value) => setEditingContainer(c => c ? {...c, status: value as ContainerType['status']} : null)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {containerStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <h4 className="font-medium text-center">Productos del Contenedor</h4>
                    <ProductForm isEditing={true} />
                    <ProductList products={editingContainer.products} isEditing={true} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" onClick={() => setEditingContainer(null)}>Cancelar</Button></DialogClose>
                    <Button onClick={handleEditContainer}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
