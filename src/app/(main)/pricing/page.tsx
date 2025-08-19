

'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Save, MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { initialProductPrices } from '@/lib/prices';
import { useUser } from '@/app/(main)/layout';
import { roles } from '@/lib/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';


const productStructure: { [key: string]: { [line: string]: string[] } } = {
  'StoneFlex': {
    'Clay': [
      'CUT STONE 120 X 60',
      'TRAVERTINO',
      'CONCRETO ENCOFRADO',
      'TAPIA NEGRA',
    ],
    'Pizarra': [
      'BLACK 1.22 X 0.61',
      'KUND MULTY 1.22 X 0.61',
      'TAN 1.22 X 0.61',
      'INDIAN AUTUMN 1.22 X 0.61',
      'BLACK 2.44 X 1.22',
      'TAN 2.44 X 1.22',
      'kUND MULTY 2.44 X 1.22',
      'INDIAN AUTUMN 2.44 X 1.22',
    ],
    'Cuarcitas': [
      'BURNING FOREST 1.22 X 0.61',
      'COPPER 1.22 X 0.61',
      'JEERA GREEN 1.22 X 0.61',
      'SILVER SHINE 1.22 X 0.61',
      'SILVER SHINE GOLD 1.22 X 0.61',
      'STEEL GRAY 1.22 X 0.61',
      'COPPER 2.44 X 1.22',
      'BURNING FOREST 2.44 X 1.22',
      'JEERA GREEN 2.44 X 1.22',
      'SILVER SHINE 2.44 X 1.22',
      'SILVER SHINE GOLD 2.44 X 1.22',
      'STEEL GREY 2.44 X 1.22',
    ],
    'Concreto': [
      'CONCRETO BLANCO 1.22 X 0.61',
      'CONCRETO GRIS 1.22 X 0.61',
      'CONCRETE WITH HOLES 1.22 X 0.61',
      'CONCRETO GRIS MEDIUM 1.22 X 0.61',
      'CONCRETO BLANCO 2.44 X 1.22',
      'CONCRETO GRIS 2.44 X 1.22',
      'CONCRETO MEDIO 2.44 X 1.22',
      'CONCRETO WITH HOLES 2.44 X 1.22',
    ],
    'Mármol': [
      'CARRARA 1.22 X 0.61',
      'CRYSTAL WHITE 1.22 X 0.61',
      'HIMALAYA GOLD 1.22X0.61 MTS',
      'MINT WHITE 1.22 X 0.61',
      'CARRARA 2.44 X 1.22',
      'CRYSTAL WHITE 2.44 X 1.22',
      'HIMALAYA GOLD 2.44 X 1.22',
    ],
    'Translucida': [
      'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61',
      'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22',
    ],
    'Madera': [
      'MADERA NOGAL 0.15 X 2.44 MTS',
      'MADERA TEKA 0.15 X 2.44 MTS',
      'MADERA ÉBANO 0.15 X 2.44 MTS',
    ],
    'Metales': [
      'CORTEN STELL - 2.44 X 0.61',
      'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61',
      'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61',
      'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61',
      'CORTEN STEEL 2.44 X 1.22',
    ],
    '3D autoadhesiva': [
      '3D ADHESIVO - 0,90 M2 - BLACK',
      '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC',
      '3D ADHESIVO - 0,90 M2 - TAN',
    ],
    'Insumos': [
      'Adhesivo',
      'ADHESIVO TRASLUCIDO',
      'SELLANTE SEMI - BRIGHT GALON',
      'SELLANTE SEMI - BRIGTH 1/ 4 GALON',
      'SELLANTE SHYNY GALON',
      'SELLANTE SHYNY 1/4 GALON',
    ],
  },
  'Starwood': {
      'Productos': [
        'PERGOLA 9x4 - 3 MTS COFFEE',
        'PERGOLA 9x4 - 3 MTS CHOCOLATE',
        'PERGOLA 10x5 - 3 COFFEE',
        'PERGOLA 10x5 - 3 MTS CHOCOLATE',
        'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE',
        'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN',
        'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG',
        'LISTON 6.8x2.5 - 3 MTS CAMEL',
        'LISTON 6.8x2.5 - 3 MTS COFFEE',
        'LISTON 6.8x2.5 - 3 MTS CHOCOLATE',
      ],
      'Insumos': [
        'CLIP PLASTICO PARA DECK WPC',
        'DURMIENTE PLASTICO 3x3 - 2.90 MTS',
        'DURMIENTE PLASTICO 6 X 6 - 1 MTS',
        'DAILY CLEAN',
        'INTENSIVE CLEAN',
        'SELLANTE WPC 1 GALON',
        'SELLANTE WPC 1/4 GALON',
        'DAILY CLEAN GALON',
        'REMATE WALL PANEL ROBLE',
        'REMATE WALL PANEL MAPLE',
        'REMATE WALL PANEL NEGRO',
        'REMATE WALL PANEL GRIS',
        'BOCEL DECORATIVO BLANCO',
      ]
  }
};

