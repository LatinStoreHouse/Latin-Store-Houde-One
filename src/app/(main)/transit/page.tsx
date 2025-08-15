'use client';
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Container, Ship, CalendarIcon, FileDown, Edit, CheckCircle, FileUp, FileType, X, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import { ContainerHistoryItem } from '@/components/container-history-item';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, containerId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'Validada' },
    { id: 'RES-002', customer: 'Diseños SAS', product: 'BLACK 1.22 X 0.61', quantity: 100, containerId: 'CMAU7654321', advisor: 'John Doe', quoteNumber: 'COT-2024-002', status: 'En espera de validación' },
];


export interface Product {
  name: string;
  quantity: number;
}

export interface Container {
  id: string;
  eta: string;
  carrier: string;
  products: Product[];
  status: 'En tránsito' | 'Atrasado' | 'Llegado';
  creationDate: string;
}

const productOptions = [
    { value: 'CUT STONE 120 X 60', label: 'CUT STONE 120 X 60' },
    { value: 'TRAVERTINO', label: 'TRAVERTINO' },
    { value: 'CONCRETO ENCOFRADO', label: 'CONCRETO ENCOFRADO' },
    { value: 'BLACK 1.22 X 0.61', label: 'BLACK 1.22 X 0.61' },
    { value: 'KUND MULTY 1.22 X 0.61', label: 'KUND MULTY 1.22 X 0.61' },
    // Add all other products here
];

const initialContainers: Container[] = [
    { id: 'MSCU1234567', eta: '2024-08-15', carrier: 'Maersk', status: 'En tránsito', products: [{ name: 'CUT STONE 120 X 60', quantity: 200 }, { name: 'TRAVERTINO', quantity: 150 }], creationDate: '2024-07-01' },
    { id: 'CMAU7654321', eta: '2024-08-10', carrier: 'CMA CGM', status: 'Atrasado', products: [{ name: 'BLACK 1.22 X 0.61', quantity: 500 }], creationDate: '2024-07-05' },
    { id: 'ARRIVED001', eta: '2024-07-20', carrier: 'MSC', status: 'Llegado', products: [{ name: 'KUND MULTY 1.22 X 0.61', quantity: 300 }], creationDate: '2024-07-02' },
];

const currentUserRole: Role = 'Administrador';

