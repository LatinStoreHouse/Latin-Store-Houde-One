'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
);

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
  'Concreto': 177162,
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
   // XL
  'BLACK 2.44 X 1.22': { line: 'Pizarra', brand: 'STONEFLEX' },
  'TAN 2.44 X 1.22': { line: 'Pizarra', brand: 'STONEFLEX' },
  'kUND MULTY 2.44 X 1.22': { line: 'Pizarra', brand: 'STONEFLEX' },
  'INDIAN AUTUMN 2.44 X 1.22': { line: 'Pizarra', brand: 'STONEFLEX' },
  'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': { line: 'Translucida', brand: 'STONEFLEX' },
  'COPPER 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'BURNING FOREST 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'JEERA GREEN 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'SILVER SHINE 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'SILVER SHINE GOLD 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'STEEL GREY 2.44 X 1.22': { line: 'Cuarcitas', brand: 'STONEFLEX' },
  'CONCRETO BLANCO 2.44 X 1.22': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETO GRIS 2.44 X 1.22': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETO MEDIO 2.44 X 1.22': { line: 'Concreto', brand: 'STONEFLEX' },
  'CONCRETO WITH HOLES 2.44 X 1.22': { line: 'Concreto', brand: 'STONEFLEX' },
  'CARRARA 2.44 X 1.22': { line: 'Mármol', brand: 'STONEFLEX' },
  'CRYSTAL WHITE 2.44 X 1.22': { line: 'Mármol', brand: 'STONEFLEX' },
  'HIMALAYA GOLD 2.44 X 1.22': { line: 'Mármol', brand: 'STONEFLEX' },
  'CORTEN STEEL 2.44 X 1.22': { line: 'Metales', brand: 'STONEFLEX' },
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

interface QuoteItem {
  id: number;
  reference: string;
  sqMeters: number;
  sheets: number;
  discount: number;
  includeSealant: boolean;
  includeAdhesive: boolean;
  calculationMode: 'sqm' | 'sheets';
  pricePerSheet: number;
}

