'use client';
import React, { useState } from 'react';
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


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


const initialInventoryData = {
  StoneFlex: {
    'Clay': {
      'CUT STONE 120 X 60': { bodega: 15, zonaFranca: 352, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TRAVERTINO': { bodega: 14, zonaFranca: 304, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO ENCOFRADO': { bodega: 1, zonaFranca: 77, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TAPIA NEGRA': { bodega: 2, zonaFranca: 23, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'Insumos': {
      'ADHESIVO TRASLUCIDO': { bodega: 87, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'POLIURETANO STONEFLEX': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SEMI - BRIGHT GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SEMI - BRIGTH 1/ 4 GALON': { bodega: 9, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SHYNY 1/4 GALON': { bodega: 2, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'Estándar': {
      'BLACK 1.22 X 0.61': { bodega: 217, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'KUND MULTY 1.22 X 0.61': { bodega: 310, zonaFranca: 180, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'TAN 1.22 X 0.61': { bodega: 233, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'INDIAN AUTUMN 1.22 X 0.61': { bodega: 189, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'BURNING FOREST 1.22 X 0.61': { bodega: 227, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'COPPER 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'JEERA GREEN 1.22 X 0.61': { bodega: 689, zonaFranca: 270, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'SILVER SHINE 1.22 X 0.61': { bodega: 752, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE GOLD 1.22 X 0.61': { bodega: 661, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'STEEL GRAY 1.22 X 0.61': { bodega: 875, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CARRARA 1.22 X 0.61': { bodega: 738, zonaFranca: 300, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CRYSTAL WHITE 1.22 X 0.61': { bodega: 14, zonaFranca: 0, separadasBodega: 10, separadasZonaFranca: 0, muestras: 1 },
      'HIMALAYA GOLD 1.22X0.61 MTS': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MINT WHITE 1.22 X 0.61': { bodega: 15, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO BLANCO 1.22 X 0.61': { bodega: 393, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO GRIS 1.22 X 0.61': { bodega: 592, zonaFranca: 380, separadasBodega: 0, separadasZonaFranca: 56, muestras: 1 },
      'CONCRETE WITH HOLES 1.22 X 0.61': { bodega: 62, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CONCRETO GRIS MEDIUM 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CORTEN STELL - 2.44 X 0.61': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': { bodega: 77, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': { bodega: 35, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': { bodega: 61, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'MADERA NOGAL 0.15 X 2.44 MTS': { bodega: 540, zonaFranca: 460, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'MADERA TEKA 0.15 X 2.44 MTS': { bodega: 137, zonaFranca: 600, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      '3D ADHESIVO - 0,90 M2 - BLACK': { bodega: 206, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { bodega: 277, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      '3D ADHESIVO - 0,90 M2 - TAN': { bodega: 177, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'PANEL 3D - INDIAN AUTUMN 1.22 X 0.61': { bodega: 13, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PANEL 3D - TAN 1.22 X 0.61': { bodega: 5, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'XL': {
      'BLACK 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TAN 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'kUND MULTY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INDIAN AUTUMN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'COPPER 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'BURNING FOREST 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'JEERA GREEN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE GOLD 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'STEEL GREY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO BLANCO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO GRIS 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO MEDIO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO WITH HOLES 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CARRARA 2.44 X 1.22': { bodega: 60, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CRYSTAL WHITE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'HIMALAYA GOLD 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 8, separadasZonaFranca: 0, muestras: 0 },
      'CORTEN STEEL 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
  },
  Starwood: {
    'Productos': {
      'PERGOLA 9x4 - 3 MTS COFFEE': { bodega: 64, zonaFranca: 144, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9x4 - 3 MTS CHOCOLATE': { bodega: 142, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN': { bodega: 193, zonaFranca: 620, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG': { bodega: 60, zonaFranca: 126, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS CAMEL': { bodega: 465, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS COFFEE': { bodega: 613, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS CHOCOLATE': { bodega: 166, zonaFranca: 800, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CLIP PLASTICO PARA DECK WPC': { bodega: 166, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DURMIENTE PLASTICO 3x3 - 2.90 MTS': { bodega: 228, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9x4 - 3 MTS CAMEL': { bodega: 193, zonaFranca: 520, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 MTS CAMEL': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 16X8 - 3 MTS CAMEL': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK 13.5x2.5 TECK': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10X5 - 5.60 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9X4 CM X 4 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DURMIENTE PLASTICO 6 X 6 - 1 MTS': { bodega: 34, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 16X8 - 3 MTS CHOCOLATE': { bodega: 6, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DAILY CLEAN': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INTENSIVE CLEAN': { bodega: 17, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE WPC 1 GALON': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE WPC 1/4 GALON': { bodega: 25, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DAILY CLEAN GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL ROBLE': { bodega: 37, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL MAPLE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL NEGRO': { bodega: 52, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL GRIS': { bodega: 51, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'BOCEL DECORATIVO BLANCO': { bodega: 287, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6X4 - 3 MTS CHOCOLATE': { bodega: 49, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    }
  },
  Graphestone: {},
  '7walls': {},
  Uvcovering: {},
  glasswing: {},
  Aluwall: {},
};

// Mocked user role. In a real app, this would come from an auth context.
const currentUserRole: Role = 'Administrador';

const ProductTable = ({ products, brand, subCategory, canEdit, onDataChange }: { products: { [key: string]: any }, brand: string, subCategory: string, canEdit: boolean, onDataChange: Function }) => {
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
    const isNumber = typeof initialInventoryData[brand as keyof typeof initialInventoryData][subCategory][productName][field] === 'number';
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
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
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
     let productData: any;
     let brandName: string = '';
     let subCategoryName: string = '';

     // Find the product in the inventory data
     for (const brand in inventoryData) {
       for (const subCategory in inventoryData[brand as keyof typeof inventoryData]) {
         if (inventoryData[brand as keyof typeof inventoryData][subCategory][product]) {
           productData = inventoryData[brand as keyof typeof inventoryData][subCategory][product];
           brandName = brand;
           subCategoryName = subCategory;
           break;
         }
       }
       if (productData) break;
     }

     if (!productData) {
       toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.' });
       return;
     }
    
     const availableInZF = productData.zonaFranca - productData.separadasZonaFranca;
     if (quantity > availableInZF) {
        toast({ variant: 'destructive', title: 'Error', description: `Cantidad a trasladar (${quantity}) excede la disponible en Zona Franca (${availableInZF}).` });
        return;
     }
    
     const reservedRatio = productData.separadasZonaFranca / productData.zonaFranca;
     const separadasToTransfer = productData.zonaFranca > 0 ? Math.round(quantity * reservedRatio) : 0;

     if (separadasToTransfer > productData.separadasZonaFranca) {
        toast({ variant: 'destructive', title: 'Error', description: `El cálculo de separadas a mover excede las disponibles.` });
        return;
     }
    
     setInventoryData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        const p = newData[brandName][subCategoryName][product];
        p.zonaFranca -= quantity;
        p.bodega += quantity;
        p.separadasZonaFranca -= separadasToTransfer;
        p.separadasBodega += separadasToTransfer;
        return newData;
     });

     toast({ title: 'Traslado Exitoso', description: `${quantity} unidades de ${product} movidas de Zona Franca a Bodega.` });
     setIsTransferDialogOpen(false);
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
                        <TransferInventoryForm inventoryData={inventoryData} onTransfer={handleTransfer} />
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
            <TabsList className="grid w-full grid-cols-7">
                {brands.map((brand) => (
                    <TabsTrigger value={brand} key={brand}>{formatBrandName(brand)}</TabsTrigger>
                ))}
            </TabsList>
            {brands.map((brand) => (
                <TabsContent value={brand} key={brand}>
                    <Card>
                      <CardContent className="p-0">
                        <Tabs defaultValue={Object.keys(inventoryData[brand as keyof typeof inventoryData])[0] || 'default'} className="w-full" orientation="vertical">
                            <TabsList>
                                {Object.keys(inventoryData[brand as keyof typeof inventoryData]).map((subCategory) => (
                                    <TabsTrigger value={subCategory} key={subCategory}>{subCategory}</TabsTrigger>
                                ))}
                            </TabsList>
                            {Object.entries(inventoryData[brand as keyof typeof inventoryData]).map(([subCategory, products]) => (
                                 <TabsContent value={subCategory} key={subCategory}>
                                    <ProductTable 
                                        products={products} 
                                        brand={brand}
                                        subCategory={subCategory}
                                        canEdit={canEdit}
                                        onDataChange={handleDataChange}
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
