

'use client';
import React, { useState, useContext, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Save, Truck, BadgeCheck, BellRing, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TransferInventoryForm, type TransferItem } from '@/components/transfer-inventory-form';
import { InventoryContext, Reservation } from '@/context/inventory-context';
import { useUser } from '@/app/(main)/layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { productDimensions } from '@/lib/dimensions';
import { useBeforeUnload } from '@/hooks/use-before-unload';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ProductTable = ({ products, brand, subCategory, canEdit, isPartner, isMarketing, onDataChange, inventoryData }: { products: { [key: string]: any }, brand: string, subCategory: string, canEdit: boolean, isPartner: boolean, isMarketing: boolean, onDataChange: Function, inventoryData: any }) => {
  const context = useContext(InventoryContext);
  const { currentUser } = useUser();
  if (!context || !currentUser) {
    throw new Error('ProductTable must be used within an InventoryProvider and UserProvider');
  }
  const { reservations: allReservations, toggleProductSubscription, productSubscriptions } = context;
  const canEditName = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador');
  
  const handleInputChange = (productName: string, field: string, value: string | number, isNameChange = false) => {
    const isNumber = typeof inventoryData[brand][subCategory][productName][field] === 'number';
    onDataChange(brand, subCategory, productName, field, isNumber ? Number(value) : value, isNameChange);
  };

  const getReservationsForProduct = (productName: string): Reservation[] => {
    // Only show reservations from warehouse or free zone, not from containers
    return allReservations.filter(
      (r) =>
        r.product === productName &&
        r.status === 'Validada' &&
        (r.source === 'Bodega' || r.source === 'Zona Franca')
    );
  };
  
  const getStockColorClass = (stock: number) => {
    if (stock <= 0) return 'text-red-600';
    if (stock > 0 && stock <= 20) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const canSubscribe = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');

  if (Object.keys(products).length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No hay productos en esta categoría.</p>;
  }

  // Simplified view for non-editor roles
  if (!canEdit) {
    return (
     <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">Nombre del Producto</TableHead>
            <TableHead className="p-2">Medidas</TableHead>
            <TableHead className="text-right p-2">Disponible Bodega</TableHead>
            <TableHead className="text-right p-2">Disponible Zona Franca</TableHead>
            {!isPartner && <TableHead className="text-right p-2 w-[150px]"></TableHead>}
            {isMarketing && <TableHead className="text-right p-2">Oportunidad de Campaña</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(products).map(([name, item]) => {
            if (!name) return null;
            const disponibleBodega = item.bodega - item.separadasBodega;
            const disponibleZonaFranca = item.zonaFranca - item.separadasZonaFranca;
            const totalDisponible = disponibleBodega + disponibleZonaFranca;
            const reservations = getReservationsForProduct(name);
            const totalReserved = item.separadasBodega + item.separadasZonaFranca;

            const highStock = totalDisponible > 500;
            const isSubscribed = productSubscriptions[name]?.includes(currentUser.name);

            return (
              <TableRow key={name}>
                <TableCell className="font-medium p-2">{name}</TableCell>
                <TableCell className="p-2 text-sm text-muted-foreground">{productDimensions[name as keyof typeof productDimensions] || 'N/A'}</TableCell>
                <TableCell className={cn("text-right p-2 font-bold", getStockColorClass(disponibleBodega))}>{disponibleBodega}</TableCell>
                <TableCell className={cn("text-right p-2 font-bold", getStockColorClass(disponibleZonaFranca))}>{disponibleZonaFranca}</TableCell>
               
                {!isPartner && (
                  <TableCell className="text-right p-2">
                    <div className="flex justify-end items-center gap-2">
                        {totalDisponible <= 0 && canSubscribe && (
                             <Button 
                                variant={isSubscribed ? "secondary" : "outline"} 
                                size="sm" 
                                onClick={() => toggleProductSubscription(name, currentUser.name)}
                                className="h-8"
                            >
                                <BellRing className="mr-2 h-4 w-4" />
                                {isSubscribed ? "Suscrito" : "Notificar"}
                            </Button>
                        )}
                        {totalReserved > 0 && (
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <div className="flex justify-end cursor-help">
                                   <BadgeCheck className="h-5 w-5 text-green-600" />
                                 </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p className="font-bold mb-2">Asesores que tienen separado:</p>
                                  {reservations.length > 0 ? (
                                    <ul className="list-disc pl-4">
                                      {reservations.map(r => (
                                        <li key={r.id}>
                                          {r.quantity} unid. por {r.advisor} ({r.source})
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p>No hay detalles de reserva validadas.</p>
                                  )}
                              </TooltipContent>
                           </Tooltip>
                        )}
                    </div>
                  </TableCell>
                )}
                {isMarketing && (
                    <TableCell className="text-right p-2">
                        {highStock && (
                            <Badge variant="success">Sugerencia de Contenido</Badge>
                        )}
                    </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
     </TooltipProvider>
    );
  }

  // Full view for editor roles
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="p-2">Nombre del Producto</TableHead>
          <TableHead className="p-2">Medidas</TableHead>
          <TableHead className="text-right p-2">Bodega</TableHead>
          <TableHead className="text-right p-2">Separadas Bodega</TableHead>
          <TableHead className="text-right p-2">Zona Franca</TableHead>
          <TableHead className="text-right p-2">Separadas ZF</TableHead>
          <TableHead className="text-right p-2">Muestras</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(products).map(([name, item]) => {
          if (!name) return null;
          return (
            <TableRow key={name}>
              <TableCell className="font-medium p-0">
                <Input 
                    defaultValue={name} 
                    onBlur={(e) => handleInputChange(name, 'name', e.target.value, true)}
                    className="h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent"
                    disabled={!canEditName}
                />
              </TableCell>
              <TableCell className="p-2 text-sm text-muted-foreground">{productDimensions[name as keyof typeof productDimensions] || 'N/A'}</TableCell>
              <TableCell className="text-right p-0">
                <Input type="number" defaultValue={item.bodega} onBlur={(e) => handleInputChange(name, 'bodega', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" />
              </TableCell>
              <TableCell className="text-right p-0">
                <Input type="number" defaultValue={item.separadasBodega} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-0 bg-transparent" disabled readOnly />
              </TableCell>
              <TableCell className="text-right p-0">
                <Input type="number" defaultValue={item.zonaFranca} onBlur={(e) => handleInputChange(name, 'zonaFranca', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" />
              </TableCell>
              <TableCell className="text-right p-0">
                <Input type="number" defaultValue={item.separadasZonaFranca} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-0 bg-transparent" disabled readOnly />
              </TableCell>
              <TableCell className="text-right p-0">
                 <Input type="number" defaultValue={item.muestras} onBlur={(e) => handleInputChange(name, 'muestras', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};


const detailedColumns = {
  bodega: true,
  separadasBodega: true,
  zonaFranca: true,
  separadasZonaFranca: true,
};

const simplifiedColumns = {
    disponibleBodega: true,
    disponibleZonaFranca: true,
    reservas: true,
};

const partnerColumns = {
    totalDisponible: true,
}

const TabTriggerWithIndicator = ({ value, hasAlert, children }: { value: string, hasAlert: boolean, children: React.ReactNode }) => {
    return (
        <TabsTrigger value={value} className="relative">
            {children}
            {hasAlert && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />}
        </TabsTrigger>
    );
};


export default function InventoryPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, setInventoryData, transferFromFreeZone } = context;
  const { currentUser } = useUser();

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [showUnloadAlert, setShowUnloadAlert] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  useBeforeUnload(hasPendingChanges, 'Tiene cambios sin guardar. ¿Está seguro de que desea salir?');
  
  const currentUserRole = currentUser.roles[0];
  const canEdit = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador');
  const isPartner = currentUserRole === 'Partners';
  const isMarketing = currentUserRole === 'Marketing';
  const canViewLowStockAlerts = currentUserRole === 'Logística' || currentUserRole === 'Administrador';
  
  let columnsForExport: Record<string, boolean>;
  if (canEdit) {
    columnsForExport = detailedColumns;
  } else if (isPartner) {
    columnsForExport = partnerColumns;
  } else {
    columnsForExport = simplifiedColumns;
  }
  
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf',
    columns: columnsForExport,
    brands: {} as Record<string, boolean>,
    categories: {} as Record<string, boolean>,
    products: {} as Record<string, boolean>,
  });
  const { toast } = useToast();

  const brands = Object.keys(inventoryData);
  
  const handleDataChange = (brand: string, subCategory: string, productName: string, field: string, value: any, isNameChange: boolean) => {
    setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const products = newData[brand][subCategory];

        if (isNameChange) {
            if (value !== productName && products[value]) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: `El producto "${value}" ya existe en esta categoría.`,
                });
                return prevData;
            }
            const productData = products[productName];
            delete products[productName];
            products[value] = productData;
        } else {
            products[productName][field] = value;
        }

        return newData;
    });
    if (!hasPendingChanges) setHasPendingChanges(true);
  };

  const handleSaveChanges = () => {
    console.log("Saving data:", inventoryData);
    setHasPendingChanges(false);
    toast({
        title: 'Inventario Guardado',
        description: 'Los cambios en el inventario han sido guardados exitosamente.'
    });
  }

  const formatBrandName = (brand: string) => {
    return brand;
  };

  const getFilteredDataForExport = () => {
    let filteredData: { brand: string; category: string; name: string; values: any }[] = [];
    const selectedBrands = Object.keys(exportOptions.brands).filter(b => exportOptions.brands[b]);
    const selectedCategories = Object.keys(exportOptions.categories).filter(c => exportOptions.categories[c]);
    const selectedProducts = Object.keys(exportOptions.products).filter(p => exportOptions.products[p]);

    Object.entries(inventoryData).forEach(([brand, categories]) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) return;
      
      Object.entries(categories).forEach(([category, products]) => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(category)) return;

        Object.entries(products).forEach(([productName, values]) => {
          if (selectedProducts.length > 0 && !selectedProducts.includes(productName)) return;
          
          let exportValues: Record<string, any> = {};
          if (isPartner) {
             exportValues = {
                totalDisponible: (values.bodega - values.separadasBodega) + (values.zonaFranca - values.separadasZonaFranca)
             }
          } else if (canEdit) {
             exportValues = {
                bodega: values.bodega,
                separadasBodega: values.separadasBodega,
                zonaFranca: values.zonaFranca,
                separadasZonaFranca: values.separadasZonaFranca,
             }
          } else {
            exportValues = {
              disponibleBodega: values.bodega - values.separadasBodega,
              disponibleZonaFranca: values.zonaFranca - values.separadasZonaFranca,
              reservas: (values.separadasBodega > 0 || values.separadasZonaFranca > 0) ? `Bodega: ${values.separadasBodega}, ZF: ${values.separadasZonaFranca}` : 'No'
            }
          }

          filteredData.push({
            brand,
            category,
            name: productName,
            values: exportValues
          });
        });
      });
    });
    return filteredData;
  }

  const handleExport = () => {
    if (exportOptions.format === 'pdf') {
        handleExportPDF();
    } else {
        handleExportXLS();
    }
    setIsExportDialogOpen(false);
  }

  const handleExportPDF = async () => {
    const dataToExport = getFilteredDataForExport();
    if(dataToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay datos que coincidan con los filtros seleccionados.' });
        return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Latin Store House', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Reporte de Inventario', 14, 30);

    const columns = Object.keys(exportOptions.columns).filter(c => exportOptions.columns[c as keyof typeof exportOptions.columns]);
    const head: any[] = [['Marca', 'Categoría', 'Producto']];
    head[0].push(...columns.map(c => c.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())));
    
    const body = dataToExport.map(item => {
        const row = [item.brand, item.category, item.name];
        columns.forEach(col => {
            row.push(item.values[col]);
        });
        return row;
    });

    doc.autoTable({ head, body, startY: 35 });
    doc.save('inventario.pdf');
    toast({ title: 'Éxito', description: 'Inventario exportado a PDF.' });
  }
  
  const handleExportXLS = () => {
    const dataToExport = getFilteredDataForExport();
    if(dataToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay datos que coincidan con los filtros seleccionados.' });
        return;
    }

    const columns = Object.keys(exportOptions.columns).filter(c => exportOptions.columns[c as keyof typeof exportOptions.columns]);
    const headers = ['Marca', 'Categoría', 'Producto', ...columns.map(c => c.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))];

    let html = '<table><thead><tr>';
    headers.forEach(header => html += `<th>${header}</th>`);
    html += '</tr></thead><tbody>';

    dataToExport.forEach(item => {
        html += '<tr>';
        html += `<td>${item.brand}</td>`;
        html += `<td>${item.category}</td>`;
        html += `<td>${item.name}</td>`;
        columns.forEach(col => {
            html += `<td>${item.values[col]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Éxito', description: 'Inventario exportado a Excel.' });
  }

  const handleExportOptionChange = (type: 'columns' | 'brands' | 'categories' | 'products', key: string, value: boolean) => {
    setExportOptions(prev => ({
        ...prev,
        [type]: {
            ...prev[type],
            [key]: value
        }
    }));
  }

   const handleTransfer = (items: TransferItem[]) => {
     try {
       transferFromFreeZone(items);
       setIsTransferDialogOpen(false);
       toast({ 
            title: 'Traslado Exitoso', 
            description: `${items.length} tipo(s) de producto movido(s) de Zona Franca a Bodega.` 
       });
     } catch (error: any) {
       toast({ 
            variant: 'destructive', 
            title: 'Error en el Traslado', 
            description: error.message,
            duration: 5000,
        });
     }
  };
  
  const columnLabels: Record<string, string> = {
    ...Object.fromEntries(Object.keys(detailedColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
    ...Object.fromEntries(Object.keys(simplifiedColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
    ...Object.fromEntries(Object.keys(partnerColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
  };
  
  const lowStockAlerts = useMemo(() => {
    const alerts: { [key: string]: boolean } = {};
    for (const brand in inventoryData) {
      let brandHasLowStock = false;
      for (const line in inventoryData[brand]) {
        for (const product in inventoryData[brand][line]) {
          const item = inventoryData[brand][line][product];
          const stockBodega = item.bodega - item.separadasBodega;
          const stockZF = item.zonaFranca - item.separadasZonaFranca;
          if (stockBodega <= 20 || stockZF <= 20) {
            brandHasLowStock = true;
            break;
          }
        }
        if (brandHasLowStock) break;
      }
      alerts[brand] = brandHasLowStock;
    }
    return alerts;
  }, [inventoryData]);


  return (
    <>
    <AlertDialog open={showUnloadAlert} onOpenChange={setShowUnloadAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cambios sin Guardar</AlertDialogTitle>
                <AlertDialogDescription>
                    Tiene cambios sin guardar. ¿Está seguro de que desea salir? Sus cambios se perderán.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                        Al cancelar, permanecerá en esta página.
                    </p>
                </div>
                <AlertDialogCancel onClick={() => setNextRoute(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    setHasPendingChanges(false);
                    // This is a workaround to allow navigation after confirmation
                    if (nextRoute) {
                        window.location.href = nextRoute;
                    }
                }}>Salir sin Guardar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Productos - Stock Actual</CardTitle>
        <div className="flex gap-2">
            {canEdit && (
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Truck className="mr-2 h-4 w-4" />
                            Trasladar de ZF a Bodega
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Trasladar Inventario por Lote</DialogTitle>
                            <DialogDescription>Construya un lote de productos para mover de Zona Franca a la bodega principal.</DialogDescription>
                        </DialogHeader>
                        <TransferInventoryForm onTransfer={handleTransfer} />
                    </DialogContent>
                </Dialog>
            )}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Datos
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Configurar Exportación de Inventario</DialogTitle>
                         <DialogDescription>
                            Seleccione el formato, las columnas y los filtros para su exportación.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <Label>Formato de Archivo</Label>
                              <RadioGroup value={exportOptions.format} onValueChange={(value) => setExportOptions(prev => ({...prev, format: value}))} className="flex gap-4">
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
                           <div className="space-y-2">
                             <Label>Columnas a Incluir</Label>
                             <div className="grid grid-cols-2 gap-2">
                               {Object.keys(exportOptions.columns).map(col => (
                                <div key={col} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`col-${col}`}
                                    checked={exportOptions.columns[col as keyof typeof exportOptions.columns]}
                                    onCheckedChange={(checked) => handleExportOptionChange('columns', col, Boolean(checked))}
                                  />
                                  <Label htmlFor={`col-${col}`} className="font-normal text-sm capitalize">{columnLabels[col]}</Label>
                                </div>
                               ))}
                             </div>
                           </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Filtros de Datos (Opcional)</Label>
                            <p className="text-xs text-muted-foreground">Seleccione para filtrar. Si no se selecciona nada, se exportará todo.</p>
                             <Accordion type="multiple" className="w-full">
                              <AccordionItem value="brands">
                                <AccordionTrigger>Marcas</AccordionTrigger>
                                <AccordionContent>
                                    <ScrollArea className="h-40">
                                      {Object.keys(inventoryData).map(brand => (
                                        <div key={brand} className="flex items-center space-x-2 p-1">
                                            <Checkbox
                                                id={`brand-${brand}`}
                                                checked={exportOptions.brands[brand] || false}
                                                onCheckedChange={(checked) => handleExportOptionChange('brands', brand, Boolean(checked))}
                                            />
                                            <Label htmlFor={`brand-${brand}`} className="font-normal text-sm">{brand}</Label>
                                        </div>
                                      ))}
                                    </ScrollArea>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="products">
                                <AccordionTrigger>Productos Específicos</AccordionTrigger>
                                <AccordionContent>
                                    <ScrollArea className="h-64">
                                       {Object.values(inventoryData).flatMap(categories => Object.values(categories).flatMap(products => Object.keys(products))).map(productName => (
                                         <div key={productName} className="flex items-center space-x-2 p-1">
                                            <Checkbox
                                                id={`product-${productName}`}
                                                checked={exportOptions.products[productName] || false}
                                                onCheckedChange={(checked) => handleExportOptionChange('products', productName, Boolean(checked))}
                                            />
                                            <Label htmlFor={`product-${productName}`} className="font-normal text-sm">{productName}</Label>
                                         </div>
                                       ))}
                                    </ScrollArea>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
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
      <CardContent>
         <Tabs defaultValue={brands[0]} className="w-full">
            <div className="flex justify-center">
                <TabsList>
                    {brands.map((brand) => (
                         <TabTriggerWithIndicator value={brand} key={brand} hasAlert={canViewLowStockAlerts && lowStockAlerts[brand]}>
                            {formatBrandName(brand)}
                         </TabTriggerWithIndicator>
                    ))}
                    <TabsTrigger value="all">Todo</TabsTrigger>
                </TabsList>
            </div>
            {brands.map((brand) => (
                <TabsContent value={brand} key={brand} className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <Tabs defaultValue={Object.keys(inventoryData[brand as keyof typeof inventoryData])[0] || 'default'} className="w-full">
                            <div className="flex justify-center mt-4">
                                <TabsList>
                                    {Object.keys(inventoryData[brand as keyof typeof inventoryData]).map((subCategory) => (
                                        <TabsTrigger value={subCategory} key={subCategory}>{subCategory}</TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                            {Object.entries(inventoryData[brand as keyof typeof inventoryData]).map(([subCategory, products]) => (
                                 <TabsContent value={subCategory} key={subCategory}>
                                    <ProductTable 
                                        products={products} 
                                        brand={brand}
                                        subCategory={subCategory}
                                        canEdit={canEdit}
                                        isPartner={isPartner}
                                        isMarketing={isMarketing}
                                        onDataChange={handleDataChange}
                                        inventoryData={inventoryData}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                </TabsContent>
            ))}
             <TabsContent value="all" className="mt-4">
                <Accordion type="multiple" className="w-full space-y-2">
                  {brands.map(brand => (
                    <AccordionItem value={brand} key={brand}>
                        <AccordionTrigger className="px-4 py-2 bg-muted/50 rounded-md hover:no-underline font-semibold text-base">
                            {formatBrandName(brand)}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-2 space-y-4">
                                {Object.entries(inventoryData[brand as keyof typeof inventoryData]).map(([subCategory, products]) => (
                                    <Card key={subCategory}>
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-lg">{subCategory}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ProductTable
                                                products={products}
                                                brand={brand}
                                                subCategory={subCategory}
                                                canEdit={canEdit}
                                                isPartner={isPartner}
                                                isMarketing={isMarketing}
                                                onDataChange={handleDataChange}
                                                inventoryData={inventoryData}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </TabsContent>
        </Tabs>
      </CardContent>
       {canEdit && (
        <CardFooter className="flex justify-end">
            <Button onClick={handleSaveChanges} size="sm" variant={hasPendingChanges ? 'destructive' : 'default'}>
                {hasPendingChanges && <AlertTriangle className="mr-2 h-4 w-4" />}
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
        </CardFooter>
      )}
    </Card>
    </>
  );
}
    

    

    

    

    

