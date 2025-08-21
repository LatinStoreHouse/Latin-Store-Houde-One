

'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download, RefreshCw, Loader2, HelpCircle, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { initialProductPrices as productPrices } from '@/lib/prices';
import { getExchangeRate } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18.1-.28.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
);


const referenceDetails: { [key: string]: { brand: string, line: string } } = {
  'CLAY CUT STONE 1.20*0.60': { brand: 'StoneFlex', line: 'Clay' },
  'CLAY TRAVERTINO 1.20*0.60': { brand: 'StoneFlex', line: 'Clay' },
  'CONCRETO ENCOFRADO 2.90*0.56': { brand: 'StoneFlex', line: 'Clay' },
  'CLAY TAPIA NEGRA 2.95*1.20': { brand: 'StoneFlex', line: 'Clay' },
  'BLACK 1.22 X 0.61': { brand: 'StoneFlex', line: 'Pizarra' },
  'KUND MULTY 1.22 X 0.61': { brand: 'StoneFlex', line: 'Pizarra' },
  'TAN 1.22 X 0.61': { brand: 'StoneFlex', line: 'Pizarra' },
  'INDIAN AUTUMN 1.22 X 0.61': { brand: 'StoneFlex', line: 'Pizarra' },
  'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': { brand: 'StoneFlex', line: 'Translucida' },
  'BURNING FOREST 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'COPPER 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'JEERA GREEN 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'SILVER SHINE 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'SILVER SHINE GOLD 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'STEEL GRAY 1.22 X 0.61': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'CARRARA 1.22 X 0.61': { brand: 'StoneFlex', line: 'Mármol' },
  'CRYSTAL WHITE 1.22 X 0.61': { brand: 'StoneFlex', line: 'Mármol' },
  'HIMALAYA GOLD 1.22X0.61 MTS': { brand: 'StoneFlex', line: 'Mármol' },
  'MINT WHITE 1.22 X 0.61': { brand: 'StoneFlex', line: 'Mármol' },
  'CONCRETO BLANCO 1.22 X 0.61': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETO GRIS 1.22 X 0.61': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETE WITH HOLES 1.22 X 0.61': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETO GRIS MEDIUM 1.22 X 0.61': { brand: 'StoneFlex', line: 'Concreto' },
  'CORTEN STELL - 2.44 X 0.61': { brand: 'StoneFlex', line: 'Metales' },
  'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': { brand: 'StoneFlex', line: 'Metales' },
  'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': { brand: 'StoneFlex', line: 'Metales' },
  'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': { brand: 'StoneFlex', line: 'Metales' },
  'MADERA NOGAL 0.15 X 2.44 MTS': { brand: 'StoneFlex', line: 'Madera' },
  'MADERA TEKA 0.15 X 2.44 MTS': { brand: 'StoneFlex', line: 'Madera' },
  'MADERA ÉBANO 0.15 X 2.44 MTS': { brand: 'StoneFlex', line: 'Madera' },
  '3D ADHESIVO - 0,90 M2 - BLACK': { brand: 'StoneFlex', line: '3D' },
  '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { brand: 'StoneFlex', line: '3D' },
  '3D ADHESIVO - 0,90 M2 - TAN': { brand: 'StoneFlex', line: '3D' },
  'BLACK 2.44 X 1.22': { brand: 'StoneFlex', line: 'Pizarra' },
  'TAN 2.44 X 1.22': { brand: 'StoneFlex', line: 'Pizarra' },
  'kUND MULTY 2.44 X 1.22': { brand: 'StoneFlex', line: 'Pizarra' },
  'INDIAN AUTUMN 2.44 X 1.22': { brand: 'StoneFlex', line: 'Pizarra' },
  'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': { brand: 'StoneFlex', line: 'Translucida' },
  'COPPER 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'BURNING FOREST 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'JEERA GREEN 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'SILVER SHINE 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'SILVER SHINE GOLD 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'STEEL GREY 2.44 X 1.22': { brand: 'StoneFlex', line: 'Cuarcitas' },
  'CONCRETO BLANCO 2.44 X 1.22': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETO GRIS 2.44 X 1.22': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETO MEDIO 2.44 X 1.22': { brand: 'StoneFlex', line: 'Concreto' },
  'CONCRETO WITH HOLES 2.44 X 1.22': { brand: 'StoneFlex', line: 'Concreto' },
  'CARRARA 2.44 X 1.22': { brand: 'StoneFlex', line: 'Mármol' },
  'CRYSTAL WHITE 2.44 X 1.22': { brand: 'StoneFlex', line: 'Mármol' },
  'HIMALAYA GOLD 2.44 X 1.22': { brand: 'StoneFlex', line: 'Mármol' },
  'CORTEN STEEL 2.44 X 1.22': { brand: 'StoneFlex', line: 'Metales' },
};


const allReferences = Object.keys(referenceDetails);

