'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialProductPrices: { [key: string]: number } = {
    'CUT STONE 120 X 60': 176000,
    'TRAVERTINO': 176000,
    'CONCRETO ENCOFRADO': 176000,
    'TAPIA NEGRA': 176000,
    'BLACK 1.22 X 0.61': 177162,
    'KUND MULTY 1.22 X 0.61': 177162,
    'TAN 1.22 X 0.61': 177162,
    'INDIAN AUTUMN 1.22 X 0.61': 177162,
    'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': 252689,
    'BURNING FOREST 1.22 X 0.61': 177162,
    'COPPER 1.22 X 0.61': 177162,
    'JEERA GREEN 1.22 X 0.61': 177162,
    'SILVER SHINE 1.22 X 0.61': 177162,
    'SILVER SHINE GOLD 1.22 X 0.61': 177162,
    'STEEL GRAY 1.22 X 0.61': 177162,
    'CARRARA 1.22 X 0.61': 239247,
    'CRYSTAL WHITE 1.22 X 0.61': 239247,
    'HIMALAYA GOLD 1.22X0.61 MTS': 239247,
    'MINT WHITE 1.22 X 0.61': 239247,
    'CONCRETO BLANCO 1.22 X 0.61': 177162,
    'CONCRETO GRIS 1.22 X 0.61': 177162,
    'CONCRETE WITH HOLES 1.22 X 0.61': 177162,
    'CONCRETO GRIS MEDIUM 1.22 X 0.61': 177162,
    'CORTEN STELL - 2.44 X 0.61': 267819,
    'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': 267819,
    'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': 267819,
    'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': 267819,
    'MADERA NOGAL 0.15 X 2.44 MTS': 222710,
    'MADERA TEKA 0.15 X 2.44 MTS': 222710,
    '3D ADHESIVO - 0,90 M2 - BLACK': 207072,
    '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': 207072,
    '3D ADHESIVO - 0,90 M2 - TAN': 207072,
    'BLACK 2.44 X 1.22': 177162,
    'TAN 2.44 X 1.22': 177162,
    'kUND MULTY 2.44 X 1.22': 177162,
    'INDIAN AUTUMN 2.44 X 1.22': 177162,
    'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': 252689,
    'COPPER 2.44 X 1.22': 177162,
    'BURNING FOREST 2.44 X 1.22': 177162,
    'JEERA GREEN 2.44 X 1.22': 177162,
    'SILVER SHINE 2.44 X 1.22': 177162,
    'SILVER SHINE GOLD 2.44 X 1.22': 177162,
    'STEEL GREY 2.44 X 1.22': 177162,
    'CONCRETO BLANCO 2.44 X 1.22': 177162,
    'CONCRETO GRIS 2.44 X 1.22': 177162,
    'CONCRETO MEDIO 2.44 X 1.22': 177162,
    'CONCRETO WITH HOLES 2.44 X 1.22': 177162,
    'CARRARA 2.44 X 1.22': 239247,
    'CRYSTAL WHITE 2.44 X 1.22': 239247,
    'HIMALAYA GOLD 2.44 X 1.22': 239247,
    'CORTEN STEEL 2.44 X 1.22': 267819,
    'PERGOLA 9x4 - 3 MTS COFFEE': 50000,
    'PERGOLA 9x4 - 3 MTS CHOCOLATE': 50000,
    'PERGOLA 10x5 - 3 COFFEE': 55000,
    'PERGOLA 10x5 - 3 MTS CHOCOLATE': 55000,
    'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE': 40000,
    'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN': 45000,
    'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG': 45000,
    'LISTON 6.8x2.5 - 3 MTS CAMEL': 30000,
    'LISTON 6.8x2.5 - 3 MTS COFFEE': 30000,
    'LISTON 6.8x2.5 - 3 MTS CHOCOLATE': 30000,
    'Sellante': 50000,
    'Adhesivo': 30000,
};

