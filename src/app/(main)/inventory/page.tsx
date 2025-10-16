

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
import { FileDown, Save, Truck, BadgeCheck, BellRing, AlertTriangle, XCircle, X, PlusCircle, BookUser, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roles } from '@/lib/roles';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TransferInventoryForm, type TransferItem } from '@/components/transfer-inventory-form';
import { InventoryContext, Reservation, InventoryData } from '@/context/inventory-context';
import { useUser } from '@/context/user-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBeforeUnload } from '@/hooks/use-before-unload';
import { AddProductDialog } from '@/components/add-product-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReservationForm } from '@/components/reservation-form';
import { addPdfHeader } from '@/lib/pdf-utils';
import { initialInventoryData } from '@/lib/initial-inventory';
import { productDimensions } from '@/lib/dimensions';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ProductTable = ({ products, brand, subCategory, canEdit, isPartner, isMarketing, onDataChange, inventoryData, onReserve }: { products: { [key: string]: any }, brand: string, subCategory: string, canEdit: boolean, isPartner: boolean, isMarketing: boolean, onDataChange: Function, inventoryData: any, onReserve: (productName: string) => void }) => {
  const context = useContext(InventoryContext);
  const { currentUser } = useUser();

  if (!context || !currentUser) {
    throw new Error('ProductTable must be used within an InventoryProvider and UserProvider');
  }
  const { reservations: allReservations, toggleProductSubscription, productSubscriptions } = context;
  const canEditName = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador') || currentUser.roles.includes('Logística');
  const canEditQuantities = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador') || currentUser.roles.includes('Logística');
  
  const handleInputChange = (productName: string, field: string, value: string | number, isNameChange = false) => {
    const isNumber = typeof inventoryData[brand][subCategory][productName][field] === 'number';
    onDataChange(brand, subCategory, productName, field, isNumber && !isNameChange ? Number(value) : value, isNameChange);
  };

  const getReservationsForProduct = (productName: string): Reservation[] => {
    return allReservations.filter(
      (r) =>
        r.product === productName &&
        r.status === 'Validada'
    );
  };
  
  const getStockColorClass = (stock: number) => {
    if (stock < 0) return 'text-red-600 font-bold';
    if (stock > 0 && stock <= 20) return 'text-yellow-600';
    return '';
  };
  
  const canSubscribe = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');
  const canCreateReservation = currentUser.roles.includes('Asesor de Ventas') || currentUser.roles.includes('Administrador');

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
            <TableHead className="text-center p-2">Medidas</TableHead>
            <TableHead className="text-center p-2">Disponible Bodega</TableHead>
            <TableHead className="text-center p-2">Disponible ZF</TableHead>
            <TableHead className="text-center p-2">Separado</TableHead>
            {!isPartner && <TableHead className="text-center p-2 w-[150px]"></TableHead>}
            {isMarketing && <TableHead className="text-center p-2">Oportunidad de Campaña</TableHead>}
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
            const userHasReservation = reservations.some(r => r.advisor === currentUser.name);

            const highStock = totalDisponible > 500;
            const isSubscribed = productSubscriptions[name]?.includes(currentUser.name);

            return (
              <TableRow key={name}>
                <TableCell className="font-medium p-2">{name}</TableCell>
                <TableCell className="p-2 text-sm text-muted-foreground text-center">{productDimensions[name as keyof typeof productDimensions] || 'N/A'}</TableCell>
                <TableCell className={cn("text-center p-2 font-medium", getStockColorClass(disponibleBodega))}>{disponibleBodega}</TableCell>
                <TableCell className={cn("text-center p-2 font-medium", getStockColorClass(disponibleZonaFranca))}>{disponibleZonaFranca}</TableCell>
                <TableCell className={cn("text-center p-2 font-medium", userHasReservation && totalReserved > 0 && "bg-green-100 rounded-md")}>{totalReserved}</TableCell>
               
                {!isPartner && (
                  <TableCell className="text-center p-2">
                    <div className="flex justify-center items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {canCreateReservation && (
                                    <DropdownMenuItem onClick={() => onReserve(name)}>
                                        <BookUser className="mr-2 h-4 w-4" />
                                        Reservar
                                    </DropdownMenuItem>
                                )}
                                {totalDisponible <= 0 && canSubscribe && (
                                    <DropdownMenuItem onClick={() => toggleProductSubscription(name, currentUser.name)}>
                                        <BellRing className="mr-2 h-4 w-4" />
                                        {isSubscribed ? "Anular Suscripción" : "Notificar Stock"}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {totalReserved > 0 && (
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <div className="flex justify-end cursor-help">
                                   <BadgeCheck className="h-5 w-5 text-green-600" />
                                 </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p className="font-bold mb-2">Unidades Separadas ({totalReserved} Total)</p>
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
                    <TableCell className="text-center p-2">
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
          <TableHead className="p-2 min-w-[250px]">Nombre del Producto</TableHead>
          <TableHead className="p-2 text-center">Medidas</TableHead>
          <TableHead className="text-center p-2 border-l" colSpan={3}>Bodega</TableHead>
          <TableHead className="text-center p-2 border-l" colSpan={3}>Zona Franca</TableHead>
          <TableHead className="text-center p-2 border-l">Muestras</TableHead>
        </TableRow>
        <TableRow>
            <TableHead className="p-2 border-t"></TableHead>
            <TableHead className="p-2 border-t text-center"></TableHead>
            <TableHead className="text-center p-2 border-t border-l font-medium">Total</TableHead>
            <TableHead className="text-center p-2 border-t font-medium">Separado</TableHead>
            <TableHead className="text-center p-2 border-t font-bold">Disponible</TableHead>
            <TableHead className="text-center p-2 border-t border-l font-medium">Total</TableHead>
            <TableHead className="text-center p-2 border-t font-medium">Separado</TableHead>
            <TableHead className="text-center p-2 border-t font-bold">Disponible</TableHead>
            <TableHead className="p-2 border-t border-l"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(products).map(([name, item]) => {
          if (!name) return null;
           const disponibleBodega = item.bodega - item.separadasBodega;
           const disponibleZonaFranca = item.zonaFranca - item.separadasZonaFranca;
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
              <TableCell className="p-2 text-sm text-muted-foreground text-center">{productDimensions[name as keyof typeof productDimensions] || 'N/A'}</TableCell>
              
              {/* Bodega */}
              <TableCell className="text-center p-0 border-l">
                <Input type="number" defaultValue={item.bodega} onBlur={(e) => handleInputChange(name, 'bodega', e.target.value)} className="w-20 mx-auto text-center h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" disabled={!canEditQuantities} />
              </TableCell>
              <TableCell className="text-center p-0">
                <Input type="number" defaultValue={item.separadasBodega} className="w-20 mx-auto text-center h-full border-0 rounded-none focus-visible:ring-0 bg-transparent" disabled readOnly />
              </TableCell>
               <TableCell className={cn("text-center p-2 font-medium", getStockColorClass(disponibleBodega))}>
                {disponibleBodega}
               </TableCell>

              {/* Zona Franca */}
              <TableCell className="text-center p-0 border-l">
                <Input type="number" defaultValue={item.zonaFranca} onBlur={(e) => handleInputChange(name, 'zonaFranca', e.target.value)} className="w-20 mx-auto text-center h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" disabled={!canEditQuantities} />
              </TableCell>
              <TableCell className="text-center p-0">
                <Input type="number" defaultValue={item.separadasZonaFranca} className="w-20 mx-auto text-center h-full border-0 rounded-none focus-visible:ring-0 bg-transparent" disabled readOnly />
              </TableCell>
               <TableCell className={cn("text-center p-2 font-medium", getStockColorClass(disponibleZonaFranca))}>
                {disponibleZonaFranca}
               </TableCell>
              
              {/* Muestras */}
              <TableCell className="text-center p-0 border-l">
                 <Input type="number" defaultValue={item.muestras} onBlur={(e) => handleInputChange(name, 'muestras', e.target.value)} className="w-20 mx-auto text-center h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent" disabled={!canEditQuantities} />
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
  const { setReservations } = context;
  const { currentUser } = useUser();
  const [localInventoryData, setLocalInventoryData] = useState<InventoryData>(initialInventoryData);
  
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [initialProductForReservation, setInitialProductForReservation] = useState<string | undefined>(undefined);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  useBeforeUnload(hasPendingChanges, 'Tiene cambios sin guardar. ¿Está seguro de que desea salir?');

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

  const canEdit = userPermissions.includes('pricing:edit') || currentUser.roles.includes('Logística');
  const canCreateProduct = userPermissions.includes('pricing:edit');
  const isPartner = currentUser.roles.includes('Partners');
  const isMarketing = currentUser.roles.includes('Marketing');
  const canViewLowStockAlerts = currentUser.roles.includes('Logística') || currentUser.roles.includes('Administrador') || currentUser.roles.includes('Contador');
  
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

  const brands = Object.keys(localInventoryData);

   const findProductLocation = (productName: string, data: typeof localInventoryData) => {
    for (const brand in data) {
      for (const subCategory in data[brand as keyof typeof data]) {
        if (data[brand as keyof typeof data][subCategory][productName]) {
          return { brand, subCategory };
        }
      }
    }
    return null;
  };
  
 const handleDataChange = (brand: string, subCategory: string, productName: string, field: string, value: any, isNameChange: boolean) => {
    if (isNameChange && value !== productName) {
        if (findProductLocation(value, localInventoryData)) {
            toast({
                variant: 'destructive',
                title: 'Error de Duplicado',
                description: `El producto "${value}" ya existe en el inventario.`,
            });
            // Revert state visually by forcing a re-render with the original data.
            // A more robust solution involves controlled inputs, but this is simpler for now.
             setLocalInventoryData(prevData => JSON.parse(JSON.stringify(prevData)));
            return;
        }
    }

    setLocalInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const products = newData[brand][subCategory];

        if (isNameChange) {
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
    // Here you would typically send the changes to your backend/context.
    // For this example, we'll just log it and reset the pending state.
    console.log("Saving changes:", localInventoryData);
    // setGlobalInventoryData(localInventoryData, currentUser); // This would be the context call
    
    setHasPendingChanges(false);
    toast({
        title: 'Inventario Guardado',
        description: 'Los cambios en el inventario han sido guardados exitosamente.'
    });
};


  const handleCancelChanges = () => {
    // Revert local state to the original state from context
    setLocalInventoryData(initialInventoryData);
    setHasPendingChanges(false);
    toast({
        title: 'Cambios Descartados',
        description: 'Se ha restaurado el estado original del inventario.',
        variant: 'destructive'
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

    Object.entries(localInventoryData).forEach(([brand, categories]) => {
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

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
    
    await addPdfHeader(doc);
    
    doc.setFontSize(14);
    doc.text('Reporte de Inventario', 14, 45);

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

    doc.autoTable({ 
      startY: 50,
      head,
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
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
       // transferFromFreeZone(items); // This would be the context call
       console.log("Transferring items:", items);
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

  const handleAddProduct = (newProduct: { brand: string; line: string; name: string; price: number; size?: string; stock: { bodega: number; zonaFranca: number; muestras: number; } }) => {
    const { brand, line, name, stock } = newProduct;
    if (!brand || !line || !name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos son requeridos para agregar un producto.' });
      return;
    }

    setLocalInventoryData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        if (!newData[brand]) newData[brand] = {};
        if (!newData[brand][line]) newData[brand][line] = {};
        
        newData[brand][line][name] = {
            ...stock,
            separadasBodega: 0,
            separadasZonaFranca: 0,
        };
        return newData;
    });

    toast({ title: 'Producto Agregado', description: `Se ha agregado "${name}" al inventario.` });
    setIsAddDialogOpen(false);
  };
  
  const handleOpenReservationDialog = (productName?: string) => {
    setInitialProductForReservation(productName);
    setIsReservationFormOpen(true);
  };

  const handleSaveReservations = (newReservations: Reservation[]) => {
    setReservations(prev => [...prev, ...newReservations]);
    setIsReservationFormOpen(false);
    setInitialProductForReservation(undefined);
    toast({
        title: 'Reservas Creadas',
        description: `Se han creado ${newReservations.length} nuevas reservas para la cotización ${newReservations[0].quoteNumber}.`
    });
  };
  
  const columnLabels: Record<string, string> = {
    ...Object.fromEntries(Object.keys(detailedColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
    ...Object.fromEntries(Object.keys(simplifiedColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
    ...Object.fromEntries(Object.keys(partnerColumns).map(key => [key, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())])),
  };
  
  const lowStockAlerts = useMemo(() => {
    const alerts: { [key: string]: { [key: string]: boolean } } = {};
    if (!canViewLowStockAlerts) return alerts;

    for (const brand in localInventoryData) {
      alerts[brand] = {};
      for (const line in localInventoryData[brand]) {
        let lineHasAlert = false;
        for (const product in localInventoryData[brand][line]) {
          const item = localInventoryData[brand][line][product];
          const stockBodega = item.bodega - item.separadasBodega;
          const stockZF = item.zonaFranca - item.separadasZonaFranca;
          if (stockBodega < 0 || stockZF < 0) {
            lineHasAlert = true;
            break;
          }
        }
        alerts[brand][line] = lineHasAlert;
      }
    }
    return alerts;
  }, [localInventoryData, canViewLowStockAlerts]);
  
  const brandHasAlert = (brand: string) => {
    return Object.values(lowStockAlerts[brand] || {}).some(Boolean);
  }

  const getSortedSubCategories = (brand: string) => {
    const subCategories = Object.keys(localInventoryData[brand as keyof typeof localInventoryData]);
    return subCategories.sort((a, b) => {
        if (a === 'Insumos') return 1;
        if (b === 'Insumos') return -1;
        return a.localeCompare(b);
    });
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Productos - Stock Actual</CardTitle>
        <div className="flex gap-2">
            {canCreateProduct && (
                 <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Button>
            )}
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
                                      {Object.keys(localInventoryData).map(brand => (
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
                                       {Object.values(localInventoryData).flatMap(categories => Object.values(categories).flatMap(products => Object.keys(products))).map(productName => (
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
                         <TabTriggerWithIndicator value={brand} key={brand} hasAlert={brandHasAlert(brand)}>
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
                        <Tabs defaultValue={getSortedSubCategories(brand)[0] || 'default'} className="w-full">
                            <div className="flex justify-center mt-4">
                                <TabsList>
                                    {getSortedSubCategories(brand).map((subCategory) => (
                                        <TabTriggerWithIndicator value={subCategory} key={subCategory} hasAlert={!!lowStockAlerts[brand]?.[subCategory]}>
                                            {subCategory}
                                        </TabTriggerWithIndicator>
                                    ))}
                                </TabsList>
                            </div>
                            {Object.entries(localInventoryData[brand as keyof typeof localInventoryData]).map(([subCategory, products]) => (
                                 <TabsContent value={subCategory} key={subCategory}>
                                    <ProductTable 
                                        products={products} 
                                        brand={brand}
                                        subCategory={subCategory}
                                        canEdit={canEdit}
                                        isPartner={isPartner}
                                        isMarketing={isMarketing}
                                        onDataChange={handleDataChange}
                                        inventoryData={localInventoryData}
                                        onReserve={handleOpenReservationDialog}
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
                                {Object.entries(localInventoryData[brand as keyof typeof localInventoryData]).map(([subCategory, products]) => (
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
                                                inventoryData={localInventoryData}
                                                onReserve={handleOpenReservationDialog}
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
        <CardFooter className="flex justify-end items-center gap-2">
            {hasPendingChanges && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="sm">
                          <X className="mr-2 h-4 w-4" />
                          Cancelar Cambios
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
                         <AlertDialogDescription>
                           Está a punto de revertir todos los cambios no guardados. Esta acción no se puede deshacer.
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <div className="flex-1 text-sm text-muted-foreground">
                            <p>No podrá recuperar los cambios si decide descartarlos.</p>
                         </div>
                         <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
                         <AlertDialogAction onClick={handleCancelChanges} className="bg-destructive hover:bg-destructive/90">
                           Descartar
                         </AlertDialogAction>
                       </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
            )}
            <Button onClick={handleSaveChanges} size="sm" variant={hasPendingChanges ? 'destructive' : 'default'}>
                {hasPendingChanges && <AlertTriangle className="mr-2 h-4 w-4" />}
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
        </CardFooter>
      )}
    </Card>

    <AddProductDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        inventoryData={localInventoryData}
      />
      
      <Dialog open={isReservationFormOpen} onOpenChange={setIsReservationFormOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Crear Nueva Reserva</DialogTitle>
                <DialogDescription>
                    Construya una cotización con múltiples productos y cree las reservas correspondientes.
                </DialogDescription>
            </DialogHeader>
            <ReservationForm 
                initialProduct={initialProductForReservation}
                onSave={handleSaveReservations}
                onCancel={() => setIsReservationFormOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </>
  );
}