const supplies = [
  'Adhesivo',
  'ADHESIVO TRASLUCIDO',
  'SELLANTE SEMI - BRIGHT GALON',
  'SELLANTE SEMI - BRIGTH 1/ 4 GALON',
  'SELLANTE SHYNY GALON',
  'SELLANTE SHYNY 1/4 GALON',
];

const IVA_RATE = 0.19; // 19%

type SealantType = 'SELLANTE SEMI - BRIGHT GALON' | 'SELLANTE SEMI - BRIGTH 1/ 4 GALON' | 'SELLANTE SHYNY GALON' | 'SELLANTE SHYNY 1/4 GALON';

interface QuoteItem {
  id: number;
  reference: string;
  sqMeters: number;
  sheets: number;
  calculationMode: 'sqm' | 'sheets' | 'units';
  pricePerSheet: number;
}

const sealantPerformance = {
    'SELLANTE SEMI - BRIGHT GALON': { clay: 40, other: 60 },
    'SELLANTE SEMI - BRIGTH 1/ 4 GALON': { clay: 10, other: 18 },
    'SELLANTE SHYNY GALON': { clay: 40, other: 60 },
    'SELLANTE SHYNY 1/4 GALON': { clay: 10, other: 18 },
};

// Base64 encoded logo image
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAASFBMVEX///8BAQEAAAACAgIDAwMMDAwNDQ0GBgb6+voUFBQICAgRERH29vYKCgrz8/M5OTkSEhJra2tra2uSkpKUlJRhYWFgYGC8vLzAwMA+Pj5BcknJAAABVElEQVR4nO3ciW7CMBAAUZIkIQuz+/9/b4w0KzQ0F2c6M+k0aPjOL0k2CTKyLAAAAAAAAAAAAAAAAMC/NRs68n4cW012s7G4ZJumtVp+tNVsS90rVlT3Kn+XJvQp/1T+LJ271C8tP6v8WVzTKn+Wzpyqf1k+3bT6z7LdNo/rb1bUN+vjW9b4R8c5r8s82Wj1j5n1/PjHh3l89a/n8R3rfzTGo/u87cCi/o8d8/jGx8eXv1/e3/37+4k/L/87v/rv8fM+b+fxz39e3vr7+vj6uTz+o8/jJ3z+eHzp98v7d/+/fh+/bPP3/P2/z1/8vX7/+/v43/L3y/8u/8/xL9t+sPZf+e/1v+S3/1p/+/u5PO+zx9u/d/3t+vv3/Pl3+/eX/z7//f36/c2/f5s/AAAAAAAAAAAAAADAx/0BNBbo1P8p0oEAAAAASUVORK5CYII=';

function AdhesiveReferenceTable() {
    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Tabla de Referencia de Insumos</DialogTitle>
                <CardDescription>Rendimiento de sellante por tipo de referencia y envase.</CardDescription>
            </DialogHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sellante</TableHead>
                        <TableHead>Rendimiento (Otras Ref.)</TableHead>
                        <TableHead>Rendimiento (Línea Clay)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow>
                        <TableCell>Semi-Brillante (Galón)</TableCell>
                        <TableCell>60 M²</TableCell>
                        <TableCell>40 M²</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Semi-Brillante (1/4 Galón)</TableCell>
                        <TableCell>18 M²</TableCell>
                        <TableCell>10 M²</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>Brillante (Galón)</TableCell>
                        <TableCell>60 M²</TableCell>
                         <TableCell>40 M²</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>Brillante (1/4 Galón)</TableCell>
                        <TableCell>18 M²</TableCell>
                         <TableCell>10 M²</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </DialogContent>
    );
}

