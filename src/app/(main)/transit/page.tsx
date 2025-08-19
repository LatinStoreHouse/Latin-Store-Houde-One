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
import { PlusCircle, Container, Ship, CalendarIcon, FileDown, Edit, CheckCircle, FileUp, FileType, X, ChevronDown, Trash2 } from 'lucide-react';
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
import { Combobox } from '@/components/ui/combobox';
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
                                <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Llegada a Puerto: {container.eta}</span>
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
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar como Recibido
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Recepción</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        ¿Está seguro de que desea marcar este contenedor como recibido? Esta acción no se puede deshacer y moverá el contenedor al historial.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onReceive(container.id)}>
                                        Confirmar Recepción
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
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
  const [newContainerProducts, setNewContainerProducts] = useState<Product[]>([]);
  const [productToAdd, setProductToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState<number | string>('');

  const [isAddContainerDialogOpen, setIsAddContainerDialogOpen] = useState(false);
  const [isEditContainerDialogOpen, setIsEditContainerDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainersForExport, setSelectedContainersForExport] = useState<Record<string, boolean>>({});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xls'>('pdf');
  const [activeTab, setActiveTab] = useState('en-transito');
  const { toast } = useToast();
  
  const canEdit = currentUserRole === 'Administrador' || currentUserRole === 'Logística' || currentUserRole === 'Contador';

  const { activeContainers, historyContainers } = useMemo(() => {
    const active = containers.filter(c => c.status !== 'Llegado');
    const history = containers.filter(c => c.status === 'Llegado');
    return { activeContainers: active, historyContainers: history };
  }, [containers]);


  const handleAddContainer = () => {
    if (!newContainerId || !newContainerEta) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete el ID y la fecha de llegada.' });
        return;
    }
    const newContainer: Container = {
      id: newContainerId,
      eta: newContainerEta,
      carrier: '', // Carrier removed from form
      products: newContainerProducts,
      status: 'En tránsito',
      creationDate: new Date().toISOString().split('T')[0],
    };
    setContainers([newContainer, ...containers]);
    setNewContainerId('');
    setNewContainerEta('');
    setNewContainerProducts([]);
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


  const handleAddProductToContainer = () => {
    if (!productToAdd || Number(quantityToAdd) <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un producto y una cantidad válida.' });
        return;
    }
    setNewContainerProducts(prev => {
        const existingProductIndex = prev.findIndex(p => p.name === productToAdd);
        if (existingProductIndex !== -1) {
            const updatedProducts = [...prev];
            updatedProducts[existingProductIndex].quantity += Number(quantityToAdd);
            return updatedProducts;
        } else {
            return [...prev, { name: productToAdd, quantity: Number(quantityToAdd) }];
        }
    });
    setProductToAdd('');
    setQuantityToAdd('');
  };
  
  const handleRemoveProductFromList = (productName: string) => {
    setNewContainerProducts(prev => prev.filter(p => p.name !== productName));
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

  const handleExportPDF = (containersToExport: Container[]) => {
    const doc = new jsPDF();
    const reportTitle = `Reporte de Contenedores`;
    doc.text(reportTitle, 14, 16);
    
    let yPos = 25;

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

  const handleExportXLS = (containersToExport: Container[]) => {
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
  
  const handleOpenAddContainerDialog = () => {
    setNewContainerId('');
    setNewContainerEta('');
    setNewContainerProducts([]);
    setProductToAdd('');
    setQuantityToAdd('');
    setIsAddContainerDialogOpen(true);
  }

  const renderActiveList = (list: Container[]) => (
      <div className="space-y-8">
          {list.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              canEdit={canEdit}
              onEdit={handleOpenEditDialog}
              onReceive={handleReceiveContainer}
              onAddProduct={() => {}} // No longer needed
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
  
  const containersForExportDialog = activeTab === 'historial' ? historyContainers : activeContainers;

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
                <Button onClick={handleOpenAddContainerDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Contenedor
                </Button>
            )}
             <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar
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
              <div className="space-y-2">
                  <Label>Productos en el Contenedor</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2 items-end">
                      <Combobox
                          options={productOptions}
                          value={productToAdd}
                          onValueChange={setProductToAdd}
                          placeholder="Seleccionar o crear producto..."
                          searchPlaceholder="Buscar producto..."
                          emptyPlaceholder="No se encontraron productos."
                          allowFreeText
                      />
                       <Input
                            type="number"
                            placeholder="Cant."
                            value={quantityToAdd}
                            onChange={(e) => setQuantityToAdd(e.target.value)}
                        />
                        <Button onClick={handleAddProductToContainer}>Agregar</Button>
                  </div>
              </div>
              
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
                        {newContainerProducts.map(p => (
                            <TableRow key={p.name}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell className="text-right">{p.quantity}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProductFromList(p.name)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {newContainerProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                    No hay productos agregados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
              </div>

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Contenedor {editingContainer.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-container-id">ID del Contenedor</Label>
                        <Input id="edit-container-id" value={editingContainer.id} onChange={(e) => setEditingContainer({...editingContainer, id: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-container-eta">Llegada a Puerto</Label>
                        <Input id="edit-container-eta" type="date" value={editingContainer.eta} onChange={(e) => setEditingContainer({...editingContainer, eta: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select
                            value={editingContainer.status}
                            onValueChange={(value) => setEditingContainer({...editingContainer, status: value as Container['status']})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="En tránsito">En tránsito</SelectItem>
                                <SelectItem value="Atrasado">Atrasado</SelectItem>
                                <SelectItem value="Llegado">Llegado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