export default function StoneflexClayCalculatorPage() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [reference, setReference] = useState('');
  const [sqMeters, setSqMeters] = useState<number | string>(1);
  const [sheets, setSheets] = useState(1);
  const [discount, setDiscount] = useState<number | string>(0);
  const [wastePercentage, setWastePercentage] = useState<number | string>(0);
  const [includeSealant, setIncludeSealant] = useState(true);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [calculationMode, setCalculationMode] = useState<'sqm' | 'sheets'>('sqm');
  const [transportationCost, setTransportationCost] = useState(0);

  const referenceOptions = useMemo(() => {
    return allReferences.map(ref => ({ value: ref, label: ref }));
  }, []);

  const getSqmPerSheet = (ref: string) => {
    if (ref.includes('1.22 X 0.61') || ref.includes('120 X 60') || ref.includes('1.22X0.61')) {
      return 0.7442;
    } else if (ref.includes('2.44 X 1.22')) {
      return 2.9768;
    } else if (ref.includes('0.15 X 2.44')) {
      return 0.366;
    } else if (ref.includes('0,90 M2')) {
      return 0.9;
    } else if (ref.includes('2.44 X 0.61')) {
        return 1.4884;
    }
    return 1; // Default
  }
  
  const parseDecimal = (value: string | number) => {
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(',', '.')) || 0;
  };


  const handleAddProduct = () => {
    if (!reference) return;
    
    const wasteValue = parseDecimal(wastePercentage);
    const discountValue = parseDecimal(discount);

    const sqmPerSheet = getSqmPerSheet(reference);
    const wasteFactor = 1 + wasteValue / 100;
    
    let baseSqm = 0;
    let baseSheets = 0;

    if (calculationMode === 'sqm') {
      baseSqm = parseDecimal(sqMeters);
      baseSheets = Math.ceil(baseSqm / sqmPerSheet);
    } else {
      baseSheets = sheets;
      baseSqm = baseSheets * sqmPerSheet;
    }

    const finalSqm = baseSqm * wasteFactor;
    const finalSheets = Math.ceil(finalSqm / sqmPerSheet);

    const refDetails = referenceLines[reference];
    const pricePerSqm = linePricing[refDetails.line];
    const pricePerSheet = pricePerSqm * sqmPerSheet;


    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      sqMeters: finalSqm,
      sheets: finalSheets,
      discount: discountValue,
      includeSealant,
      includeAdhesive,
      calculationMode,
      pricePerSheet
    };

    setQuoteItems([...quoteItems, newItem]);
  };

  const handleRemoveProduct = (id: number) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateQuote = () => {
    let totalProductCost = 0;
    let totalSealantCost = 0;
    let totalAdhesiveCost = 0;
    let totalDiscountAmount = 0;
    let totalSealantUnits = 0;
    let totalAdhesiveUnits = 0;
    let isWarrantyVoid = false;

    const detailedItems = quoteItems.map(item => {
      const refDetails = referenceLines[item.reference];
      if (!refDetails) return {...item, itemTotal: 0};

      const { line, brand } = refDetails;
      const pricePerSqm = linePricing[line];
      const calculatedSqm = item.sqMeters;
      const calculatedSheets = item.sheets;

      const productCost = pricePerSqm * calculatedSqm;
      
      let itemSealantCost = 0;
      let calculatedSealantUnits = 0;
      if (item.includeSealant) {
        let sealantYield = 15; // Default for Stoneflex
        if (brand === 'CLAY') {
          sealantYield = 11;
        }
        calculatedSealantUnits = Math.ceil(calculatedSqm / sealantYield);
        totalSealantUnits += calculatedSealantUnits;
        itemSealantCost = calculatedSealantUnits * linePricing['Sellante'];
        totalSealantCost += itemSealantCost;
      }

      let itemAdhesiveCost = 0;
      let calculatedAdhesiveUnits = 0;
      if (item.includeAdhesive) {
        if (item.reference.includes('1.22 X 0.61') || item.reference.includes('1.22X0.61')) {
            calculatedAdhesiveUnits = Math.ceil(calculatedSheets / 2);
        } else if (line === 'Metales' && item.reference.includes('2.44 X 0.61')) {
            calculatedAdhesiveUnits = calculatedSheets;
        } else if (item.reference.includes('2.44 X 1.22')) {
            calculatedAdhesiveUnits = calculatedSheets * 2;
        } else {
            const adhesiveLines = ['Pizarra', 'Cuarcitas', 'Concreto', 'Clay'];
            if (adhesiveLines.includes(line)) {
                calculatedAdhesiveUnits = Math.ceil(calculatedSheets / 2);
            } else {
                calculatedAdhesiveUnits = Math.ceil(calculatedSqm / 1); 
            }
        }
        totalAdhesiveUnits += calculatedAdhesiveUnits;
        itemAdhesiveCost = calculatedAdhesiveUnits * linePricing['Adhesivo'];
        totalAdhesiveCost += itemAdhesiveCost;
      }
      
      totalProductCost += productCost;
      
      if (!item.includeSealant || !item.includeAdhesive) {
        isWarrantyVoid = true;
      }
      
      const itemSubtotal = productCost + itemSealantCost + itemAdhesiveCost;
      const discountAmount = itemSubtotal * (item.discount / 100);
      totalDiscountAmount += discountAmount;

      return {...item, itemTotal: itemSubtotal - discountAmount};
    });

    const subtotalBeforeDiscount = totalProductCost + totalSealantCost + totalAdhesiveCost;
    const subtotalBeforeIva = subtotalBeforeDiscount - totalDiscountAmount;
    const ivaAmount = subtotalBeforeIva * IVA_RATE;
    const totalCost = subtotalBeforeIva + ivaAmount + transportationCost;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    return {
      items: detailedItems,
      totalProductCost,
      totalSealantCost,
      totalAdhesiveCost,
      totalDiscountAmount,
      totalSealantUnits,
      totalAdhesiveUnits,
      isWarrantyVoid,
      subtotal: subtotalBeforeIva,
      ivaAmount,
      totalCost,
      transportationCost,
      creationDate: creationDate.toLocaleDateString('es-CO'),
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    };
  };

  const quote = quoteItems.length > 0 ? calculateQuote() : null;

  const handleShareOnWhatsApp = () => {
    if (!quote) return;

    let message = `*Cotización de Latin Store House*\n\n`;
    message += `*Fecha de Cotización:* ${quote.creationDate}\n`;
    message += `*Válida hasta:* ${quote.expiryDate}\n\n`;
    
    message += `*Resumen de Productos:*\n`;
    quote.items.forEach(item => {
      message += `- *${item.reference}*: ${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²)`;
      if (item.discount > 0) {
        message += ` con ${item.discount}% de descuento.\n`;
      } else {
        message += `\n`;
      }
    });
    
    message += `\n*Desglose de Costos:*\n`;
    message += `- Subtotal Productos: ${formatCurrency(quote.totalProductCost)}\n`;
    message += `- Costo Sellante (${quote.totalSealantUnits} u.): ${formatCurrency(quote.totalSealantCost)}\n`;
    message += `- Costo Adhesivo (${quote.totalAdhesiveUnits} u.): ${formatCurrency(quote.totalAdhesiveCost)}\n`;
    message += `- Descuento Total: -${formatCurrency(quote.totalDiscountAmount)}\n`;
    message += `- *Subtotal:* ${formatCurrency(quote.subtotal)}\n`;
    message += `- IVA (19%): ${formatCurrency(quote.ivaAmount)}\n`;
    if (quote.transportationCost > 0) {
        message += `- Costo Transporte: ${formatCurrency(quote.transportationCost)}\n`;
    }
    message += `\n*Total Estimado: ${formatCurrency(quote.totalCost)}*\n\n`;
    
    if (quote.isWarrantyVoid) {
        message += `*Nota Importante:* La no inclusión de sellante o adhesivo puede anular la garantía del producto.\n`;
    }
    message += `_Esta es una cotización preliminar y no incluye costos de instalación._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleDecimalInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(',', '.');
    if (/^\d*\.?\d*$/.test(sanitizedValue)) {
      setter(value);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Cotizaciones - Stoneflex &amp; Clay</CardTitle>
        <CardDescription>
          Añada productos y estime el costo total de la cotización.
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
                  type="text"
                  value={sqMeters}
                  onChange={handleDecimalInputChange(setSqMeters)}
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waste-input">Desperdicio (%)</Label>
                  <Input
                    id="waste-input"
                    type="text"
                    value={wastePercentage}
                    onChange={handleDecimalInputChange(setWastePercentage)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount-input">Descuento (%)</Label>
                  <Input
                    id="discount-input"
                    type="text"
                    value={discount}
                    onChange={handleDecimalInputChange(setDiscount)}
                    className="w-full"
                  />
                </div>
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
              <Button onClick={handleAddProduct} className="mt-4" disabled={!reference}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </div>
         {quote && (
          <Card className="bg-primary/5 mt-6">
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
              <div className="space-y-4">
                {quote.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start p-3 rounded-md bg-background">
                    <div className="flex-1">
                      <p className="font-semibold">{item.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {`${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²) | ${formatCurrency(item.pricePerSheet)}/lámina`}
                        {item.discount > 0 && ` - ${item.discount}% desc.`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal Productos</span>
                  <span>{formatCurrency(quote.totalProductCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo Sellante ({quote.totalSealantUnits} u.)</span>
                  <span>{formatCurrency(quote.totalSealantCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo Adhesivo ({quote.totalAdhesiveUnits} u.)</span>
                  <span>{formatCurrency(quote.totalAdhesiveCost)}</span>
                </div>
                 <div className="flex justify-between text-red-500">
                  <span className="text-muted-foreground">Descuento Total</span>
                  <span>-{formatCurrency(quote.totalDiscountAmount)}</span>
                </div>
                 <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span>{formatCurrency(quote.ivaAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="transport-cost" className="text-muted-foreground">Costo Transporte</Label>
                  <Input
                    id="transport-cost"
                    type="number"
                    value={transportationCost}
                    onChange={(e) => setTransportationCost(Number(e.target.value))}
                    className="w-32 h-8 text-right"
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                    </Button>
                    <Button variant="outline" onClick={handleShareOnWhatsApp}>
                        <WhatsAppIcon />
                        <span className="ml-2">Compartir</span>
                    </Button>
                </div>
                <p className="text-lg font-bold text-right">
                  Costo Total Estimado: {formatCurrency(quote.totalCost)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground pt-2 space-y-1 text-center">
                  <p>
                    Esta es una cotización preliminar y no incluye costos de instalación.
                  </p>
                  {quote.isWarrantyVoid && (
                    <p className="font-semibold text-destructive">
                      La no inclusión de sellante o adhesivo puede anular la garantía del producto.
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