const productStructure: { [brand: string]: { [line: string]: string[] } } = {
  'CLAY': {
    'Clay': [
      'CUT STONE 120 X 60',
      'TRAVERTINO',
      'CONCRETO ENCOFRADO',
      'TAPIA NEGRA',
    ],
  },
  'STONEFLEX': {
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
      'Sellante',
      'Adhesivo',
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
      ]
  }
};

type SizeFilter = 'todos' | 'estandar' | 'xl';

export default function PricingPage() {
  const [prices, setPrices] = useState(initialProductPrices);
  const [linePrices, setLinePrices] = useState<{ [key: string]: string }>({});
  const [sizeFilters, setSizeFilters] = useState<{ [key: string]: SizeFilter }>({});
  const { toast } = useToast();

  const handlePriceChange = (product: string, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ''));
    setPrices(prev => ({ ...prev, [product]: isNaN(numericValue) ? 0 : numericValue }));
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

    let productsInLine = productStructure[brand][line];
    
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
  
  const brands = Object.keys(productStructure);
  
  const lineHasMultipleSizes = (brand: string, line: string) => {
    const products = productStructure[brand][line];
    const hasEstandar = products.some(p => p.includes('1.22 X 0.61'));
    const hasXL = products.some(p => p.includes('2.44 X 1.22'));
    return hasEstandar && hasXL;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Precios de Productos</CardTitle>
        <CardDescription>
          Ajuste los precios para cada producto individual o actualice una línea de productos completa. Los precios (excepto insumos) son por metro cuadrado (M²) o por unidad, según corresponda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={brands[0]} className="w-full">
          <TabsList>
            {brands.map((brand) => (
              <TabsTrigger value={brand} key={brand}>{brand}</TabsTrigger>
            ))}
          </TabsList>
          {brands.map((brand) => (
            <TabsContent value={brand} key={brand}>
                <Tabs defaultValue={Object.keys(productStructure[brand])[0]} className="w-full">
                    <TabsList>
                        {Object.keys(productStructure[brand]).map((line) => (
                          <TabsTrigger value={line} key={line}>{line}</TabsTrigger>
                        ))}
                    </TabsList>
                    {Object.keys(productStructure[brand]).map((line) => (
                        <TabsContent value={line} key={line}>
                          {line !== 'Insumos' && (
                            <div className="mb-6 rounded-md border p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                  <div className="flex-1 space-y-1.5 md:col-span-1">
                                    <Label htmlFor={`line-price-${brand}-${line}`}>Nuevo Precio para la Línea {line}</Label>
                                     <Input
                                       id={`line-price-${brand}-${line}`}
                                       type="text"
                                       placeholder="Ingrese un nuevo precio..."
                                       value={new Intl.NumberFormat('es-CO').format(Number(linePrices[line] || 0))}
                                       onChange={(e) => handleLinePriceChange(line, e.target.value)}
                                     />
                                  </div>
                                  {lineHasMultipleSizes(brand, line) && (
                                     <div className="md:col-span-1">
                                        <Label>Aplicar a Tamaño</Label>
                                        <RadioGroup 
                                            defaultValue="todos" 
                                            value={sizeFilters[line] || 'todos'}
                                            onValueChange={(value) => handleSizeFilterChange(line, value as SizeFilter)}
                                            className="flex gap-4 pt-2">
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
                                  <div className="md:col-span-1">
                                    <Button onClick={() => handleApplyPriceToLine(brand, line)} className="w-full">Aplicar a Selección</Button>
                                  </div>
                              </div>
                             </div>
                          )}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Precio (COP)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productStructure[brand][line].map((product) => (
                                <TableRow key={product}>
                                  <TableCell>
                                    <Label htmlFor={`price-${product}`} className="font-medium">{product}</Label>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      id={`price-${product}`}
                                      type="text"
                                      value={new Intl.NumberFormat('es-CO').format(prices[product] || 0)}
                                      onChange={(e) => handlePriceChange(product, e.target.value)}
                                      className="w-48 ml-auto text-right"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TabsContent>
                    ))}
                </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveChanges}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
}