const ContainerCard = ({ container, canEdit, onEdit, onReceive, onAddProduct }: {
    container: Container;
    canEdit: boolean;
    onEdit: (container: Container) => void;
    onReceive: (containerId: string) => void;
    onAddProduct: (containerId: string) => void;
}) => {
    const getValidatedReservedQuantity = (containerId: string, productName: string): number => {
        return initialReservations
            .filter(r => r.containerId === containerId && r.product === productName && r.status === 'Validada')
            .reduce((sum, r) => sum + r.quantity, 0);
    };

    const getStatusBadge = (status: Container['status']) => {
        switch (status) {
            case 'En tránsito': return 'secondary';
            case 'Atrasado': return 'destructive';
            case 'Llegado': return 'success';
            default: return 'outline';
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
                                <span className="flex items-center gap-2"><Ship className="h-4 w-4" /> {container.carrier}</span>
                                <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> ETA: {container.eta}</span>
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant={getStatusBadge(container.status)}>{container.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
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
                            const reservedQuantity = getValidatedReservedQuantity(container.id, product.name);
                            const availableQuantity = product.quantity - reservedQuantity;
                            return (
                                <TableRow key={index}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell className="text-right">{product.quantity}</TableCell>
                                    <TableCell className="text-right">{reservedQuantity}</TableCell>
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
            </CardContent>
            {canEdit && (
                <CardFooter className="flex justify-end p-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(container)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    {container.status !== 'Llegado' && (
                       <>
                         <Button
                            variant="success"
                            size="sm"
                            onClick={() => onReceive(container.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Recibido
                          </Button>
                        <Button variant="outline" size="sm" onClick={() => onAddProduct(container.id)}>Agregar Producto</Button>
                       </>
                    )}
                </CardFooter>
            )}
        </Card>
    );
};

export default function TransitPage() {
  const [containers, setContainers] = useState<Container[]>(initialContainers);
  const [newContainerId, setNewContainerId] = useState('');
  const [newContainerEta, setNewContainerEta] = useState('');
  const [newContainerCarrier, setNewContainerCarrier] = useState('');
  const [isAddContainerDialogOpen, setIsAddContainerDialogOpen] = useState(false);
  const [isEditContainerDialogOpen, setIsEditContainerDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState(0);
  const { toast } = useToast();
  
  const canEdit = currentUserRole === 'Administrador' || currentUserRole === 'Logística' || currentUserRole === 'Contador';

  const { activeContainers, historyContainers } = useMemo(() => {
    const active = containers.filter(c => c.status !== 'Llegado');
    const history = containers.filter(c => c.status === 'Llegado');
    return { activeContainers: active, historyContainers: history };
  }, [containers]);


  const handleAddContainer = () => {
    if (!newContainerId || !newContainerEta || !newContainerCarrier) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos para agregar un contenedor.' });
        return;
    }
    const newContainer: Container = {
      id: newContainerId,
      eta: newContainerEta,
      carrier: newContainerCarrier,
      products: [],
      status: 'En tránsito',
      creationDate: new Date().toISOString().split('T')[0],
    };
    setContainers([newContainer, ...containers]);
    setNewContainerId('');
    setNewContainerEta('');
    setNewContainerCarrier('');
    setIsAddContainerDialogOpen(false);
    toast({ title: 'Éxito', description: 'Contenedor agregado correctamente.' });
  };
  
  const handleOpenEditDialog = (container: Container) => {
    setEditingContainer(container);
    setIsEditContainerDialogOpen(true);
  };

  const handleEditContainer = () => {
    if (!editingContainer) return;
    setContainers(containers.map(c => c.id === editingContainer.id ? editingContainer : c));
    setIsEditContainerDialogOpen(false);
    setEditingContainer(null);
    toast({ title: 'Éxito', description: 'Contenedor actualizado correctamente.' });
  };


  const handleOpenAddProductDialog = (containerId: string) => {
    setSelectedContainerId(containerId);
    setIsAddProductDialogOpen(true);
  }

  const handleAddProductToContainer = () => {
    if (!selectedContainerId || !newProductName || newProductQuantity <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y una cantidad válida.' });
        return;
    }
    setContainers(containers.map(c => {
      if (c.id === selectedContainerId) {
        const existingProductIndex = c.products.findIndex(p => p.name === newProductName);
        if (existingProductIndex !== -1) {
          const updatedProducts = [...c.products];
          updatedProducts[existingProductIndex].quantity += newProductQuantity;
          return { ...c, products: updatedProducts };
        } else {
          return { ...c, products: [...c.products, { name: newProductName, quantity: newProductQuantity }] };
        }
      }
      return c;
    }));
    setNewProductName('');
    setNewProductQuantity(0);
    setIsAddProductDialogOpen(false);
    toast({ title: 'Éxito', description: 'Producto agregado al contenedor.' });
  };

  const handleExportPDF = (target: 'active' | 'history') => {
    const containersToExport = target === 'active' ? activeContainers : historyContainers;
    if (containersToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay contenedores para exportar.' });
        return;
    }

    const doc = new jsPDF();
    doc.text(`Reporte de Contenedores - ${target === 'active' ? 'En Tránsito' : 'Historial'}`, 14, 16);
    
    containersToExport.forEach((container, index) => {
        if (index > 0) doc.addPage();
        
        const bodyData = container.products.map(p => [p.name, p.quantity]);
        
        doc.autoTable({
            startY: 32,
            head: [['Producto', 'Cantidad']],
            body: bodyData,
            tableWidth: 'auto',
            didDrawPage: (data) => {
                doc.setFontSize(12);
                doc.text(`Contenedor: ${container.id}`, 14, 10);
                doc.text(`Transportista: ${container.carrier}`, 14, 15);
                doc.text(`ETA: ${container.eta} | Estado: ${container.status}`, 14, 20);
                doc.text(`Fecha Creación: ${container.creationDate}`, 14, 25);
            }
        });
    });

    doc.save(`Reporte de Contenedores - ${target}.pdf`);
    toast({ title: 'Éxito', description: 'Reporte PDF generado.' });
  };

  const handleExportHTML = (target: 'active' | 'history') => {
    const containersToExport = target === 'active' ? activeContainers : historyContainers;
    if (containersToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay contenedores para exportar.' });
        return;
    }

    let html = '<table><thead><tr><th>Contenedor</th><th>Transportista</th><th>ETA</th><th>Estado</th><th>Fecha Creación</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>';

    containersToExport.forEach(container => {
        if (container.products.length > 0) {
            container.products.forEach((product, index) => {
                html += '<tr>';
                if (index === 0) {
                    html += `<td rowspan="${container.products.length}">${container.id}</td>`;
                    html += `<td rowspan="${container.products.length}">${container.carrier}</td>`;
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
            html += `<td>${container.carrier}</td>`;
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
    a.download = `Reporte de Contenedores - ${target}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Éxito', description: 'Reporte Excel generado.' });
  };
  
  const handleReceiveContainer = (containerId: string) => {
     setContainers(prevContainers => 
         prevContainers.map(c => 
             c.id === containerId ? { ...c, status: 'Llegado' } : c
         )
     );
      toast({
          title: `Contenedor ${containerId} Recibido`,
          description: "El contenedor ha sido movido al historial.",
      });
  };

  const renderActiveList = (list: Container[]) => (
      <div className="space-y-8">
          {list.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              canEdit={canEdit}
              onEdit={handleOpenEditDialog}
              onReceive={handleReceiveContainer}
              onAddProduct={handleOpenAddProductDialog}
            />
          ))}
          {list.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay contenedores en tránsito.</p>
          )}
      </div>
  );

  const renderHistoryList = (list: Container[]) => (
       <Accordion type="single" collapsible className="w-full space-y-4">
        {list.map((container) => (
            <ContainerHistoryItem key={container.id} container={container} />
        ))}
        {list.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay contenedores en el historial.</p>
        )}
      </Accordion>
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
            {canEdit && (
                <Button onClick={() => setIsAddContainerDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Contenedor
                </Button>
            )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuContent>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Contenedores Activos</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleExportPDF('active')}>
                                        <FileType className="mr-2 h-4 w-4" />
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExportHTML('active')}>
                                        <FileUp className="mr-2 h-4 w-4" />
                                        Excel (XLS)
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Historial de Contenedores</DropdownMenuSubTrigger>
                             <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleExportPDF('history')}>
                                        <FileType className="mr-2 h-4 w-4" />
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExportHTML('history')}>
                                        <FileUp className="mr-2 h-4 w-4" />
                                        Excel (XLS)
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="en-transito" className="w-full">
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
          <DialogContent>
          <DialogHeader>
              <DialogTitle>Agregar Nuevo Contenedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
              <Label htmlFor="container-id">ID del Contenedor</Label>
              <Input id="container-id" value={newContainerId} onChange={(e) => setNewContainerId(e.target.value)} />
              </div>
              <div className="space-y-2">
              <Label htmlFor="container-eta">Fecha Estimada de Llegada (ETA)</Label>
              <Input id="container-eta" type="date" value={newContainerEta} onChange={(e) => setNewContainerEta(e.target.value)} />
              </div>
              <div className="space-y-2">
              <Label htmlFor="container-carrier">Transportista</Label>
              <Input id="container-carrier" value={newContainerCarrier} onChange={(e) => setNewContainerCarrier(e.target.value)} />
              </div>
          </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddContainer}>Agregar</Button>
          </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Edit Container Dialog */}
      {editingContainer && (
        <Dialog open={isEditContainerDialogOpen} onOpenChange={setIsEditContainerDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Contenedor {editingContainer.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-container-id">ID del Contenedor</Label>
                        <Input id="edit-container-id" value={editingContainer.id} onChange={(e) => setEditingContainer({...editingContainer, id: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-container-eta">Fecha Estimada de Llegada (ETA)</Label>
                        <Input id="edit-container-eta" type="date" value={editingContainer.eta} onChange={(e) => setEditingContainer({...editingContainer, eta: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-container-carrier">Transportista</Label>
                        <Input id="edit-container-carrier" value={editingContainer.carrier} onChange={(e) => setEditingContainer({...editingContainer, carrier: e.target.value})} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" onClick={() => setEditingContainer(null)}>Cancelar</Button></DialogClose>
                    <Button onClick={handleEditContainer}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Agregar Producto a {selectedContainerId}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={newProductName}
                            onValueChange={setNewProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontraron productos"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input type="number" value={newProductQuantity} onChange={e => setNewProductQuantity(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" onClick={() => setIsAddProductDialogOpen(false)}>Cancelar</Button></DialogClose>
                    <Button onClick={handleAddProductToContainer}>Agregar Producto</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