export default function StoneflexCalculatorPage() {
  const searchParams = useSearchParams();
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [sqMeters, setSqMeters] = useState<number | string>(1);
  const [sheets, setSheets] = useState<number | string>(1);
  const [discount, setDiscount] = useState<number | string>(0);
  const [wastePercentage, setWastePercentage] = useState<number | string>(0);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [includeSealant, setIncludeSealant] = useState(true);
  const [sealantType, setSealantType] = useState<SealantType>('SELLANTE SEMI - BRIGTH 1/ 4 GALON');
  const [calculationMode, setCalculationMode] = useState<'sqm' | 'sheets'>('sqm');
  const [laborCost, setLaborCost] = useState(0);
  const [transportationCost, setTransportationCost] = useState(0);
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [trm, setTrm] = useState<number | string>('');
  const [trmLoading, setTrmLoading] = useState(false);
  const { toast } = useToast();

  const [supplyReference, setSupplyReference] = useState('');
  const [supplyUnits, setSupplyUnits] = useState<number | string>(1);
  const [notes, setNotes] = useState('');

  const referenceOptions = useMemo(() => {
    return allReferences.map(ref => ({ value: ref, label: ref }));
  }, []);

  const supplyOptions = useMemo(() => {
    return supplies.map(ref => ({ value: ref, label: ref }));
  }, []);

  useEffect(() => {
    const customerNameParam = searchParams.get('customerName');
    if (customerNameParam) {
        setCustomerName(decodeURIComponent(customerNameParam));
    }
  }, [searchParams]);

  const fetchTrm = async () => {
    setTrmLoading(true);
    const result = await getExchangeRate();
    if (result.rate) {
      setTrm(result.rate.toFixed(2));
    } else if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setTrmLoading(false);
  };

  useEffect(() => {
    if (currency === 'USD' && trm === '') {
      fetchTrm();
    }
  }, [currency]);


  const getSqmPerSheet = (ref: string) => {
    if (!ref) return 0;
    if (ref.includes('1.22 X 0.61') || ref.includes('1.22X0.61')) return 0.7442;
    if (ref.includes('1.20*0.60')) return 0.72;
    if (ref.includes('2.44 X 1.22')) return 2.9768;
    if (ref.includes('0.15 X 2.44')) return 0.366;
    if (ref.includes('0,90 M2')) return 0.9;
    if (ref.includes('2.44 X 0.61')) return 1.4884;
    if (ref.includes('2.95*1.20')) return 3.54;
    if (ref.includes('2.90*0.56')) return 1.624;
    return 1; // Default
  }
  
  const getSheetDimensions = (ref: string) => {
    if (!ref) return "N/A";
    if (ref.includes('1.22 X 0.61') || ref.includes('1.22X0.61')) return "1.22 x 0.61 Mts";
    if (ref.includes('1.20*0.60')) return "1.20 x 0.60 Mts";
    if (ref.includes('2.44 X 1.22')) return "2.44 x 1.22 Mts";
    if (ref.includes('0.15 X 2.44')) return "0.15 x 2.44 Mts";
    if (ref.includes('0,90 M2')) return "N/A (Caja 0.90 M²)";
    if (ref.includes('2.44 X 0.61')) return "2.44 x 0.61 Mts";
    if (ref.includes('2.95*1.20')) return "2.95 x 1.20 Mts";
    if (ref.includes('2.90*0.56')) return "2.90 x 0.56 Mts";
    return "No especificadas";
  }
  
  const parseDecimal = (value: string | number) => {
    if (typeof value === 'number') return value;
    return parseFloat(value.toString().replace(',', '.')) || 0;
  };

  const handleAddProduct = () => {
    if (!reference) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione una referencia.' });
        return;
    }
    
    const wasteValue = parseDecimal(wastePercentage);
    
    const sqmPerSheet = getSqmPerSheet(reference);
    const wasteFactor = 1 + wasteValue / 100;
    
    let baseSqm = 0;
    let baseSheets = 0;

    if (calculationMode === 'sqm') {
      baseSqm = parseDecimal(sqMeters);
      if (sqmPerSheet > 0) {
        baseSheets = Math.ceil(baseSqm / sqmPerSheet);
      }
    } else {
      baseSheets = Math.ceil(parseDecimal(sheets));
      baseSqm = baseSheets * sqmPerSheet;
    }

    const finalSqm = baseSqm * wasteFactor;
    const finalSheets = sqmPerSheet > 0 ? Math.ceil(finalSqm / sqmPerSheet) : baseSheets;

    const pricePerSheet = productPrices[reference] || 0;

    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      sqMeters: finalSqm,
      sheets: finalSheets,
      calculationMode,
      pricePerSheet
    };

    setQuoteItems([...quoteItems, newItem]);
  };
  
  const handleAddSupply = () => {
    const units = Number(supplyUnits);
    if (!supplyReference || units <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Seleccione un insumo y una cantidad válida.' });
        return;
    }

    const newItem: QuoteItem = {
      id: Date.now(),
      reference: supplyReference,
      sqMeters: 0,
      sheets: units,
      calculationMode: 'units',
      pricePerSheet: productPrices[supplyReference] || 0
    };
    
    setQuoteItems([...quoteItems, newItem]);
    setSupplyReference('');
    setSupplyUnits(1);
  };


  const handleRemoveProduct = (id: number) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => {
    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const handleItemPriceChange = (id: number, newPricePerSheet: number) => {
    setQuoteItems(quoteItems.map(item => item.id === id ? { ...item, pricePerSheet: newPricePerSheet } : item));
  };

  const calculateQuote = () => {
    let totalProductCost = 0;
    let totalStandardAdhesiveUnits = 0;
    let totalTranslucentAdhesiveUnits = 0;
    let totalSqMetersForSealantClay = 0;
    let totalSqMetersForSealantOther = 0;
    let isWarrantyVoid = false;
    let manualSuppliesCost = 0;

    const trmValue = currency === 'USD' ? parseDecimal(trm) : 1;
    if (currency === 'USD' && trmValue === 0) return null;
    
    const convert = (value: number) => currency === 'USD' ? value / trmValue : value;
    const discountValue = parseDecimal(discount);
    
    const adhesivePriceCOP = productPrices['Adhesivo'] || 0;
    const translucentAdhesivePriceCOP = productPrices['ADHESIVO TRASLUCIDO'] || 0;

    const detailedItems = quoteItems.map(item => {
      const details = referenceDetails[item.reference];
      
      if (item.calculationMode === 'units') { // Manual Supply
          const itemCost = convert(item.pricePerSheet * item.sheets);
          manualSuppliesCost += itemCost;
          return {...item, itemTotal: itemCost, pricePerSheet: convert(item.pricePerSheet)};
      }

      if (!details) return {...item, itemTotal: 0, pricePerSheet: 0};

      const calculatedSheets = item.sheets;
      const pricePerSheetCOP = item.pricePerSheet;
      const productCost = convert(pricePerSheetCOP * calculatedSheets);
      
      totalProductCost += productCost;

      // Add SqMeters to correct sealant group
      if (details.line === 'Clay') {
          totalSqMetersForSealantClay += item.sqMeters;
      } else {
          totalSqMetersForSealantOther += item.sqMeters;
      }
      
      if (includeAdhesive && details.line !== '3D') {
          let adhesivePerSheet = 0;
          const isStandardSize = item.reference.includes('1.22 X 0.61') || item.reference.includes('1.20*0.60');
          const isMetalStandardSize = item.reference.includes('2.44 X 0.61');
          const isXLSize = item.reference.includes('2.44 X 1.22') || item.reference.includes('2.95*1.20') || item.reference.includes('2.90*0.56');
          const isWoodSize = item.reference.includes('0.15 X 2.44');

          if (details.line === 'Translúcida') {
              adhesivePerSheet = isStandardSize ? 0.5 : 2;
              totalTranslucentAdhesiveUnits += calculatedSheets * adhesivePerSheet;
          } else {
              if (details.line === 'Pizarra' || details.line === 'Cuarcitas' || (details.line === 'Mármol' && !item.reference.includes('HIMALAYA')) || details.line === 'Clay') {
                  adhesivePerSheet = isStandardSize ? 0.5 : 2;
              } else if (details.line === 'Mármol' && item.reference.includes('HIMALAYA')) {
                  adhesivePerSheet = isStandardSize ? 1.5 : 3.5;
              } else if (details.line === 'Concreto') {
                  adhesivePerSheet = isStandardSize ? 1.8 : 3;
              } else if (details.line === 'Metales') {
                  adhesivePerSheet = isMetalStandardSize ? 1.5 : 3;
              } else if (details.line === 'Madera') {
                  adhesivePerSheet = isWoodSize ? 0.5 : 0;
              }
              totalStandardAdhesiveUnits += calculatedSheets * adhesivePerSheet;
          }
      }
      
      if (!includeAdhesive) {
        isWarrantyVoid = true;
      }
      
      const itemSubtotal = productCost;

      return {...item, itemTotal: itemSubtotal, pricePerSheet: convert(pricePerSheetCOP)};
    });
    
    // Adhesive Cost Calculation
    const totalStandardAdhesiveCost = convert(Math.ceil(totalStandardAdhesiveUnits) * adhesivePriceCOP);
    const totalTranslucentAdhesiveCost = convert(Math.ceil(totalTranslucentAdhesiveUnits) * translucentAdhesivePriceCOP);

    // Sealant Cost Calculation
    let totalSealantUnits = 0;
    let totalSealantCost = 0;
    let sealantPriceCOP = 0;
    if (includeSealant) {
        sealantPriceCOP = productPrices[sealantType] || 0;
        const perf = sealantPerformance[sealantType];
        
        const unitsForClay = totalSqMetersForSealantClay > 0 ? Math.ceil(totalSqMetersForSealantClay / perf.clay) : 0;
        const unitsForOther = totalSqMetersForSealantOther > 0 ? Math.ceil(totalSqMetersForSealantOther / perf.other) : 0;

        totalSealantUnits = unitsForClay + unitsForOther;
        totalSealantCost = convert(totalSealantUnits * sealantPriceCOP);
    }


    const subtotalBeforeDiscount = totalProductCost + totalStandardAdhesiveCost + totalTranslucentAdhesiveCost + totalSealantCost + manualSuppliesCost;
    const totalDiscountAmount = subtotalBeforeDiscount * (discountValue / 100);
    const subtotalBeforeIva = subtotalBeforeDiscount - totalDiscountAmount;
    const ivaAmount = subtotalBeforeIva * IVA_RATE;
    const finalLaborCost = convert(laborCost);
    const finalTransportationCost = convert(transportationCost);
    const totalCost = subtotalBeforeIva + ivaAmount + finalLaborCost + finalTransportationCost;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    return {
      items: detailedItems,
      totalProductCost,
      totalStandardAdhesiveCost,
      totalTranslucentAdhesiveCost,
      totalSealantCost,
      sealantPrice: convert(sealantPriceCOP),
      totalSealantUnits,
      manualSuppliesCost,
      adhesivePrice: convert(adhesivePriceCOP),
      translucentAdhesivePrice: convert(translucentAdhesivePriceCOP),
      totalDiscountAmount,
      totalStandardAdhesiveUnits: Math.ceil(totalStandardAdhesiveUnits),
      totalTranslucentAdhesiveUnits: Math.ceil(totalTranslucentAdhesiveUnits),
      isWarrantyVoid,
      subtotal: subtotalBeforeIva,
      ivaAmount,
      totalCost,
      laborCost: finalLaborCost,
      transportationCost: finalTransportationCost,
      creationDate: creationDate,
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    };
  };

  const quote = quoteItems.length > 0 ? calculateQuote() : null;

  const handleDownloadPdf = async () => {
    if (!quote) return;
    const doc = new jsPDF();
    
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Header
    doc.addImage(logoBase64, 'PNG', 14, 15, 40, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LATIN STORE HOUSE S.A.S.', pageWidth - 14, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('NIT.: 900493221-0', pageWidth - 14, 25, { align: 'right' });
    doc.text('CRA 59D 131 38', pageWidth - 14, 30, { align: 'right' });
    doc.text('BOGOTA D.C. - COLOMBIA', pageWidth - 14, 35, { align: 'right' });

    const dateText = `Bogota D.C., ${quote.creationDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.text(dateText, 14, 45);

    // Client and quote info
    let startY = 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización StoneFlex', 14, startY);
    startY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${customerName || 'N/A'}`, 14, startY);
    doc.text(`Válida hasta: ${quote.expiryDate}`, pageWidth - 14, startY, { align: 'right' });
    startY += 5;
    doc.text(`Moneda: ${currency}`, 14, startY);

    const head = [['Item', 'Cantidad', 'Precio Unit.', 'Subtotal']];
    const body: any[][] = [];

    quote.items.forEach(item => {
        const title = item.calculationMode === 'units' ? item.reference : `${item.reference} (${item.sqMeters.toFixed(2)} M²)`;
        const qty = item.sheets;
        const price = formatCurrency(item.pricePerSheet);
        const total = formatCurrency(item.itemTotal);
        body.push([title, qty, price, total]);
    });
    
    if (quote.totalStandardAdhesiveCost > 0) {
        body.push(['Adhesivo (Estándar)', quote.totalStandardAdhesiveUnits, formatCurrency(quote.adhesivePrice), formatCurrency(quote.totalStandardAdhesiveCost)]);
    }
    if (quote.totalTranslucentAdhesiveCost > 0) {
        body.push(['Adhesivo (Translúcido)', quote.totalTranslucentAdhesiveUnits, formatCurrency(quote.translucentAdhesivePrice), formatCurrency(quote.totalTranslucentAdhesiveCost)]);
    }
    if (quote.totalSealantCost > 0) {
        body.push([`Sellante (${sealantType.split('SELLANTE ')[1]})`, quote.totalSealantUnits, formatCurrency(quote.sealantPrice), formatCurrency(quote.totalSealantCost)]);
    }
    
    doc.autoTable({
        startY: startY + 5,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [41, 171, 226] }
    });
    
    let finalY = (doc as any).autoTable.previous.finalY;
    
    const summaryX = 14;
    let summaryY = finalY + 10;
    
    doc.setFontSize(10);
    if (quote.totalDiscountAmount > 0) {
        doc.text(`Subtotal Antes Descuento:`, summaryX, summaryY);
        doc.text(formatCurrency(quote.subtotal + quote.totalDiscountAmount), pageWidth - 14, summaryY, { align: 'right' });
        summaryY += 7;
        doc.text(`Descuento (${discount}%):`, summaryX, summaryY);
        doc.text(`-${formatCurrency(quote.totalDiscountAmount)}`, pageWidth - 14, summaryY, { align: 'right' });
        summaryY += 7;
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal:`, summaryX, summaryY);
    doc.text(formatCurrency(quote.subtotal), pageWidth - 14, summaryY, { align: 'right' });
    summaryY += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`IVA (19%):`, summaryX, summaryY);
    doc.text(formatCurrency(quote.ivaAmount), pageWidth - 14, summaryY, { align: 'right' });
    summaryY += 7;

    if (quote.laborCost > 0) {
        doc.text(`Costo Mano de Obra:`, summaryX, summaryY);
        doc.text(formatCurrency(quote.laborCost), pageWidth - 14, summaryY, { align: 'right' });
        summaryY += 7;
    }
    if (quote.transportationCost > 0) {
        doc.text(`Costo Transporte:`, summaryX, summaryY);
        doc.text(formatCurrency(quote.transportationCost), pageWidth - 14, summaryY, { align: 'right' });
        summaryY += 7;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL A PAGAR (${currency}):`, summaryX, summaryY);
    doc.text(formatCurrency(quote.totalCost), pageWidth - 14, summaryY, { align: 'right' });
    summaryY += 10;

    if (notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notas Adicionales:', summaryX, summaryY);
        summaryY += 5;
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(notes, 180);
        doc.text(noteLines, summaryX, summaryY);
    }
    

    doc.save(`Cotizacion_${customerName || 'Cliente'}_Stoneflex.pdf`);
  };

  const handleExportXLSX = () => {
    if (!quote) return;

    const dataToExport = quote.items.map(item => ({
        'Referencia': item.reference,
        'Modo Cálculo': item.calculationMode,
        'M²': item.sqMeters > 0 ? item.sqMeters.toFixed(2) : '',
        'Láminas/Unidades': item.sheets,
        'Precio Unitario': formatCurrency(item.pricePerSheet),
        'Costo Total': formatCurrency(item.itemTotal)
    }));

    // Add supplies to the export
    if (quote.totalStandardAdhesiveCost > 0) {
        dataToExport.push({ 'Referencia': 'Adhesivo (Estándar)', 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.totalStandardAdhesiveUnits, 'Precio Unitario': formatCurrency(quote.adhesivePrice), 'Costo Total': formatCurrency(quote.totalStandardAdhesiveCost) });
    }
     if (quote.totalTranslucentAdhesiveCost > 0) {
        dataToExport.push({ 'Referencia': 'Adhesivo (Translúcido)', 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.totalTranslucentAdhesiveUnits, 'Precio Unitario': formatCurrency(quote.translucentAdhesivePrice), 'Costo Total': formatCurrency(quote.totalTranslucentAdhesiveCost) });
    }
     if (quote.totalSealantCost > 0) {
        dataToExport.push({ 'Referencia': `Sellante (${sealantType.split('SELLANTE ')[1]})`, 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.totalSealantUnits, 'Precio Unitario': formatCurrency(quote.sealantPrice), 'Costo Total': formatCurrency(quote.totalSealantCost) });
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Add summary
    const finalRow = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).e.r + 3 : dataToExport.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [['Subtotal', formatCurrency(quote.subtotal)]], { origin: `E${finalRow}` });
    XLSX.utils.sheet_add_aoa(ws, [['IVA (19%)', formatCurrency(quote.ivaAmount)]], { origin: `E${finalRow + 1}` });
    XLSX.utils.sheet_add_aoa(ws, [['Mano de Obra', formatCurrency(quote.laborCost)]], { origin: `E${finalRow + 2}` });
    XLSX.utils.sheet_add_aoa(ws, [['Transporte', formatCurrency(quote.transportationCost)]], { origin: `E${finalRow + 3}` });
    XLSX.utils.sheet_add_aoa(ws, [['TOTAL', formatCurrency(quote.totalCost)]], { origin: `E${finalRow + 4}` });


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cotizacion StoneFlex");
    XLSX.writeFile(wb, "Cotizacion_StoneFlex.xlsx");
    toast({ title: 'Éxito', description: 'Cotización exportada a Excel.' });
  };
  
  const handleShareOnWhatsApp = () => {
    if (!quote) return;

    let message = `*Cotización de Latin Store House*\n\n`;
    message += `*Cliente:* ${customerName || 'N/A'}\n`;
    message += `*Moneda:* ${currency}\n`;
    if (currency === 'USD') {
        message += `*TRM usada:* ${formatCurrency(parseDecimal(trm))}\n`;
    }
    message += `*Fecha de Cotización:* ${quote.creationDate.toLocaleDateString('es-CO')}\n`;
    message += `*Válida hasta:* ${quote.expiryDate}\n\n`;
    
    message += `*Resumen de Productos:*\n`;
    quote.items.forEach(item => {
      if (item.calculationMode !== 'units') {
          message += `- *${item.reference}*: ${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²)\n`;
      } else {
          message += `- *${item.reference}*: ${item.sheets} unidades\n`;
      }
    });
    
    message += `\n*Desglose de Costos (${currency}):*\n`;
    message += `- Subtotal Productos: ${formatCurrency(quote.totalProductCost)}\n`;
    if (quote.totalStandardAdhesiveCost > 0 && quote.totalStandardAdhesiveUnits > 0) {
        message += `- Costo Adhesivo (Estándar) (${quote.totalStandardAdhesiveUnits} u. @ ${formatCurrency(quote.adhesivePrice)}/u.): ${formatCurrency(quote.totalStandardAdhesiveCost)}\n`;
    }
    if (quote.totalTranslucentAdhesiveCost > 0 && quote.totalTranslucentAdhesiveUnits > 0) {
        message += `- Adhesivo Translúcido (${quote.totalTranslucentAdhesiveUnits} u. @ ${formatCurrency(quote.translucentAdhesivePrice)}/u.): ${formatCurrency(quote.totalTranslucentAdhesiveCost)}\n`;
    }
    if (quote.totalSealantCost > 0 && quote.totalSealantUnits > 0) {
        message += `- Sellante (${sealantType.split('SELLANTE ')[1]}) (${quote.totalSealantUnits} u. @ ${formatCurrency(quote.sealantPrice)}/u.): ${formatCurrency(quote.totalSealantCost)}\n`;
    }
     if (quote.manualSuppliesCost > 0) {
        message += `- Insumos Adicionales: ${formatCurrency(quote.manualSuppliesCost)}\n`;
    }

    if (quote.totalDiscountAmount > 0) {
        message += `- Descuento Total: -${formatCurrency(quote.totalDiscountAmount)}\n`;
    }
    message += `- *Subtotal:* ${formatCurrency(quote.subtotal)}\n`;
    message += `- IVA (19%): ${formatCurrency(quote.ivaAmount)}\n`;
     if (quote.laborCost > 0) {
        message += `- Costo Mano de Obra: ${formatCurrency(quote.laborCost)}\n`;
    }
    if (quote.transportationCost > 0) {
        message += `- Costo Transporte: ${formatCurrency(quote.transportationCost)}\n`;
    }
    message += `\n*Total Estimado: ${formatCurrency(quote.totalCost)}*\n\n`;
    
    if (notes) {
        message += `*Notas Adicionales:*\n${notes}\n\n`;
    }

    if (quote.isWarrantyVoid) {
        message += `*Nota Importante:* La no inclusión de adhesivo puede anular la garantía del producto.\n`;
    }
    message += `_Esta es una cotización preliminar realizada sin confirmación de medidas y el costo final puede variar. No incluye costos de instalación si no se especifica._`;

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
  
  const handleCurrencyInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = Number(value.replace(/[^0-9]/g, ''));
    setter(numericValue);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Cotizaciones - StoneFlex</CardTitle>
        <CardDescription>
          Añada productos y estime el costo total de la cotización.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
                <Label htmlFor="customer-name">Nombre del Cliente (Opcional)</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ingrese el nombre del cliente..."
                />
            </div>
            <div className="space-y-2">
                <Label>Moneda de la Cotización</Label>
                <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'COP' | 'USD')} className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="COP" id="currency-cop" />
                    <Label htmlFor="currency-cop">COP</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USD" id="currency-usd" />
                    <Label htmlFor="currency-usd">USD</Label>
                  </div>
                </RadioGroup>
            </div>
            
         </div>
         {currency === 'USD' && (
             <div className="space-y-2 max-w-sm">
                <Label htmlFor="trm-input">Tasa de Cambio (TRM)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="trm-input"
                    type="text"
                    value={trm}
                    onChange={handleDecimalInputChange(setTrm)}
                    className="w-full"
                    placeholder={trmLoading ? 'Cargando...' : ''}
                  />
                </div>
             </div>
        )}
         <Separator />
         <div>
            <h3 className="text-lg font-medium">Añadir Producto StoneFlex</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                     {reference && (
                        <div className="text-sm text-muted-foreground pt-1">
                            <span className="font-medium">Medidas:</span> {getSheetDimensions(reference)} | <span className="font-medium">M² por Lámina:</span> {getSqmPerSheet(reference).toFixed(2)} M²
                        </div>
                     )}
                 </div>
                 <div className="space-y-2">
                    <Label>Calcular por</Label>
                    <RadioGroup defaultValue="sqm" value={calculationMode} onValueChange={(value) => setCalculationMode(value as 'sqm' | 'sheets')} className="flex gap-4 pt-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                      type="text"
                      value={sheets}
                      onChange={(e) => setSheets(e.target.value)}
                      className="w-full"
                      min="1"
                    />
                  </div>
                )}
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
              </div>
              <div className="flex justify-end">
                  <Button onClick={handleAddProduct} className="mt-4" disabled={!reference}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </div>
         </div>

         <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4">Insumos y Accesorios</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                    <Checkbox id="include-adhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))} />
                    <Label htmlFor="include-adhesive">Incluir Adhesivo (Automático)</Label>
                </div>
                <div className="flex items-center space-x-2 flex-1">
                    <Checkbox id="include-sealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))} />
                    <Label htmlFor="include-sealant">Incluir Sellante (Automático)</Label>
                </div>
            </div>
            {includeSealant && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="sealant-type">Tipo de Sellante</Label>
                        <Select value={sealantType} onValueChange={(value) => setSealantType(value as SealantType)}>
                            <SelectTrigger id="sealant-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SELLANTE SEMI - BRIGTH 1/ 4 GALON">Semi-Brillante (1/4 Galón)</SelectItem>
                                <SelectItem value="SELLANTE SEMI - BRIGHT GALON">Semi-Brillante (Galón)</SelectItem>
                                <SelectItem value="SELLANTE SHYNY 1/4 GALON">Brillante (1/4 Galón)</SelectItem>
                                <SelectItem value="SELLANTE SHYNY GALON">Brillante (Galón)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Ver Tabla de Rendimiento
                            </Button>
                        </DialogTrigger>
                        <AdhesiveReferenceTable />
                    </Dialog>
                </div>
            )}
             <Separator className="my-6" />
             <h4 className="text-md font-medium mb-4">Insumos y Accesorios Adicionales</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                   <Label>Insumo</Label>
                   <Combobox
                     options={supplyOptions}
                     value={supplyReference}
                     onValueChange={setSupplyReference}
                     placeholder="Seleccione un insumo"
                     searchPlaceholder="Buscar insumo..."
                     emptyPlaceholder="No se encontraron insumos."
                   />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="supply-units-input">Cantidad (Unidades)</Label>
                    <Input
                      id="supply-units-input"
                      type="number"
                      value={supplyUnits}
                      onChange={(e) => setSupplyUnits(e.target.value)}
                      className="w-full"
                      min="1"
                    />
                  </div>
                  <Button onClick={handleAddSupply} disabled={!supplyReference}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Insumo
                  </Button>
              </div>
          </div>
         
         {quote && (
          <Card className="bg-primary/5 mt-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Resumen de la Cotización</CardTitle>
                      <CardDescription>
                          Cliente: {customerName || 'N/A'} | Válida hasta {quote.expiryDate} | Moneda: {currency}
                      </CardDescription>
                  </div>
                  <div className="text-right">
                      <div className="relative h-10 w-32 mb-2">
                          <Image src="https://www.latinstorehouse.com/wp-content/uploads/2021/02/LATIN-STORE-HOUSE.png" alt="Latin Store House" fill style={{ objectFit: 'contain' }} />
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
                        {item.calculationMode !== 'units' ? 
                            `${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²)` : 
                            `${item.sheets} unidades`
                        }
                      </p>
                       <p className="text-sm text-muted-foreground font-medium">
                        Precio/Unidad: {formatCurrency(item.pricePerSheet)}
                      </p>
                      {currency !== 'USD' && item.calculationMode !== 'units' && (
                         <div className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`price-${item.id}`} className="text-xs">Precio/Lámina (COP)</Label>
                             <Input 
                                id={`price-${item.id}`}
                                type="text"
                                value={new Intl.NumberFormat('es-CO').format(productPrices[item.reference] || 0)}
                                onChange={(e) => handleItemPriceChange(item.id, parseDecimal(e.target.value.replace(/[^0-9]/g, '')))}
                                className="h-7 w-28"
                            />
                         </div>
                      )}
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.itemTotal)}</p>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)} className="mt-1 h-7 w-7">
                           <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal Productos</span>
                  <span>{formatCurrency(quote.totalProductCost)}</span>
                </div>
                 {quote.totalStandardAdhesiveCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Adhesivo (Estándar) ({quote.totalStandardAdhesiveUnits} u. @ {formatCurrency(quote.adhesivePrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalStandardAdhesiveCost)}</span>
                    </div>
                 )}
                 {quote.totalTranslucentAdhesiveCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Adhesivo (Translúcido) ({quote.totalTranslucentAdhesiveUnits} u. @ {formatCurrency(quote.translucentAdhesivePrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalTranslucentAdhesiveCost)}</span>
                    </div>
                 )}
                 {quote.totalSealantCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Sellante ({sealantType.split('SELLANTE ')[1]}) ({quote.totalSealantUnits} u. @ {formatCurrency(quote.sealantPrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalSealantCost)}</span>
                    </div>
                 )}
                  {quote.manualSuppliesCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Insumos Adicionales</span>
                        <span>{formatCurrency(quote.manualSuppliesCost)}</span>
                    </div>
                  )}
                 <div className="flex justify-between text-red-500">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="discount-total" className="text-muted-foreground">Descuento Total (%)</Label>
                        <Input
                            id="discount-total"
                            type="text"
                            value={discount}
                            onChange={handleDecimalInputChange(setDiscount)}
                            className="w-20 h-7"
                        />
                    </div>
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
                  <Label htmlFor="labor-cost" className="text-muted-foreground">Costo Mano de Obra</Label>
                  <Input
                    id="labor-cost"
                    type="text"
                    value={formatCurrency(laborCost)}
                    onChange={(e) => handleCurrencyInputChange(setLaborCost)(e)}
                    className="w-32 h-8 text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="transport-cost" className="text-muted-foreground">Costo Transporte</Label>
                  <Input
                    id="transport-cost"
                    type="text"
                    value={formatCurrency(transportationCost)}
                    onChange={(e) => handleCurrencyInputChange(setTransportationCost)(e)}
                    className="w-32 h-8 text-right"
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

                <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Especifique cualquier detalle, condición o nota importante para esta cotización..."
                    />
                </div>

              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleDownloadPdf}>Descargar como PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportXLSX}>Descargar como XLSX</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    Esta es una cotización preliminar realizada sin confirmación de medidas y el costo final puede variar. No incluye costos de instalación si no se especifica.
                  </p>
                  {currency === 'USD' && (
                    <p className="font-semibold">
                      Nota: La TRM (Tasa Representativa del Mercado) puede variar diariamente, lo cual podría afectar el valor final de esta cotización al momento de la facturación.
                    </p>
                  )}
                  {quote.isWarrantyVoid && (
                    <p className="font-semibold text-destructive">
                      La no inclusión de adhesivo puede anular la garantía del producto.
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
