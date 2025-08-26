'use client';
import React, { useState, useMemo, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Save, MoreHorizontal, Edit, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser } from '@/app/(main)/layout';
import { roles } from '@/lib/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { InventoryContext } from '@/context/inventory-context';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';


const productStructure: { [key: string]: { [line: string]: string[] } } = {
  'StoneFlex': {
    'Clay': [
      'Cut stone',
      'Travertino',
      'Concreto encofrado',
      'Tapia negra',
    ],
    'Pizarra': [
      'Black',
      'Black XL',
      'Kund multy',
      'Kund multy XL',
      'Tan',
      'Tan XL',
      'Indian autumn',
      'Indian autumn XL',
    ],
    'Cuarcitas': [
      'Burning forest',
      'Burning forest XL',
      'Copper',
      'Copper XL',
      'Jeera green',
      'Jeera green XL',
      'Silver shine',
      'Silver shine XL',
      'Silver shine gold',
      'Silver shine gold XL',
      'Steel grey',
      'Steel grey XL',
    ],
    'Concreto': [
      'Concreto blanco',
      'Concreto blanco XL',
      'Concreto gris',
      'Concreto gris XL',
      'Concrete with holes',
      'Concrete with holes XL',
      'Concreto gris medium',
      'Concreto medio',
    ],
    'Mármol': [
      'Carrara',
      'Carrara XL',
      'Crystal white',
      'Crystal white XL',
      'Himalaya gold',
      'Himalaya gold XL',
      'Mint white',
    ],
    'Translucida': [
      'Indian autumn translucido',
      'Indian autumn translucido XL',
    ],
    'Madera': [
      'Madera nogal',
      'Madera teka',
      'Madera ébano',
    ],
    'Metales': [
      'Corten stell',
      'Mural blue patina with copper',
      'Mural white with copper gold',
      'Gate turquoise patina copper',
      'Corten steel',
    ],
    '3D autoadhesiva': [
      '3d adhesivo - black',
      '3d adhesivo - indian rustic',
      '3d adhesivo - tan',
    ],
    'Insumos': [
      'Adhesivo',
      'Adhesivo translucido',
      'Sellante semi - bright galon',
      'Sellante semi - brigth 1/ 4 galon',
      'Sellante shyny galon',
      'Sellante shyny 1/4 galon',
    ],
  },
  'Starwood': {
      'Productos': [
        'Pergola 9x4',
        'Pergola 10x5',
        'Deck estandar',
        'Deck co-extrusion',
        'Liston 6.8x2.5',
      ],
      'Insumos': [
        'Bocel decorativo blanco',
        'Clip plastico para deck wpc',
        'Daily clean',
        'Daily clean galon',
        'Durmiente plastico 3x3',
        'Durmiente plastico 6x6',
        'Intensive clean',
        'Remate wall panel gris',
        'Remate wall panel maple',
        'Remate wall panel negro',
        'Remate wall panel roble',
        'Sellante wpc 1 galon',
        'Sellante wpc 1/4 galon',
      ]
  }
};

type SizeFilter = 'todos' | 'estandar' | 'xl';

const TabTriggerWithIndicator = ({ value, hasAlert, children }: { value: string, hasAlert: boolean, children: React.ReactNode }) => {
    return (
        <TabsTrigger value={value} className="relative">
            {children}
            {hasAlert && <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />}
        </TabsTrigger>
    );
};

