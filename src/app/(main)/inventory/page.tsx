'use client';
import React, { useState, useContext } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FileDown, Save, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TransferInventoryForm } from '@/components/transfer-inventory-form';
import { InventoryContext } from '@/context/inventory-context';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Mocked user role. In a real app, this would come from an auth context.
const currentUserRole: Role = 'Administrador';

const ProductTable = ({ products, brand, subCategory, canEdit, onDataChange, inventoryData }: { products: { [key: string]: any }, brand: string, subCategory: string, canEdit: boolean, onDataChange: Function, inventoryData: any }) => {
  const getAvailabilityStatus = (disponible: number) => {
    if (disponible > 100) return 'En Stock';
    if (disponible > 0) return 'Poco Stock';
    return 'Agotado';
  };

  const getStatusVariant = (status: string): 'success' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'En Stock':
        return 'success';
      case 'Poco Stock':
        return 'secondary';
      case 'Agotado':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const handleInputChange = (productName: string, field: string, value: string | number, isNameChange = false) => {
    const isNumber = typeof inventoryData[brand][subCategory][productName][field] === 'number';
    onDataChange(brand, subCategory, productName, field, isNumber ? Number(value) : value, isNameChange);
  };

  if (Object.keys(products).length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No hay productos en esta categoría.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="p-2">Nombre del Producto</TableHead>
          <TableHead className="text-right p-2">Bodega</TableHead>
          <TableHead className="text-right p-2">Separadas Bodega</TableHead>
          <TableHead className="text-right p-2">Zona Franca</TableHead>
          <TableHead className="text-right p-2">Separadas ZF</TableHead>
          <TableHead className="text-right p-2">Muestras</TableHead>
          <TableHead className="p-2">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(products).map(([name, item]) => {
          if (!name) return null;
          const disponibleBodega = item.bodega - item.separadasBodega;
          const disponibleZonaFranca = item.zonaFranca - item.separadasZonaFranca;
          const statusBodega = getAvailabilityStatus(disponibleBodega);
          const statusZonaFranca = getAvailabilityStatus(disponibleZonaFranca);

          return (
            <TableRow key={name}>
              <TableCell className="font-medium p-2">
                {canEdit ? (
                    <Input 
                        defaultValue={name} 
                        onBlur={(e) => handleInputChange(name, 'name', e.target.value, true)}
                        className="h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                ) : (
                    name
                )}
              </TableCell>
              <TableCell className="text-right p-0">
                {canEdit ? <Input type="number" defaultValue={item.bodega} onBlur={(e) => handleInputChange(name, 'bodega', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" /> : item.bodega}
              </TableCell>
              <TableCell className="text-right p-0">
                {canEdit ? <Input type="number" defaultValue={item.separadasBodega} onBlur={(e) => handleInputChange(name, 'separadasBodega', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" /> : item.separadasBodega}
              </TableCell>
              <TableCell className="text-right p-0">
                {canEdit ? <Input type="number" defaultValue={item.zonaFranca} onBlur={(e) => handleInputChange(name, 'zonaFranca', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" /> : item.zonaFranca}
              </TableCell>
              <TableCell className="text-right p-0">
                {canEdit ? <Input type="number" defaultValue={item.separadasZonaFranca} onBlur={(e) => handleInputChange(name, 'separadasZonaFranca', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" /> : item.separadasZonaFranca}
              </TableCell>
              <TableCell className="text-right p-0">
                 {canEdit ? <Input type="number" defaultValue={item.muestras} onBlur={(e) => handleInputChange(name, 'muestras', e.target.value)} className="w-20 ml-auto text-right h-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0" /> : item.muestras}
              </TableCell>
              <TableCell className="p-2">
                <div className="flex flex-col gap-1 items-start">
                  {disponibleBodega > 0 && <Badge variant={getStatusVariant(statusBodega)}>Bodega: {statusBodega}</Badge>}
                  {disponibleZonaFranca > 0 && <Badge variant={getStatusVariant(statusZonaFranca)}>ZF: {statusZonaFranca}</Badge>}
                  {disponibleBodega <= 0 && disponibleZonaFranca <= 0 && <Badge variant="destructive">Agotado</Badge>}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};


export default function InventoryPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('InventoryContext must be used within an InventoryProvider');
  }
  const { inventoryData, setInventoryData, transferFromFreeZone } = context;

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf',
    columns: {
      bodega: true,
      separadasBodega: true,
      zonaFranca: true,
      separadasZonaFranca: true,
      muestras: true,
    },
    brands: {} as Record<string, boolean>,
    categories: {} as Record<string, boolean>,
    products: {} as Record<string, boolean>,
  });
  const { toast } = useToast();

  const brands = Object.keys(inventoryData);
  const canEdit = currentUserRole === 'Administrador' || currentUserRole === 'Logística';
  
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
  };

  const handleSaveChanges = () => {
    console.log("Saving data:", inventoryData);
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
          
          filteredData.push({
            brand,
            category,
            name: productName,
            values
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

  const handleExportPDF = () => {
    const dataToExport = getFilteredDataForExport();
    if(dataToExport.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay datos que coincidan con los filtros seleccionados.' });
        return;
    }

    const doc = new jsPDF();
    const head: any[] = [['Marca', 'Categoría', 'Producto']];
    const columns = Object.keys(exportOptions.columns).filter(c => exportOptions.columns[c as keyof typeof exportOptions.columns]);
    head[0].push(...columns);
    
    const body = dataToExport.map(item => {
        const row = [item.brand, item.category, item.name];
        columns.forEach(col => {
            row.push(item.values[col]);
        });
        return row;
    });

    doc.autoTable({ head, body });
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
    const headers = ['Marca', 'Categoría', 'Producto', ...columns];

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

   const handleTransfer = ({ product, quantity }: { product: string; quantity: number }) => {
     try {
       transferFromFreeZone(product, quantity);
       toast({ title: 'Traslado Exitoso', description: `${quantity} unidades de ${product} movidas de Zona Franca a Bodega.` });
       setIsTransferDialogOpen(false);
     } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
     }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Productos - Stock Actual</CardTitle>
        <div className="flex gap-2">
            {canEdit && (
                <>
                <Button onClick={handleSaveChanges} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                </Button>
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Truck className="mr-2 h-4 w-4" />
                            Trasladar de ZF a Bodega
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Trasladar Inventario</DialogTitle>
                        </DialogHeader>
                        <TransferInventoryForm onTransfer={handleTransfer} />
                    </DialogContent>
                </Dialog>
                </>

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
                                  <Label htmlFor={`col-${col}`} className="font-normal text-sm capitalize">{col.replace(/([A-Z])/g, ' $1')}</Label>
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
                        <TabsTrigger value={brand} key={brand}>{formatBrandName(brand)}</TabsTrigger>
                    ))}
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
