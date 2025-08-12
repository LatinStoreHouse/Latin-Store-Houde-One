'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';

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
  'Default': 100000, 
  'Sellante': 50000, 
  'Adhesivo': 30000, 
};

const referenceLines: { [key: string]: { line: keyof typeof linePricing, brand: string } } = {
  // Clay
  'CUT STONE 120 X 60': { line: 'Clay', brand: 'CLAY' },
  'TRAVERTINO': { line: 'Clay', brand: 'CLAY' },
  'CONCRETO ENCOFRADO': { line: 'Clay', brand: 'CLAY' },
  'TAPIA NEGRA': { line: 'Clay', brand: 'CLAY' },
  // Pizarra
  'BLACK 1.22 X 0.61': { line: 'Pizarra', brand: 'STONEFLEX' },
  'KUND MULTY 1.22 X 0.61': { line: 'Pizarra', brand: 'STONEFLEX' },
  'TAN 1.22 X 0.61': { line: 'Pizarra', brand: 'STONEFLEX' },
  'INDIAN AUTUMN 1.22 X 0.61': { line: 'Pizarra', brand: 'STONEFLEX' },
  // Translucida
  'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': { line: 'Translucida', brand: 'STONEFLEX' },
  // Cuarcitas
  'BURNING FOREST 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'COPPER 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'JEERA GREEN 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'SILVER SHINE 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'SILVER SHINE GOLD 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'STEEL GRAY 1.22 X 0.61': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  // Mármol
  'CARRARA 1.22 X 0.61': { line: 'Mármol', brand: 'STONEFLEX' },
  'CRYSTAL WHITE 1.22 X 0.61': { line: 'Mármol', brand: 'STONEFLEX' },
  'HIMALAYA GOLD 1.22X0.61 MTS': { line: 'Mármol', brand: 'STONEFLEX' },
  'MINT WHITE 1.22 X 0.61': { line: 'Mármol', brand: 'STONEFLEX' },
  // Concreto
  'CONCRETO BLANCO 1.22 X 0.61': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETO GRIS 1.22 X 0.61': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETE WITH HOLES 1.22 X 0.61': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETO GRIS MEDIUM 1.22 X 0.61': { line: 'Concreto', brand: 'STONEFLEX' },
  // Metales
  'CORTEN STELL - 2.44 X 0.61': { line: 'Metales', brand: 'STONEFLEX' },
  'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': { line: 'Metales', brand: 'STONEFLEX' },
  'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': { line: 'Metales', brand: 'STONEFLEX' },
  'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': { line: 'Metales', brand: 'STONEFLEX' },
  // Madera
  'MADERA NOGAL 0.15 X 2.44 MTS': { line: 'Madera', brand: 'STONEFLEX' },
  'MADERA TEKA 0.15 X 2.44 MTS': { line: 'Madera', brand: 'STONEFLEX' },
  // 3D autoadhesiva
  '3D ADHESIVO - 0,90 M2 - BLACK': { line: '3D autoadhesiva', brand: 'STONEFLEX' },
  '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { line: '3D autoadhesiva', brand: 'STONEFLEX' },
  '3D ADHESIVO - 0,90 M2 - TAN': { line: '3D autoadhesiva', brand: 'STONEFLEX' },
};

const allReferences = Object.entries(inventoryData)
  .flatMap(([brand, categories]) => 
    Object.entries(categories)
      .filter(([, products]) => products)
      .flatMap(([category, products]) => 
        Object.keys(products).map(ref => ({ ref, brand, category }))
      )
  )
  .filter(item => referenceLines[item.ref]) // Ensure the reference has pricing info
  .map(item => item.ref);


const IVA_RATE = 0.19; // 19%

