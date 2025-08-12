'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const linePricing: { [key: string]: number } = {
  'Pizarra': 177162,
  'Cuarcitas': 177162,
  'Concreto': 188991,
  'Mármol': 239247,
  'Translucida': 252689,
  'Madera': 222710,
  'Metales': 267819,
  '3D autoadhesiva': 207072,
  'Clay': 176000,
  'Default': 100000, // Precio por defecto para productos sin línea definida
  'Sellante': 50000, // Precio del sellante
};

const referenceLines: { [key: string]: keyof typeof linePricing } = {
  // Clay
  'CUT STONE 120 X 60': 'Clay',
  'TRAVERTINO': 'Clay',
  'CONCRETO ENCOFRADO': 'Clay',
  'TAPIA NEGRA': 'Clay',
  // Pizarra
  'BLACK 1.22 X 0.61': 'Pizarra',
  'KUND MULTY 1.22 X 0.61': 'Pizarra',
  'TAN 1.22 X 0.61': 'Pizarra',
  'INDIAN AUTUMN 1.22 X 0.61': 'Pizarra',
  // Translucida
  'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': 'Translucida',
  // Cuarcitas
  'BURNING FOREST 1.22 X 0.61': 'Cuarcitas',
  'COPPER 1.22 X 0.61': 'Cuarcitas',
  'JEERA GREEN 1.22 X 0.61': 'Cuarcitas',
  'SILVER SHINE 1.22 X 0.61': 'Cuarcitas',
  'SILVER SHINE GOLD 1.22 X 0.61': 'Cuarcitas',
  'STEEL GRAY 1.22 X 0.61': 'Cuarcitas',
  // Mármol
  'CARRARA 1.22 X 0.61': 'Mármol',
  'CRYSTAL WHITE 1.22 X 0.61': 'Mármol',
  'HIMALAYA GOLD 1.22X0.61 MTS': 'Mármol',
  'MINT WHITE 1.22 X 0.61': 'Mármol',
  // Concreto
  'CONCRETO BLANCO 1.22 X 0.61': 'Concreto',
  'CONCRETO GRIS 1.22 X 0.61': 'Concreto',
  'CONCRETE WITH HOLES 1.22 X 0.61': 'Concreto',
  'CONCRETO GRIS MEDIUM 1.22 X 0.61': 'Concreto',
  // Metales
  'CORTEN STELL - 2.44 X 0.61': 'Metales',
  'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': 'Metales',
  'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': 'Metales',
  'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': 'Metales',
  // Madera
  'MADERA NOGAL 0.15 X 2.44 MTS': 'Madera',
  'MADERA TEKA 0.15 X 2.44 MTS': 'Madera',
  // 3D autoadhesiva
  '3D ADHESIVO - 0,90 M2 - BLACK': '3D autoadhesiva',
  '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': '3D autoadhesiva',
  '3D ADHESIVO - 0,90 M2 - TAN': '3D autoadhesiva',
};

const allReferences = Object.values(inventoryData)
  .flatMap(brand => Object.values(brand))
  .flatMap(category => Object.keys(category));


export default function CalculatorPage() {
  const [reference, setReference] = useState('');
  const [sqMeters, setSqMeters] = useState(1);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [sealantCost, setSealantCost] = useState(0);
  const [sheets, setSheets] = useState(0);
  const [sealantUnits, setSealantUnits] = useState(0);

  const handleCalculate = () => {
    const line = referenceLines[reference] || 'Default';
    const pricePerSqm = linePricing[line];
    
    let calculatedSheets = 0;
    if (reference.includes('1.22 X 0.61') || reference.includes('120 X 60')) {
      calculatedSheets = Math.ceil(sqMeters / 0.7442);
    } else if (reference.includes('2.44 X 1.22')) {
      calculatedSheets = Math.ceil(sqMeters / 2.9768);
    }
    setSheets(calculatedSheets);

    let calculatedSealantUnits = 0;
    if (line === 'Metales') {
      calculatedSealantUnits = calculatedSheets; // 1 por lamina
    } else if (reference.includes('1.22 X 0.61') || reference.includes('120 X 60')) {
      calculatedSealantUnits = Math.ceil(calculatedSheets / 2); // 1 por cada 2
    }
    setSealantUnits(calculatedSealantUnits);
    
    const currentSealantCost = calculatedSealantUnits * linePricing['Sellante'];
    setSealantCost(currentSealantCost);

    setTotalCost(pricePerSqm * sqMeters + currentSealantCost);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Costos</CardTitle>
        <CardDescription>
          Estime el costo de los productos por metro cuadrado, incluyendo el sellante necesario.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
             <label className="text-sm font-medium">Referencia de Producto</label>
             <Select onValueChange={setReference} value={reference}>
               <SelectTrigger>
                 <SelectValue placeholder="Seleccione una referencia" />
               </SelectTrigger>
               <SelectContent>
                 {allReferences.map((ref) => (
                   <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
          <div>
            <label htmlFor="sqm-input" className="text-sm font-medium">Metros Cuadrados (M²)</label>
            <Input 
              id="sqm-input"
              type="number" 
              value={sqMeters} 
              onChange={(e) => setSqMeters(Number(e.target.value))}
              min="1"
              className="w-full" 
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCalculate} className="w-full" disabled={!reference}>
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Costo
            </Button>
          </div>
        </div>
         {totalCost !== null && (
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Costo Total Estimado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
              <p className="text-sm text-muted-foreground">
                Para <strong>{sqMeters} M²</strong> de <strong>{reference}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Se necesitarían aproximadamente <strong>{sheets} láminas</strong>.
              </p>
               {sealantCost > 0 && (
                <>
                <p className="text-sm text-muted-foreground">
                  Costo del producto: {formatCurrency(totalCost - sealantCost)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Costo del sellante ({sealantUnits} unidades): {formatCurrency(sealantCost)}
                </p>
               </>
              )}
              <p className="text-xs text-muted-foreground pt-2">
                No incluye valor de adhesivo.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
