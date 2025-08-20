



'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download, RefreshCw, Loader2, HelpCircle } from 'lucide-react';
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


const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22.05.29.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
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
  includeSealant: boolean;
  includeAdhesive: boolean;
  calculationMode: 'sqm' | 'sheets' | 'units';
  pricePerSheet: number;
}

const adhesiveReferenceByLine: {
  line: string;
  items: {
    reference: string;
    standard: string;
    xl: string;
  }[];
}[] = [
  {
    line: 'Pizarra',
    items: [
      { reference: 'BLACK', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'KUND MULTY', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'TAN', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'INDIAN AUTUMN', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
    ]
  },
   {
    line: 'Cuarcitas',
    items: [
      { reference: 'BURNING FOREST', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'COPPER', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'JEERA GREEN', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'SILVER SHINE', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'SILVER SHINE GOLD', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'STEEL GRAY', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
    ]
  },
   {
    line: 'Mármol',
    items: [
      { reference: 'CARRARA', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'CRYSTAL WHITE', standard: '1.22x0.61 - 0.5u', xl: '2.44x1.22 - 2u' },
      { reference: 'MINT WHITE', standard: '1.22x0.61 - 0.5u', xl: 'N/A' },
      { reference: 'HIMALAYA GOLD', standard: '1.22x0.61 - 1.5u', xl: '2.44x1.22 - 3.5u' },
    ]
  },
  {
    line: 'Concreto',
    items: [
      { reference: 'CONCRETO BLANCO', standard: '1.20x0.60 - 1.8u', xl: '2.44x1.22 - 3u' },
      { reference: 'CONCRETO GRIS', standard: '1.20x0.60 - 1.8u', xl: '2.44x1.22 - 3u' },
      { reference: 'CONCRETE WITH HOLES', standard: '1.20x0.60 - 1.8u', xl: '2.44x1.22 - 3u' },
      { reference: 'CONCRETO GRIS MEDIUM', standard: '1.20x0.60 - 1.8u', xl: 'N/A' },
    ]
  },
  {
    line: 'Metales',
    items: [
       { reference: 'CORTEN STELL', standard: '2.44x0.61 - 1.5u', xl: '2.44x1.22 - 3u' },
       { reference: 'MURAL BLUE PATINA WITH COPPER', standard: '2.44x0.61 - 1.5u', xl: 'N/A' },
       { reference: 'MURAL WHITE WITH COPPER GOLD', standard: '2.44x0.61 - 1.5u', xl: 'N/A' },
       { reference: 'GATE TURQUOISE PATINA COPPER', standard: '2.44x0.61 - 1.5u', xl: 'N/A' },
    ]
  },
  {
    line: 'Madera',
    items: [
       { reference: 'MADERA NOGAL', standard: '0.15x2.44 - 0.5u', xl: 'N/A' },
       { reference: 'MADERA TEKA', standard: '0.15x2.44 - 0.5u', xl: 'N/A' },
       { reference: 'MADERA ÉBANO', standard: '0.15x2.44 - 0.5u', xl: 'N/A' },
    ]
  },
  {
    line: 'Translúcida',
    items: [
      { reference: 'INDIAN AUTUMN', standard: '1.22x0.61 - 0.5u (T)', xl: '2.44x1.22 - 2u (T)' },
    ]
  },
  {
    line: 'Clay',
    items: [
      { reference: 'CLAY CUT STONE', standard: '1.20x0.60 - 0.5u', xl: '' },
      { reference: 'CLAY TRAVERTINO', standard: '1.20x0.60 - 0.5u', xl: '' },
      { reference: 'CLAY TAPIA NEGRA', standard: '', xl: '2.95x1.20 - 2u' },
      { reference: 'CONCRETO ENCOFRADO', standard: '', xl: '2.90x0.56 - 2u' },
    ]
  }
];


function AdhesiveReferenceTable() {
    const [activeTab, setActiveTab] = useState(adhesiveReferenceByLine[0].line);

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Tabla de Referencia de Rendimiento de Adhesivo</DialogTitle>
                <CardDescription>Unidades de adhesivo recomendadas por cada lámina.</CardDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    {adhesiveReferenceByLine.map((lineData) => (
                        <TabsTrigger value={lineData.line} key={lineData.line}>{lineData.line}</TabsTrigger>
                    ))}
                </TabsList>
                {adhesiveReferenceByLine.map((lineData) => (
                    <TabsContent value={lineData.line} key={lineData.line}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referencias</TableHead>
                                    <TableHead>Medida y Rendimiento Estándar</TableHead>
                                    <TableHead>Medida y Rendimiento XL</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineData.items.map(item => (
                                    <TableRow key={item.reference}>
                                        <TableCell className="font-medium">{item.reference}</TableCell>
                                        <TableCell>{item.standard}</TableCell>
                                        <TableCell>{item.xl}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                ))}
            </Tabs>
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
  const [wastePercentage, setWastePercentage] = useState<number | string>(10);
  const [includeSealant, setIncludeSealant] = useState(true);
  const [sealantType, setSealantType] = useState<SealantType>('SELLANTE SEMI - BRIGTH 1/ 4 GALON');
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
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
      includeSealant,
      includeAdhesive,
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
      includeSealant: false,
      includeAdhesive: false,
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
    let totalSqMetersForSealant = 0;
    let totalStandardAdhesiveUnits = 0;
    let totalTranslucentAdhesiveUnits = 0;
    let isWarrantyVoid = false;
    let manualSuppliesCost = 0;

    const trmValue = currency === 'USD' ? parseDecimal(trm) : 1;
    if (currency === 'USD' && trmValue === 0) return null;
    
    const convert = (value: number) => currency === 'USD' ? value / trmValue : value;
    const discountValue = parseDecimal(discount);
    
    const sealantPricesCOP: Record<SealantType, number> = {
        'SELLANTE SEMI - BRIGHT GALON': productPrices['SELLANTE SEMI - BRIGHT GALON'] || 0,
        'SELLANTE SEMI - BRIGTH 1/ 4 GALON': productPrices['SELLANTE SEMI - BRIGTH 1/ 4 GALON'] || 0,
        'SELLANTE SHYNY GALON': productPrices['SELLANTE SHYNY GALON'] || 0,
        'SELLANTE SHYNY 1/4 GALON': productPrices['SELLANTE SHYNY 1/4 GALON'] || 0,
    };
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
      
      if (item.includeSealant) {
        totalSqMetersForSealant += item.sqMeters;
      }

      if (item.includeAdhesive && details.line !== '3D') {
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
      
      if (!item.includeSealant || !item.includeAdhesive) {
        isWarrantyVoid = true;
      }
      
      const itemSubtotal = productCost;

      return {...item, itemTotal: itemSubtotal, pricePerSheet: convert(pricePerSheetCOP)};
    });
    
    // Unified Sealant Calculation
    let totalSealantCost = 0;
    let totalSealantUnits = 0;
    if (includeSealant && totalSqMetersForSealant > 0) {
        let sealantYield = 15; // default for 1/4 gal
        if (sealantType.includes('GALON')) { 
          sealantYield = sealantType.includes('SHYNY') ? 40 : 60;
        } else { 
          sealantYield = sealantType.includes('SHYNY') ? 10 : 15;
        }
        totalSealantUnits = Math.ceil(totalSqMetersForSealant / sealantYield);
        totalSealantCost = convert(totalSealantUnits * sealantPricesCOP[sealantType]);
    }
    
    // Adhesive Cost Calculation
    const totalStandardAdhesiveCost = convert(Math.ceil(totalStandardAdhesiveUnits) * adhesivePriceCOP);
    const totalTranslucentAdhesiveCost = convert(Math.ceil(totalTranslucentAdhesiveUnits) * translucentAdhesivePriceCOP);


    const subtotalBeforeDiscount = totalProductCost + totalSealantCost + totalStandardAdhesiveCost + totalTranslucentAdhesiveCost + manualSuppliesCost;
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
      totalSealantCost,
      totalStandardAdhesiveCost,
      totalTranslucentAdhesiveCost,
      manualSuppliesCost,
      sealantPrice: convert(sealantPricesCOP[sealantType]),
      adhesivePrice: convert(adhesivePriceCOP),
      translucentAdhesivePrice: convert(translucentAdhesivePriceCOP),
      totalDiscountAmount,
      totalSealantUnits,
      totalStandardAdhesiveUnits: Math.ceil(totalStandardAdhesiveUnits),
      totalTranslucentAdhesiveUnits: Math.ceil(totalTranslucentAdhesiveUnits),
      isWarrantyVoid,
      subtotal: subtotalBeforeIva,
      ivaAmount,
      totalCost,
      laborCost: finalLaborCost,
      transportationCost: finalTransportationCost,
      creationDate: creationDate.toLocaleDateString('es-CO'),
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    };
  };

  const quote = quoteItems.length > 0 ? calculateQuote() : null;

  const handleDownloadPdf = async () => {
    if (!quote) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Latin Store House', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Cotización StoneFlex', 14, 30);

    doc.setFontSize(10);
    doc.text(`Cliente: ${customerName || 'N/A'}`, 14, 40);
    doc.text(`Válida hasta: ${quote.expiryDate}`, 14, 45);
    
    // ... rest of PDF generation ...
  };

  const handleShareOnWhatsApp = () => {
    if (!quote) return;

    let message = `*Cotización de Latin Store House*\n\n`;
    message += `*Cliente:* ${customerName || 'N/A'}\n`;
    message += `*Moneda:* ${currency}\n`;
    if (currency === 'USD') {
        message += `*TRM usada:* ${formatCurrency(parseDecimal(trm))}\n`;
    }
    message += `*Fecha de Cotización:* ${quote.creationDate}\n`;
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
    if(quote.totalSealantCost > 0 && quote.totalSealantUnits > 0) {
      const sealantUnitCost = quote.sealantPrice;
      message += `- Costo Sellante (${quote.totalSealantUnits} u. @ ${formatCurrency(sealantUnitCost)}/u.): ${formatCurrency(quote.totalSealantCost)}\n`;
    }
    if (quote.totalStandardAdhesiveCost > 0 && quote.totalStandardAdhesiveUnits > 0) {
        message += `- Costo Adhesivo (Estándar) (${quote.totalStandardAdhesiveUnits} u. @ ${formatCurrency(quote.adhesivePrice)}/u.): ${formatCurrency(quote.totalStandardAdhesiveCost)}\n`;
    }
    if (quote.totalTranslucentAdhesiveCost > 0 && quote.totalTranslucentAdhesiveUnits > 0) {
        message += `- Adhesivo Translúcido (${quote.totalTranslucentAdhesiveUnits} u. @ ${formatCurrency(quote.translucentAdhesivePrice)}/u.): ${formatCurrency(quote.totalTranslucentAdhesiveCost)}\n`;
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
        message += `*Nota Importante:* La no inclusión de sellante o adhesivo puede anular la garantía del producto.\n`;
    }
    message += `_Esta es una cotización preliminar y no incluye costos de instalación si no se especifica._`;

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
              <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-adhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))} />
                    <Label htmlFor="include-adhesive">Incluir Adhesivo (Automático)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-sealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))} />
                    <Label htmlFor="include-sealant">Incluir Sellante (Automático)</Label>
                  </div>
                  {includeSealant && (
                    <div className="w-64">
                       <Select value={sealantType} onValueChange={(value) => setSealantType(value as SealantType)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo de sellante" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SELLANTE SEMI - BRIGTH 1/ 4 GALON">Semi-Brillante (1/4 Gal)</SelectItem>
                            <SelectItem value="SELLANTE SEMI - BRIGHT GALON">Semi-Brillante (Galón)</SelectItem>
                            <SelectItem value="SELLANTE SHYNY 1/4 GALON">Brillante (1/4 Gal)</SelectItem>
                            <SelectItem value="SELLANTE SHYNY GALON">Brillante (Galón)</SelectItem>
                        </SelectContent>
                       </Select>
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Ver Tabla de Rendimiento de Adhesivo
                        </Button>
                    </DialogTrigger>
                    <AdhesiveReferenceTable />
                  </Dialog>
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
            <h3 className="text-lg font-medium mb-4">Insumos y Accesorios Adicionales</h3>
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
                          <Image src="https://www.latinstorehouse.com/wp-content/uploads/2025/08/Logo-Latin-Store-House-blanco.webp" alt="Latin Store House" fill style={{ objectFit: 'contain' }} />
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
                 {quote.totalSealantCost > 0 && quote.totalSealantUnits > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Sellante (${quote.totalSealantUnits} u. @ ${formatCurrency(quote.sealantPrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalSealantCost)}</span>
                    </div>
                )}
                 {quote.totalStandardAdhesiveCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Adhesivo (Estándar) (${quote.totalStandardAdhesiveUnits} u. @ ${formatCurrency(quote.adhesivePrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalStandardAdhesiveCost)}</span>
                    </div>
                 )}
                 {quote.totalTranslucentAdhesiveCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Adhesivo (Translúcido) (${quote.totalTranslucentAdhesiveUnits} u. @ ${formatCurrency(quote.translucentAdhesivePrice)}/u.)</span>
                        <span>{formatCurrency(quote.totalTranslucentAdhesiveCost)}</span>
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
                    <Button variant="outline" onClick={handleDownloadPdf}>
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
                    Esta es una cotización preliminar y no incluye costos de instalación si no se especifica.
                  </p>
                  {currency === 'USD' && (
                    <p className="font-semibold">
                      Nota: La TRM (Tasa Representativa del Mercado) puede variar diariamente, lo cual podría afectar el valor final de esta cotización al momento de la facturación.
                    </p>
                  )}
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




