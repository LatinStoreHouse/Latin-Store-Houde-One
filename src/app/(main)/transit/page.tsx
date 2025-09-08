

'use client';
import React, { useState, useMemo, useContext, useEffect } from 'react';
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
import { Role, roles } from '@/lib/roles';
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
import { productDimensions } from '@/lib/dimensions';
import { Combobox } from '@/components/ui/combobox';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Utility function to safely get base64 from an image
const getImageBase64 = (src: string): Promise<{ base64: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve({ base64: dataURL, width: img.width, height: img.height });
            } catch (e) {
                console.error("Error converting canvas to data URL", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image for PDF conversion:", src, e);
            resolve(null); // Resolve with null if the image fails to load
        };
    });
};

const addPdfHeader = async (doc: jsPDF) => {
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    if (latinLogoData) {
        const logoWidth = 20;
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        doc.addImage(latinLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Latin Store House S.A.S', pageWidth - 14, 15, { align: 'right' });
    doc.text('NIT: 900493221-0', pageWidth - 14, 19, { align: 'right' });
};


const containerStatuses: ContainerStatus[] = ['En producción', 'En tránsito', 'En puerto', 'Atrasado', 'Ya llego'];

const TabTriggerWithIndicator = ({ value, hasAlert, children }: { value: string, hasAlert: boolean, children: React.ReactNode }) => {
    return (
        <TabsTrigger value={value} className="relative">
            {children}
            {hasAlert && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />}
        </TabsTrigger>
    );
};

const ContainerCard = ({ container, canEditStatus, canEditContainer, canCreateReservation, canReceiveContainer, onEdit, onStatusChange, onReceive, onReserve }: {
    container: ContainerType;
    canEditStatus: boolean;
    canEditContainer: boolean;
    canCreateReservation: boolean;
    canReceiveContainer: boolean;
    onEdit: (container: ContainerType) => void;
    onStatusChange: (containerId: string, newStatus: ContainerStatus) => void;
    onReceive: (containerId: string, reservations: Reservation[]) => void;
    onReserve: (containerId: string) => void;
}) => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error("Context not found");
    const { reservations } = context;

    const isDelayed = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(container.eta) < today && container.status !== 'Ya llego';
    }, [container.eta, container.status]);

    const displayStatus = isDelayed ? 'Atrasado' : container.status;

    const getReservationsForProduct = (containerId: string, productName: string): Reservation[] => {
        return reservations.filter(
            (r) => r.sourceId === containerId && r.product === productName && r.status === 'Validada'
        );
    };

    const getValidatedReservedQuantity = (productReservations: Reservation[]): number => {
        return productReservations.reduce((sum, r) => sum + r.quantity, 0);
    };

    const getStatusBadgeColor = (status: ContainerType['status'] | 'Atrasado') => {
        switch (status) {
            case 'En producción': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'En tránsito': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'En puerto': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Atrasado': return 'bg-red-100 text-red-800 border-red-200';
            case 'Ya llego': return 'bg-green-100 text-green-800 border-green-200';
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
                     {canEditStatus && container.status !== 'Ya llego' ? (
                        <Select value={container.status} onValueChange={(value) => onStatusChange(container.id, value as ContainerStatus)}>
                            <SelectTrigger className={cn("w-[180px]", getStatusBadgeColor(displayStatus))}>
                                <SelectValue>{displayStatus}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {containerStatuses.filter(s => s !== 'Ya llego' && s !== 'Atrasado').map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     ) : (
                        <Badge className={cn("text-base", getStatusBadgeColor(displayStatus))}>{displayStatus}</Badge>
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
                {canCreateReservation && container.status !== 'Ya llego' && (
                     <Button variant="default" size="sm" onClick={() => onReserve(container.id)}>
                        <BookUser className="mr-2 h-4 w-4" />
                        Crear Reserva
                    </Button>
                )}
                {canEditContainer && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(container)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                )}
                 {canReceiveContainer && container.status !== 'Ya llego' && (
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
                 )}
            </CardFooter>
        </Card>
    );
};

const ProductForm = ({ onAddProduct }: { onAddProduct: (product: Product) => void }) => {
    const { inventoryData } = useContext(InventoryContext)!;
    
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewLine, setIsNewLine] = useState(false);

    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState('');
    const [line, setLine] = useState('');
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState<number | string>('');

    const { toast } = useToast();

    const existingProductsList = useMemo(() => {
        const products: { value: string; label: string; brand: string; line: string; size: string; }[] = [];
        for (const brand in inventoryData) {
            for (const line in inventoryData[brand]) {
                for (const name in inventoryData[brand][line]) {
                    products.push({
                        value: name,
                        label: `${name} (${brand} > ${line})`,
                        brand: brand,
                        line: line,
                        size: productDimensions[name as keyof typeof productDimensions] || ''
                    });
                }
            }
        }
        return products;
    }, [inventoryData]);

    const brandOptions = useMemo(() => Object.keys(inventoryData).map(b => ({ value: b, label: b })), [inventoryData]);
    const lineOptions = useMemo(() => {
        if (!brand || !inventoryData[brand as keyof typeof inventoryData]) return [];
        return Object.keys(inventoryData[brand as keyof typeof inventoryData]).map(l => ({ value: l, label: l }));
    }, [brand, inventoryData]);
    
    const resetForm = () => {
        setProductName('');
        setBrand('');
        setLine('');
        setSize('');
        setQuantity('');
        setIsNewProduct(false);
        setIsNewBrand(false);
        setIsNewLine(false);
    };
    
    const handleToggleNewProduct = (checked: boolean) => {
        setIsNewProduct(checked);
        setProductName('');
        setBrand('');
        setLine('');
        setSize('');
    };

    const handleToggleNewBrand = (checked: boolean) => {
        setIsNewBrand(checked);
        setBrand('');
        setLine('');
    };

    const handleToggleNewLine = (checked: boolean) => {
        setIsNewLine(checked);
        setLine('');
    };

    const handleSelectExistingProduct = (value: string) => {
        const existing = existingProductsList.find(p => p.value === value);
        setProductName(value);
        if (existing) {
            setBrand(existing.brand);
            setLine(existing.line);
            setSize(existing.size);
        }
    };
    
    const handleSubmit = () => {
        if (!productName || !brand || !line || !quantity) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos del producto.' });
            return;
        }
        onAddProduct({
            name: productName,
            quantity: Number(quantity),
            brand: brand,
            line: line,
            size: size
        });
        resetForm();
    };

    return (
        <div className="space-y-4 p-4 border rounded-md">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is-new-product"
                    checked={isNewProduct}
                    onCheckedChange={handleToggleNewProduct}
                />
                <Label htmlFor="is-new-product">Agregar producto nuevo</Label>
            </div>

            <div className="space-y-2">
                <Label>Nombre del Producto</Label>
                {isNewProduct ? (
                     <Input 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Escriba el nombre del nuevo producto..."
                    />
                ) : (
                    <Combobox
                        options={existingProductsList}
                        value={productName}
                        onValueChange={handleSelectExistingProduct}
                        placeholder="Seleccione un producto existente"
                        searchPlaceholder="Buscar producto..."
                        emptyPlaceholder="No se encontró producto."
                    />
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <Checkbox id="is-new-brand" checked={isNewBrand} onCheckedChange={handleToggleNewBrand} disabled={!isNewProduct} />
                        <Label htmlFor="is-new-brand">Agregar marca nueva</Label>
                    </div>
                    {isNewBrand ? (
                        <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nombre de la nueva marca" disabled={!isNewProduct} />
                    ) : (
                        <Combobox
                            options={brandOptions}
                            value={brand}
                            onValueChange={(value) => { setBrand(value); setLine(''); }}
                            placeholder="Seleccione una marca"
                            searchPlaceholder="Buscar marca..."
                            emptyPlaceholder="No hay marcas."
                            disabled={!isNewProduct}
                        />
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <Checkbox id="is-new-line" checked={isNewLine} onCheckedChange={handleToggleNewLine} disabled={!isNewProduct || !brand} />
                        <Label htmlFor="is-new-line" className={!brand ? 'text-muted-foreground' : ''}>Agregar línea nueva</Label>
                    </div>
                    {isNewLine ? (
                         <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Nombre de la nueva línea" disabled={!isNewProduct || !brand} />
                    ) : (
                        <Combobox
                            options={lineOptions}
                            value={line}
                            onValueChange={setLine}
                            placeholder="Seleccione una línea"
                            searchPlaceholder="Buscar línea..."
                            emptyPlaceholder="No hay líneas para esta marca."
                            disabled={!isNewProduct || !brand}
                        />
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tamaño (opcional)</Label>
                    <Input
                        placeholder="Ej: 1.22x0.61 Mts"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        disabled={!isNewProduct}
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
            </div>
            <div className="flex justify-end pt-2">
                <Button onClick={handleSubmit}>Agregar Producto</Button>
            </div>
        </div>
    );
};


export default function TransitPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, containers, addContainer, editContainer, receiveContainer, revertContainerReception } = context;
  const { currentUser } = useUser();
  const router = useRouter();

  const [isAddContainerDialogOpen, setIsAddContainerDialogOpen] = useState(false);
  const [isEditContainerDialogOpen, setIsEditContainerDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const [editingContainer, setEditingContainer] = useState<ContainerType | null>(null);
  const [newContainer, setNewContainer] = useState<Omit<ContainerType, 'status' | 'creationDate'>>({ id: '', eta: '', carrier: '', products: [] });

  const [selectedContainersForExport, setSelectedContainersForExport] = useState<Record<string, boolean>>({});
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xls'>('pdf');
  const [activeTab, setActiveTab] = useState('en-transito');
  const { toast } = useToast();
  
  const userPermissions = useMemo(() => {
    const permissions = new Set<string>();
    currentUser.roles.forEach(userRole => {
      const roleConfig = roles.find(r => r.name === userRole);
      if (roleConfig) {
        roleConfig.permissions.forEach(p => permissions.add(p));
      }
    });
    return Array.from(permissions);
  }, [currentUser.roles]);

  const canCreateContainer = userPermissions.includes('inventory:transit:create');
  const canEditContainer = userPermissions.includes('inventory:transit:edit');
  const canEditStatus = canEditContainer;
  const canCreateReservation = userPermissions.includes('reservations:create');
  const canReceiveContainer = userPermissions.includes('inventory:transit:receive');

  const { activeContainers, historyContainers, hasLateContainers } = useMemo(() => {
    const active = containers.filter(c => c.status !== 'Ya llego');
    const history = containers.filter(c => c.status === 'Ya llego');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const late = active.some(c => new Date(c.eta) < today && c.status !== 'Ya llego');

    return { activeContainers: active, historyContainers: history, hasLateContainers: late };
  }, [containers]);


  const handleAddProductToNewContainer = (product: Product) => {
    setNewContainer(prev => ({...prev, products: [...prev.products, product] }));
  };

  const handleRemoveProductFromNewContainer = (productName: string) => {
    setNewContainer(prev => ({...prev, products: prev.products.filter(p => p.name !== productName) }));
  };
  
   const handleAddProductToEditingContainer = (product: Product) => {
    if (!editingContainer) return;
    setEditingContainer(prev => prev ? {...prev, products: [...prev.products, product] } : null);
  };
  
   const handleRemoveProductFromEditingContainer = (productName: string) => {
    if (!editingContainer) return;
    setEditingContainer(prev => prev ? {...prev, products: prev.products.filter(p => p.name !== productName) } : null);
  };

  const handleOpenAddDialog = () => {
    setNewContainer({ id: '', eta: '', carrier: '', products: [] });
    setIsAddContainerDialogOpen(true);
  };

  const handleOpenEditDialog = (container: ContainerType) => {
    setEditingContainer(JSON.parse(JSON.stringify(container))); // Deep copy
    setIsEditContainerDialogOpen(true);
  };

  const handleSaveNewContainer = () => {
    if (!newContainer.id || !newContainer.eta) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete el ID y la fecha de llegada.' });
        return;
    }
    const containerToAdd: ContainerType = {
      ...newContainer,
      id: newContainer.id.toUpperCase(),
      status: 'En producción',
      creationDate: new Date().toISOString().split('T')[0],
    };
    addContainer(containerToAdd);
    setIsAddContainerDialogOpen(false);
    toast({ title: 'Éxito', description: 'Contenedor agregado correctamente.' });
  };
  
  const handleSaveChangesToContainer = () => {
    if (!editingContainer) return;
    editContainer(editingContainer.id, editingContainer);
    setIsEditContainerDialogOpen(false);
    setEditingContainer(null);
    toast({ title: 'Éxito', description: 'Contenedor actualizado correctamente.' });
  };
  
  const handleStatusChange = (containerId: string, newStatus: ContainerStatus) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    if (newStatus === 'Ya llego') {
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
    const doc = new jsPDF({ format: 'letter' });
    
    await addPdfHeader(doc);
    
    doc.setFontSize(14);
    doc.text('Reporte de Contenedores', 14, 45);
    
    let yPos = 50;

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
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
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

  const handleRevertContainer = (containerId: string) => {
    try {
        revertContainerReception(containerId);
        toast({
            title: `Contenedor ${containerId} Revertido`,
            description: "El contenedor ha sido devuelto a 'En puerto' y el stock ha sido ajustado.",
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error al Revertir',
            description: error.message,
        });
    }
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
              canReceiveContainer={canReceiveContainer}
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
            <ContainerHistoryItem 
              key={container.id} 
              container={container} 
              onRevert={handleRevertContainer}
              canRevert={canReceiveContainer}
            />
        ))}
        {list.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay contenedores en el historial.</p>
        )}
      </Accordion>
  );
  
  const containersForExportDialog = activeTab === 'historial' ? historyContainers : activeContainers;

 const ProductList = ({ products, onRemove }: { products: Product[], onRemove: (productName: string) => void }) => (
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
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(p.name)}>
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
            {canCreateContainer && (
                <Button onClick={handleOpenAddDialog}>
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
            <TabTriggerWithIndicator value="en-transito" hasAlert={hasLateContainers}>En Tránsito ({activeContainers.length})</TabTriggerWithIndicator>
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
                <Input id="container-id" value={newContainer.id} onChange={(e) => setNewContainer({...newContainer, id: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="container-eta">Llegada a Puerto</Label>
                <Input id="container-eta" type="date" value={newContainer.eta} onChange={(e) => setNewContainer({...newContainer, eta: e.target.value})} />
                </div>
              </div>
              <Separator />
               <h4 className="font-medium text-center">Productos del Contenedor</h4>
              <ProductForm onAddProduct={handleAddProductToNewContainer} />
              <ProductList products={newContainer.products} onRemove={handleRemoveProductFromNewContainer} />
          </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveNewContainer}>Guardar Contenedor</Button>
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
                    <ProductForm onAddProduct={handleAddProductToEditingContainer} />
                    <ProductList products={editingContainer.products} onRemove={handleRemoveProductFromEditingContainer} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" onClick={() => setEditingContainer(null)}>Cancelar</Button></DialogClose>
                    <Button onClick={handleSaveChangesToContainer}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