export default function PricingPage() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('PricingPage must be used within an InventoryProvider');
  }
  const { inventoryData, productPrices, setProductPrices, addProduct: addProductToContext } = context;

  const [localProductStructure, setLocalProductStructure] = useState(() => {
    // Initialize structure from inventory data
    const structure: { [key: string]: { [line: string]: string[] } } = {};
    for (const brand in inventoryData) {
        structure[brand] = {};
        for (const line in inventoryData[brand]) {
            structure[brand][line] = Object.keys(inventoryData[brand][line]);
        }
    }
    return structure;
  });

  const [linePrices, setLinePrices] = useState<{ [key: string]: string }>({});
  const [sizeFilters, setSizeFilters] = useState<{ [key: string]: SizeFilter }>({});
  const [isEditingLine, setIsEditingLine] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useUser();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ name: string; price: number } | null>(null);

  const userPermissions = roles.find(r => r.name === currentUser.roles[0])?.permissions || [];
  const canEdit = userPermissions.includes('pricing:edit');
  
  const handleOpenEditModal = (productName: string) => {
    setEditingProduct({ name: productName, price: productPrices[productName as keyof typeof productPrices] || 0 });
    setIsEditModalOpen(true);
  };

  const handleUpdatePrice = () => {
    if (editingProduct) {
        setProductPrices(prev => ({...prev, [editingProduct.name]: editingProduct.price}));
        setIsEditModalOpen(false);
        setEditingProduct(null);
        toast({ title: 'Precio actualizado', description: `El precio de "${editingProduct.name}" ha sido actualizado.` });
    }
  };
  
  const handleAddProduct = (newProduct: { brand: string; line: string; name: string; price: number; size?: string }) => {
    const { brand, line, name, price, size } = newProduct;
    if (!brand || !line || !name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos son requeridos para agregar un producto.' });
      return;
    }

    // Use context function to add the product
    addProductToContext({ name, brand, line, size, price, stock: { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 }});

    // Update local structure for immediate UI feedback
    setLocalProductStructure(prev => {
        const newStructure = { ...prev };
        if (!newStructure[brand as keyof typeof newStructure]) newStructure[brand as keyof typeof newStructure] = {};
        if (!newStructure[brand as keyof typeof newStructure][line]) newStructure[brand as keyof typeof newStructure][line] = [];

        if (newStructure[brand as keyof typeof newStructure][line].includes(name)) {
            toast({ variant: 'destructive', title: 'Error', description: `El producto "${name}" ya existe en esta línea.` });
            return prev;
        }

        newStructure[brand as keyof typeof newStructure][line].push(name);
        return newStructure;
    });

    toast({ title: 'Producto Agregado', description: `Se ha agregado "${name}" a la lista de precios y al inventario.` });
    setIsAddModalOpen(false);
  };
  
  const handleDeleteProduct = (productName: string) => {
    setProductPrices(prev => {
        const newPrices = {...prev};
        delete newPrices[productName as keyof typeof newPrices];
        return newPrices;
    });
    setLocalProductStructure(prev => {
        const newStructure = JSON.parse(JSON.stringify(prev));
        for (const brand in newStructure) {
            for (const line in newStructure[brand]) {
                const index = newStructure[brand][line].indexOf(productName);
                if (index > -1) {
                    newStructure[brand][line].splice(index, 1);
                }
            }
        }
        return newStructure;
    });
    toast({ variant: 'destructive', title: 'Producto Eliminado', description: `Se ha eliminado "${productName}" de la lista de precios.` });
  };


  const handleLinePriceChange = (line: string, value: string) => {
    const formattedValue = value.replace(/[^0-9]/g, '');
    setLinePrices(prev => ({ ...prev, [line]: formattedValue }));
  };
  
  const handleSizeFilterChange = (line: string, value: SizeFilter) => {
    setSizeFilters(prev => ({ ...prev, [line]: value }));
  };

  const handleApplyPriceToLine = (brand: string, line: string) => {
    const newPriceValue = linePrices[line];
    const sizeFilter = sizeFilters[line] || 'todos';

    if (newPriceValue === undefined || newPriceValue === '') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, ingrese un precio para aplicar a la línea.',
      });
      return;
    }

    const numericPrice = Number(newPriceValue);
    if (isNaN(numericPrice)) return;

    let productsInLine = localProductStructure[brand as keyof typeof localProductStructure][line];
    
    if (sizeFilter === 'estandar') {
        productsInLine = productsInLine.filter(p => !p.includes('XL'));
    } else if (sizeFilter === 'xl') {
        productsInLine = productsInLine.filter(p => p.includes('XL'));
    }

    const updatedPrices: { [key: string]: number } = { ...productPrices };
    productsInLine.forEach(product => {
      updatedPrices[product as keyof typeof updatedPrices] = numericPrice;
    });
    setProductPrices(updatedPrices);
    toast({
      title: 'Precios actualizados',
      description: `Todos los productos en la línea "${line}" (${sizeFilter}) han sido actualizados a ${formatCurrency(numericPrice)}.`,
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveChanges = () => {
    console.log('Saving prices:', productPrices);
    toast({
      title: 'Precios actualizados',
      description: 'Los nuevos precios han sido guardados exitosamente.',
    });
  };
  
  const brands = Object.keys(localProductStructure);
  
  const lineHasMultipleSizes = (brand: string, line: string) => {
    const products = localProductStructure[brand as keyof typeof localProductStructure][line];
    const hasEstandar = products.some(p => !p.includes('XL'));
    const hasXL = products.some(p => p.includes('XL'));
    return hasEstandar && hasXL;
  };
  
  const hasPendingPrices = useMemo(() => {
    const alerts: { [key: string]: { [key: string]: boolean } } = {};
    for (const brand in localProductStructure) {
      alerts[brand] = {};
      for (const line in localProductStructure[brand]) {
        const hasPending = localProductStructure[brand][line].some(product => !productPrices[product as keyof typeof productPrices] || productPrices[product as keyof typeof productPrices] === 0);
        alerts[brand][line] = hasPending;
      }
    }
    return alerts;
  }, [localProductStructure, productPrices]);

  const brandHasPendingPrices = (brand: string) => {
    return Object.values(hasPendingPrices[brand] || {}).some(Boolean);
  };
  
  const ProductTable = ({ brand, line }: { brand: string; line: string }) => (
     <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio por Unidad (COP)</TableHead>
                {canEdit && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
            </TableRow>
        </TableHeader>
        <TableBody>
            {localProductStructure[brand as keyof typeof localProductStructure][line].map((product) => {
                const price = productPrices[product as keyof typeof productPrices];
                const hasPrice = price !== undefined && price > 0;
                return (
                 <TableRow key={product}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`price-${product}`} className="font-medium">{product}</Label>
                        {!hasPrice && (
                            <Badge variant="destructive" className="gap-1.5">
                                <AlertTriangle className="h-3 w-3" />
                                Precio Pendiente
                            </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                        {hasPrice ? formatCurrency(price) : '-'}
                    </TableCell>
                    {canEdit && (
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleOpenEditModal(product)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Precio
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar Producto
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Se eliminará el producto y su precio de forma permanente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteProduct(product)} className="bg-destructive hover:bg-destructive/90">
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
        </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
            <CardTitle>Gestión de Precios de Productos</CardTitle>
            <CardDescription>
              Ajuste los precios para cada producto individual o actualice una línea de productos completa. Todos los precios son por unidad.
            </CardDescription>
        </div>
        {canEdit && (
            <Button onClick={() => setIsAddModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
            </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={brands[0]} className="w-full">
          <div className="flex justify-center">
            <TabsList>
                {brands.map((brand) => (
                    <TabTriggerWithIndicator value={brand} key={brand} hasAlert={canEdit && brandHasPendingPrices(brand)}>
                        {brand}
                    </TabTriggerWithIndicator>
                ))}
            </TabsList>
          </div>
          {brands.map((brand) => (
            <TabsContent value={brand} key={brand} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue={'all'} className="w-full" orientation="vertical">
                      <div className="flex justify-center mt-4">
                        <TabsList>
                             <TabsTrigger value={'all'}>Ver Todos</TabsTrigger>
                            {Object.keys(localProductStructure[brand as keyof typeof localProductStructure]).map((line) => (
                                <TabTriggerWithIndicator value={line} key={line} hasAlert={canEdit && hasPendingPrices[brand]?.[line]}>
                                    {line}
                                </TabTriggerWithIndicator>
                            ))}
                        </TabsList>
                      </div>
                      <TabsContent value="all">
                          <Accordion type="multiple" className="w-full space-y-2 p-4">
                            {Object.keys(localProductStructure[brand as keyof typeof localProductStructure]).map((line) => (
                               <AccordionItem value={line} key={line}>
                                    <AccordionTrigger className="px-4 py-2 bg-muted/50 rounded-md hover:no-underline font-semibold text-base">
                                        {line}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-2">
                                         <ProductTable brand={brand} line={line} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                          </Accordion>
                      </TabsContent>
                      {Object.keys(localProductStructure[brand as keyof typeof localProductStructure]).map((line) => (
                          <TabsContent value={line} key={line}>
                            {line !== 'Insumos' && canEdit && (
                                <div className="mb-6 rounded-md border p-4">
                                  {!isEditingLine ? (
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">Actualice los precios de toda la línea de una vez.</p>
                                        <Button variant="outline" onClick={() => setIsEditingLine(true)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar Precios de Línea
                                        </Button>
                                    </div>
                                  ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div className="flex-1 space-y-1.5 md:col-span-1">
                                          <Label htmlFor={`line-price-${brand}-${line}`}>Nuevo Precio para la Línea {line}</Label>
                                           <Input
                                             id={`line-price-${brand}-${line}`}
                                             type="text"
                                             placeholder="Ingrese un nuevo precio..."
                                             value={new Intl.NumberFormat('es-CO').format(Number(linePrices[line] || 0))}
                                             onChange={(e) => handleLinePriceChange(line, e.target.value)}
                                             disabled={!canEdit}
                                           />
                                        </div>
                                        {lineHasMultipleSizes(brand, line) && (
                                           <div className="md:col-span-1">
                                              <Label>Aplicar a Tamaño</Label>
                                              <RadioGroup 
                                                  defaultValue="todos" 
                                                  value={sizeFilters[line] || 'todos'}
                                                  onValueChange={(value) => handleSizeFilterChange(line, value as SizeFilter)}
                                                  className="flex gap-4 pt-2"
                                                  disabled={!canEdit}
                                              >
                                                <div className="flex items-center space-x-2">
                                                  <RadioGroupItem value="todos" id={`size-todos-${brand}-${line}`} />
                                                  <Label htmlFor={`size-todos-${brand}-${line}`}>Todos</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <RadioGroupItem value="estandar" id={`size-estandar-${brand}-${line}`} />
                                                  <Label htmlFor={`size-estandar-${brand}-${line}`}>Estándar</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <RadioGroupItem value="xl" id={`size-xl-${brand}-${line}`} />
                                                  <Label htmlFor={`size-xl-${brand}-${line}`}>XL</Label>
                                                </div>
                                              </RadioGroup>
                                          </div>
                                        )}
                                        <div className="md:col-span-1 flex gap-2">
                                          <Button onClick={() => handleApplyPriceToLine(brand, line)} className="w-full" disabled={!canEdit}>Aplicar</Button>
                                          <Button variant="ghost" onClick={() => setIsEditingLine(false)}>Cancelar</Button>
                                        </div>
                                    </div>
                                    </>
                                  )}
                               </div>
                            )}
                            <ProductTable brand={brand} line={line} />
                          </TabsContent>
                      ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      {canEdit && (
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </CardFooter>
      )}

      {/* Edit Price Modal */}
      {editingProduct && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Precio</DialogTitle>
                    <DialogDescription>
                        Ajuste el precio para el producto: <span className="font-semibold">{editingProduct.name}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="edit-price">Nuevo Precio (COP)</Label>
                    <Input
                        id="edit-price"
                        type="text"
                        value={new Intl.NumberFormat('es-CO').format(editingProduct.price)}
                        onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value.replace(/[^0-9]/g, ''))})}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleUpdatePrice}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
      
      {/* Add Product Modal */}
      <AddProductDialog
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleAddProduct}
        brands={Object.keys(localProductStructure)}
        linesByBrand={Object.entries(localProductStructure).reduce((acc, [brand, lines]) => {
            acc[brand] = Object.keys(lines);
            return acc;
        }, {} as Record<string, string[]>)}
      />

    </Card>
  );
}


interface AddProductDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (product: { brand: string; line: string; name: string; price: number, size?: string }) => void;
    brands: string[];
    linesByBrand: Record<string, string[]>;
}

function AddProductDialog({ isOpen, onOpenChange, onSave, brands, linesByBrand }: AddProductDialogProps) {
    const [brand, setBrand] = useState('');
    const [line, setLine] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [size, setSize] = useState('');
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewLine, setIsNewLine] = useState(false);
    
    const brandOptions = brands.map(b => ({ value: b, label: b }));
    const lineOptions = brand ? (linesByBrand[brand] || []).map(l => ({ value: l, label: l })) : [];
    
    const handleSave = () => {
        onSave({ brand, line, name, price, size });
        setBrand('');
        setLine('');
        setName('');
        setPrice(0);
        setSize('');
        setIsNewBrand(false);
        setIsNewLine(false);
    }
    
     const handleToggleNewBrand = (checked: boolean) => {
        setIsNewBrand(checked);
        setBrand('');
        setLine('');
        setIsNewLine(false);
    };

    const handleToggleNewLine = (checked: boolean) => {
        setIsNewLine(checked);
        setLine('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox id="is-new-brand-dialog" checked={isNewBrand} onCheckedChange={handleToggleNewBrand} />
                            <Label htmlFor="is-new-brand-dialog">Agregar marca nueva</Label>
                        </div>
                        {isNewBrand ? (
                            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nombre de la nueva marca" />
                        ) : (
                            <Combobox
                                options={brandOptions}
                                value={brand}
                                onValueChange={(value) => { setBrand(value); setLine(''); }}
                                placeholder="Seleccione una marca"
                                searchPlaceholder="Buscar marca..."
                                emptyPlaceholder="No hay marcas."
                            />
                        )}
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox id="is-new-line-dialog" checked={isNewLine} onCheckedChange={handleToggleNewLine} disabled={!brand} />
                            <Label htmlFor="is-new-line-dialog" className={!brand ? 'text-muted-foreground' : ''}>Agregar línea nueva</Label>
                        </div>
                        {isNewLine ? (
                             <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Nombre de la nueva línea" disabled={!brand} />
                        ) : (
                            <Combobox
                                options={lineOptions}
                                value={line}
                                onValueChange={setLine}
                                placeholder="Seleccione una línea"
                                searchPlaceholder="Buscar línea..."
                                emptyPlaceholder="No hay líneas para esta marca."
                                disabled={!brand}
                            />
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label>Nombre del Producto</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Medidas (Opcional)</Label>
                        <Input value={size} onChange={e => setSize(e.target.value)} placeholder="Ej: 1.22x0.61 Mts" />
                    </div>
                     <div className="space-y-2">
                        <Label>Precio (COP)</Label>
                        <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>Añadir Producto</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
