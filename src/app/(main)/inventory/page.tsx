
'use client';
import React from 'react';
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
import { FileDown, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inventoryData = {
  CLAY: {
    'Productos': {
      'CUT STONE 120 X 60': { bodega: 15, zonaFranca: 352, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'TRAVERTINO': { bodega: 14, zonaFranca: 304, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO ENCOFRADO': { bodega: 1, zonaFranca: 77, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'TAPIA NEGRA': { bodega: 2, zonaFranca: 23, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
    }
  },
  STONEFLEX: {
    'Insumos': {
      'ADHESIVO TRASLUCIDO': { bodega: 87, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'POLIURETANO STONEFLEX': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SELLANTE SEMI - BRIGHT GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SELLANTE SEMI - BRIGTH 1/ 4 GALON': { bodega: 9, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SELLANTE SHYNY 1/4 GALON': { bodega: 2, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
    },
    'Estándar': {
      'BLACK 1.22 X 0.61': { bodega: 217, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'KUND MULTY 1.22 X 0.61': { bodega: 310, zonaFranca: 180, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'TAN 1.22 X 0.61': { bodega: 233, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'INDIAN AUTUMN 1.22 X 0.61': { bodega: 189, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'BURNING FOREST 1.22 X 0.61': { bodega: 227, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'COPPER 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'JEERA GREEN 1.22 X 0.61': { bodega: 689, zonaFranca: 270, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'SILVER SHINE 1.22 X 0.61': { bodega: 752, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SILVER SHINE GOLD 1.22 X 0.61': { bodega: 661, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'STEEL GRAY 1.22 X 0.61': { bodega: 875, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'CARRARA 1.22 X 0.61': { bodega: 738, zonaFranca: 300, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'CRYSTAL WHITE 1.22 X 0.61': { bodega: 14, zonaFranca: 0, separadasBodega: 10, separadasZonaFranca: 0, muestras: true },
      'HIMALAYA GOLD 1.22X0.61 MTS': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'MINT WHITE 1.22 X 0.61': { bodega: 15, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO BLANCO 1.22 X 0.61': { bodega: 393, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO GRIS 1.22 X 0.61': { bodega: 592, zonaFranca: 380, separadasBodega: 0, separadasZonaFranca: 56, muestras: true },
      'CONCRETE WITH HOLES 1.22 X 0.61': { bodega: 62, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'CONCRETO GRIS MEDIUM 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CORTEN STELL - 2.44 X 0.61': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': { bodega: 77, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': { bodega: 35, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': { bodega: 61, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'MADERA NOGAL 0.15 X 2.44 MTS': { bodega: 540, zonaFranca: 460, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'MADERA TEKA 0.15 X 2.44 MTS': { bodega: 137, zonaFranca: 600, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      '3D ADHESIVO - 0,90 M2 - BLACK': { bodega: 206, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { bodega: 277, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      '3D ADHESIVO - 0,90 M2 - TAN': { bodega: 177, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
      'PANEL 3D - INDIAN AUTUMN 1.22 X 0.61': { bodega: 13, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PANEL 3D - TAN 1.22 X 0.61': { bodega: 5, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
    },
    'XL': {
      'BLACK 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'TAN 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'kUND MULTY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'INDIAN AUTUMN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'COPPER 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'BURNING FOREST 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'JEERA GREEN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SILVER SHINE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SILVER SHINE GOLD 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'STEEL GREY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO BLANCO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO GRIS 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO MEDIO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CONCRETO WITH HOLES 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CARRARA 2.44 X 1.22': { bodega: 60, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CRYSTAL WHITE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'HIMALAYA GOLD 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 8, separadasZonaFranca: 0, muestras: false },
      'CORTEN STEEL 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
    },
  },
  Starwood: {
    'Productos': {
      'PERGOLA 9x4 - 3 MTS COFFEE': { bodega: 64, zonaFranca: 144, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 9x4 - 3 MTS CHOCOLATE': { bodega: 142, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 10x5 - 3 COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 10x5 - 3 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN': { bodega: 193, zonaFranca: 620, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG': { bodega: 60, zonaFranca: 126, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'LISTON 6.8x2.5 - 3 MTS CAMEL': { bodega: 465, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'LISTON 6.8x2.5 - 3 MTS COFFEE': { bodega: 613, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'LISTON 6.8x2.5 - 3 MTS CHOCOLATE': { bodega: 166, zonaFranca: 800, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'CLIP PLASTICO PARA DECK WPC': { bodega: 166, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DURMIENTE PLASTICO 3x3 - 2.90 MTS': { bodega: 228, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 9x4 - 3 MTS CAMEL': { bodega: 193, zonaFranca: 520, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 10x5 - 3 MTS CAMEL': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 16X8 - 3 MTS CAMEL': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DECK 13.5x2.5 TECK': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 10X5 - 5.60 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 9X4 CM X 4 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DURMIENTE PLASTICO 6 X 6 - 1 MTS': { bodega: 34, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'PERGOLA 16X8 - 3 MTS CHOCOLATE': { bodega: 6, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DAILY CLEAN': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'INTENSIVE CLEAN': { bodega: 17, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SELLANTE WPC 1 GALON': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'SELLANTE WPC 1/4 GALON': { bodega: 25, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'DAILY CLEAN GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'REMATE WALL PANEL ROBLE': { bodega: 37, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'REMATE WALL PANEL MAPLE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'REMATE WALL PANEL NEGRO': { bodega: 52, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'REMATE WALL PANEL GRIS': { bodega: 51, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'BOCEL DECORATIVO BLANCO': { bodega: 287, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
      'LISTON 6X4 - 3 MTS CHOCOLATE': { bodega: 49, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
    }
  },
  Graphestone: {},
  '7walls': {},
  Uvcovering: {},
  glasswing: {},
  Aluwall: {},
};


const ProductTable = ({ products }: { products: { [key: string]: any } }) => {
  const getAvailabilityStatus = (disponible: number) => {
    if (disponible > 100) return 'En Stock';
    if (disponible > 0) return 'Poco Stock';
    return 'Agotado';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'En Stock':
        return 'default';
      case 'Poco Stock':
        return 'secondary';
      case 'Agotado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (Object.keys(products).length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No hay productos en esta categoría.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre del Producto</TableHead>
          <TableHead className="text-right">Disp. Bodega</TableHead>
          <TableHead className="text-right">Disp. Zona Franca</TableHead>
          <TableHead className="text-center">Muestras</TableHead>
          <TableHead>Estado</TableHead>
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
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell className="text-right">{disponibleBodega}</TableCell>
              <TableCell className="text-right">{disponibleZonaFranca}</TableCell>
              <TableCell className="text-center">
                {item.muestras && <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {disponibleBodega > 0 && <Badge variant={getStatusVariant(statusBodega)}>Bodega: {statusBodega}</Badge>}
                  {disponibleZonaFranca > 0 && <Badge variant={getStatusVariant(statusZonaFranca)}>Zona Franca: {statusZonaFranca}</Badge>}
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
  const brands = Object.keys(inventoryData);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Productos</CardTitle>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Datos
        </Button>
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
                    <Tabs defaultValue={Object.keys(inventoryData[brand as keyof typeof inventoryData])[0]} className="w-full">
                        <TabsList>
                            {Object.keys(inventoryData[brand as keyof typeof inventoryData]).map((subCategory) => (
                                <TabsTrigger value={subCategory} key={subCategory}>{subCategory}</TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.entries(inventoryData[brand as keyof typeof inventoryData]).map(([subCategory, products]) => (
                             <TabsContent value={subCategory} key={subCategory}>
                                <ProductTable products={products} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </TabsContent>
            ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

    