type SizeFilter = 'todos' | 'estandar' | 'xl';

export default function PricingPage() {
  const [localProductStructure, setLocalProductStructure] = useState(productStructure);
  const [prices, setPrices] = useState(initialProductPrices);
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
    setEditingProduct({ name: productName, price: prices[productName] || 0 });
    setIsEditModalOpen(true);
  };

  const handleUpdatePrice = () => {
    if (editingProduct) {
        setPrices(prev => ({...prev, [editingProduct.name]: editingProduct.price}));
        setIsEditModalOpen(false);
        setEditingProduct(null);
        toast({ title: 'Precio actualizado', description: `El precio de "${editingProduct.name}" ha sido actualizado.` });
    }
  };
  
  const handleAddProduct = (newProduct: { brand: string; line: string; name: string; price: number }) => {
    const { brand, line, name, price } = newProduct;
    if (!brand || !line || !name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos son requeridos para agregar un producto.' });
      return;
    }

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

    setPrices(prev => ({...prev, [name]: price}));
    toast({ title: 'Producto Agregado', description: `Se ha agregado "${name}" a la lista de precios.` });
    setIsAddModalOpen(false);
  };
  
  const handleDeleteProduct = (productName: string) => {
    setPrices(prev => {
        const newPrices = {...prev};
        delete newPrices[productName];
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
        productsInLine = productsInLine.filter(p => p.includes('1.22 X 0.61'));
    } else if (sizeFilter === 'xl') {
        productsInLine = productsInLine.filter(p => p.includes('2.44 X 1.22'));
    }

    const updatedPrices = { ...prices };
    productsInLine.forEach(product => {
      updatedPrices[product] = numericPrice;
    });
    setPrices(updatedPrices);
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
    console.log('Saving prices:', prices);
    toast({
      title: 'Precios actualizados',
      description: 'Los nuevos precios han sido guardados exitosamente.',
    });
  };
  
  const brands = Object.keys(localProductStructure);
  
  const lineHasMultipleSizes = (brand: string, line: string) => {
    const products = localProductStructure[brand as keyof typeof localProductStructure][line];
    const hasEstandar = products.some(p => p.includes('1.22 X 0.61'));
    const hasXL = products.some(p => p.includes('2.44 X 1.22'));
    return hasEstandar && hasXL;
  };

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
                <TabsTrigger value={brand} key={brand}>{brand}</TabsTrigger>
                ))}
            </TabsList>
          </div>
          {brands.map((brand) => (
            <TabsContent value={brand} key={brand} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue={Object.keys(localProductStructure[brand as keyof typeof localProductStructure])[0]} className="w-full" orientation="vertical">
                      <div className="flex justify-center mt-4">
                        <TabsList>
                            {Object.keys(localProductStructure[brand as keyof typeof localProductStructure]).map((line) => (
                                <TabsTrigger value={line} key={line}>{line}</TabsTrigger>
                            ))}
                        </TabsList>
                      </div>
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
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Producto</TableHead>
                                  <TableHead className="text-right">Precio por Unidad (COP)</TableHead>
                                  {canEdit && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {localProductStructure[brand as keyof typeof localProductStructure][line].map((product) => (
                                  <TableRow key={product}>
                                    <TableCell>
                                      <Label htmlFor={`price-${product}`} className="font-medium">{product}</Label>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                       {formatCurrency(prices[product] || 0)}
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
                                ))}
                              </TableBody>
                            </Table>
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
    onSave: (product: { brand: string; line: string; name: string; price: number }) => void;
    brands: string[];
    linesByBrand: Record<string, string[]>;
}

function AddProductDialog({ isOpen, onOpenChange, onSave, brands, linesByBrand }: AddProductDialogProps) {
    const [brand, setBrand] = useState('');
    const [line, setLine] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    
    const brandOptions = brands.map(b => ({ value: b, label: b }));
    const lineOptions = brand ? (linesByBrand[brand] || []).map(l => ({ value: l, label: l })) : [];
    
    const handleSave = () => {
        onSave({ brand, line, name, price });
        setBrand('');
        setLine('');
        setName('');
        setPrice(0);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Marca</Label>
                        <Select onValueChange={(v) => { setBrand(v); setLine(''); }}>
                           <SelectTrigger><SelectValue placeholder="Seleccione una marca" /></SelectTrigger>
                           <SelectContent>
                             {brandOptions.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                           </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Línea</Label>
                        <Select onValueChange={setLine} disabled={!brand}>
                           <SelectTrigger><SelectValue placeholder="Seleccione una línea" /></SelectTrigger>
                           <SelectContent>
                             {lineOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                           </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Nombre del Producto</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
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