export default function StoneflexClayCalculatorPage() {
  const [reference, setReference] = useState('');
  const [sqMeters, setSqMeters] = useState(1);
  const [sheets, setSheets] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [includeSealant, setIncludeSealant] = useState(true);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [calculationMode, setCalculationMode] = useState<'sqm' | 'sheets'>('sqm');
  const [quote, setQuote] = useState<any>(null);

  const referenceOptions = useMemo(() => {
    return allReferences.map(ref => ({ value: ref, label: ref }));
  }, []);

  const getSqmPerSheet = (ref: string) => {
    if (ref.includes('1.22 X 0.61') || ref.includes('120 X 60')) {
      return 0.7442;
    } else if (ref.includes('2.44 X 1.22')) {
      return 2.9768;
    } else if (ref.includes('0.15 X 2.44')) {
      return 0.366;
    } else if (ref.includes('0,90 M2')) {
      return 0.9;
    }
    return 1; // Default
  }

  const handleCalculate = () => {
    const refDetails = referenceLines[reference];
    if (!refDetails) return;
    
    const { line, brand } = refDetails;
    const pricePerSqm = linePricing[line];
    const sqmPerSheet = getSqmPerSheet(reference);

    let calculatedSheets = 0;
    let calculatedSqm = 0;
    
    if (calculationMode === 'sqm') {
      calculatedSqm = sqMeters;
      calculatedSheets = Math.ceil(sqMeters / sqmPerSheet);
    } else {
      calculatedSheets = sheets;
      calculatedSqm = sheets * sqmPerSheet;
    }
    
    let calculatedSealantUnits = 0;
    if (includeSealant && calculatedSqm > 0) {
      if (brand === 'CLAY') {
        calculatedSealantUnits = Math.ceil(calculatedSqm / 11);
      } else if (brand === 'STONEFLEX') {
        calculatedSealantUnits = Math.ceil(calculatedSqm / 15);
      } else {
        calculatedSealantUnits = Math.ceil(calculatedSqm / 15);
      }
      if (calculatedSealantUnits === 0 && calculatedSqm > 0) {
        calculatedSealantUnits = 1;
      }
    }

    let calculatedAdhesiveUnits = 0;
    if (includeAdhesive) {
        const adhesiveLines = ['Pizarra', 'Cuarcitas', 'Concreto', 'Clay'];
        if (adhesiveLines.includes(line)) {
            calculatedAdhesiveUnits = calculatedSheets * 2;
        } else {
            calculatedAdhesiveUnits = Math.ceil(calculatedSqm / 1); 
        }
    }

    const productCost = pricePerSqm * calculatedSqm;
    const discountAmount = productCost * (discount / 100);
    const discountedProductCost = productCost - discountAmount;
    
    const sealantCost = calculatedSealantUnits * linePricing['Sellante'];
    const adhesiveCost = calculatedAdhesiveUnits * linePricing['Adhesivo'];

    const subtotal = discountedProductCost + sealantCost + adhesiveCost;
    const ivaAmount = subtotal * IVA_RATE;
    const totalCost = subtotal + ivaAmount;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    setQuote({
      reference,
      sqMeters: calculatedSqm,
      sheets: calculatedSheets,
      sealantUnits: calculatedSealantUnits,
      adhesiveUnits: calculatedAdhesiveUnits,
      productCost,
      discountAmount,
      discountedProductCost,
      sealantCost,
      adhesiveCost,
      subtotal,
      ivaAmount,
      totalCost,
      creationDate: creationDate.toLocaleDateString('es-CO'),
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    });
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
        <CardTitle>Calculadora de Cotizaciones - Stoneflex & Clay</CardTitle>
        <CardDescription>
          Estime el costo de los productos por metro cuadrado, incluyendo materiales necesarios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Referencia de Producto</Label>
               <Combobox
                 options={referenceOptions}
                 value={reference}
                 onValueChange={setReference}
                 placeholder="Seleccione una referencia"
                 searchPlaceholder="Buscar referencia..."
                 emptyPlaceholder="No se encontraron referencias."
               />
             </div>
             <div className="space-y-2">
                <Label>Calcular por</Label>
                <RadioGroup defaultValue="sqm" value={calculationMode} onValueChange={(value) => setCalculationMode(value as 'sqm' | 'sheets')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sqm" id="sqm" />
                    <Label htmlFor="sqm">M²</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sheets" id="sheets" />
                    <Label htmlFor="sheets">Láminas</Label>
                  </div>
                </RadioGroup>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculationMode === 'sqm' ? (
              <div className="space-y-2">
                <Label htmlFor="sqm-input">Metros Cuadrados (M²)</Label>
                <Input 
                  id="sqm-input"
                  type="number" 
                  value={sqMeters} 
                  onChange={(e) => setSqMeters(Number(e.target.value))}
                  min="1"
                  className="w-full" 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="sheets-input">Número de Láminas</Label>
                <Input
                  id="sheets-input"
                  type="number"
                  value={sheets}
                  onChange={(e) => setSheets(Number(e.target.value))}
                  min="1"
                  className="w-full"
                />
              </div>
            )}
             <div className="space-y-2">
              <Label htmlFor="discount-input">Descuento (%)</Label>
              <Input
                id="discount-input"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                min="0"
                max="100"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="include-sealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))} />
                <Label htmlFor="include-sealant">Incluir Sellante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="include-adhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))} />
                <Label htmlFor="include-adhesive">Incluir Adhesivo</Label>
              </div>
          </div>
          <div className="flex justify-end">
              <Button onClick={handleCalculate} className="mt-4" disabled={!reference}>
                <Calculator className="mr-2 h-4 w-4" />
                Generar Cotización
              </Button>
            </div>
         {quote && (
          <Card className="bg-primary/5 mt-4">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Resumen de la Cotización</CardTitle>
                      <CardDescription>
                          Cotización válida hasta el {quote.expiryDate}.
                      </CardDescription>
                  </div>
                  <div className="text-right">
                      <div className="relative h-10 w-32 mb-2">
                          <Image src="/logo.png" alt="Latin Store House Logo" fill style={{ objectFit: 'contain' }} />
                      </div>
                      <p className="text-sm font-semibold">Asesor: Usuario Admin</p>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">{quote.reference} ({quote.sqMeters.toFixed(2)} M²)</h3>
                    <p className="text-muted-foreground">Costo Producto: {formatCurrency(quote.productCost)}</p>
                  </div>
                  <div className="space-y-2 text-sm text-right">
                     <p>Subtotal: {formatCurrency(quote.subtotal)}</p>
                     <p className="text-red-500">Descuento: -{formatCurrency(quote.discountAmount)}</p>
                     <p>IVA (19%): {formatCurrency(quote.ivaAmount)}</p>
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4 mt-4">
                <div>
                  <p className="font-semibold">Láminas</p>
                  <p>{quote.sheets} unidades</p>
                </div>
                <div>
                  <p className="font-semibold">Sellante (1/4 Gal)</p>
                  <p>{quote.sealantUnits} unidades ({formatCurrency(quote.sealantCost)})</p>
                </div>
                <div>
                  <p className="font-semibold">Adhesivo</p>
                  <p>{quote.adhesiveUnits} unidades ({formatCurrency(quote.adhesiveCost)})</p>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-lg font-bold text-right">
                  Costo Total Estimado: {formatCurrency(quote.totalCost)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Esta es una cotización preliminar y no incluye costos de envío o instalación.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
