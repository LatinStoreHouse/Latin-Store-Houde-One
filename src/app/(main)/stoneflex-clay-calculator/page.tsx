
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download, RefreshCw, Loader2 } from 'lucide-react';
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


const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
);


const referenceDetails: { [key: string]: { brand: string, line: string } } = {
  'CUT STONE 120 X 60': { brand: 'StoneFlex', line: 'Clay' },
  'TRAVERTINO': { brand: 'StoneFlex', line: 'Clay' },
  'CONCRETO ENCOFRADO': { brand: 'StoneFlex', line: 'Clay' },
  'TAPIA NEGRA': { brand: 'StoneFlex', line: 'Clay' },
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
  '3D ADHESIVO - 0,90 M2 - BLACK': { brand: 'StoneFlex', line: '3D autoadhesiva' },
  '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { brand: 'StoneFlex', line: '3D autoadhesiva' },
  '3D ADHESIVO - 0,90 M2 - TAN': { brand: 'StoneFlex', line: '3D autoadhesiva' },
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


const IVA_RATE = 0.19; // 19%

type SealantType = 'SELLANTE SEMI - BRIGHT GALON' | 'SELLANTE SEMI - BRIGTH 1/ 4 GALON' | 'SELLANTE SHYNY GALON' | 'SELLANTE SHYNY 1/4 GALON';

interface QuoteItem {
  id: number;
  reference: string;
  sqMeters: number;
  sheets: number;
  includeSealant: boolean;
  sealantType?: SealantType;
  includeAdhesive: boolean;
  calculationMode: 'sqm' | 'sheets';
  pricePerSheet: number;
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

  const referenceOptions = useMemo(() => {
    return allReferences.map(ref => ({ value: ref, label: ref }));
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
  
  const getSheetDimensions = (ref: string) => {
    if (!ref) return "N/A";
    if (ref.includes('1.22 X 0.61') || ref.includes('120 X 60') || ref.includes('1.22X0.61')) {
      return "1.22 x 0.61 Mts";
    } else if (ref.includes('2.44 X 1.22')) {
      return "2.44 x 1.22 Mts";
    } else if (ref.includes('0.15 X 2.44')) {
      return "0.15 x 2.44 Mts";
    } else if (ref.includes('0,90 M2')) {
      return "N/A (Caja 0.90 M²)";
    } else if (ref.includes('2.44 X 0.61')) {
        return "2.44 x 0.61 Mts";
    }
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
      baseSheets = Math.ceil(baseSqm / sqmPerSheet);
    } else {
      baseSheets = Math.ceil(parseDecimal(sheets));
      baseSqm = baseSheets * sqmPerSheet;
    }

    const finalSqm = baseSqm * wasteFactor;
    const finalSheets = Math.ceil(finalSqm / sqmPerSheet);

    const pricePerSheet = productPrices[reference] || 0;

    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      sqMeters: finalSqm,
      sheets: finalSheets,
      includeSealant,
      sealantType: includeSealant ? sealantType : undefined,
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
    let totalSealantCost = 0;
    let totalAdhesiveCost = 0;
    
    let totalSealantUnits = 0;
    let totalAdhesiveUnits = 0;
    let isWarrantyVoid = false;

    const trmValue = currency === 'USD' ? parseDecimal(trm) : 1;
    if (currency === 'USD' && trmValue === 0) return null;
    
    const convert = (value: number) => currency === 'USD' ? value / trmValue : value;
    const discountValue = parseDecimal(discount);
    
    const sealantPrices: Record<SealantType, number> = {
        'SELLANTE SEMI - BRIGHT GALON': convert(productPrices['SELLANTE SEMI - BRIGHT GALON'] || 0),
        'SELLANTE SEMI - BRIGTH 1/ 4 GALON': convert(productPrices['SELLANTE SEMI - BRIGTH 1/ 4 GALON'] || 0),
        'SELLANTE SHYNY GALON': convert(productPrices['SELLANTE SHYNY GALON'] || 0),
        'SELLANTE SHYNY 1/4 GALON': convert(productPrices['SELLANTE SHYNY 1/4 GALON'] || 0),
    };
    const adhesivePrice = convert(productPrices['Adhesivo'] || 0);
    const translucentAdhesivePrice = convert(productPrices['ADHESIVO TRASLUCIDO'] || 0);

    const detailedItems = quoteItems.map(item => {
      const details = referenceDetails[item.reference];
      if (!details) return {...item, itemTotal: 0, pricePerSheet: 0};

      const { brand, line } = details;
      const calculatedSqm = item.sqMeters;
      const calculatedSheets = item.sheets;
      
      const pricePerSheetCOP = item.pricePerSheet;
      const productCost = convert(pricePerSheetCOP * calculatedSheets);
      
      let itemSealantCost = 0;
      let calculatedSealantUnits = 0;
      if (item.includeSealant && item.sealantType) {
        let sealantYield = 15; // 1/4 gal default
        if (item.sealantType.includes('GALON')) { // SELLANTE SEMI - BRIGHT GALON or SELLANTE SHYNY GALON
          sealantYield = item.sealantType.includes('SHYNY') ? 40 : 60; // 40 for shiny, 60 for semi-bright
        } else { // 1/4 gal
          sealantYield = item.sealantType.includes('SHYNY') ? 10 : 15; // 10 for shiny, 15 for semi-bright
        }
        
        calculatedSealantUnits = Math.ceil(calculatedSqm / sealantYield);
        totalSealantUnits += calculatedSealantUnits;
        itemSealantCost = calculatedSealantUnits * sealantPrices[item.sealantType];
        totalSealantCost += itemSealantCost;
      }

      let itemAdhesiveCost = 0;
      let calculatedAdhesiveUnits = 0;
      if (item.includeAdhesive) {
        if(line === 'Translucida') {
           const adhesiveYield = 2.5; // m2 per tube
           calculatedAdhesiveUnits = Math.ceil(calculatedSqm / adhesiveYield);
           totalAdhesiveUnits += calculatedAdhesiveUnits;
           itemAdhesiveCost = calculatedAdhesiveUnits * translucentAdhesivePrice;
        } else {
           const adhesiveYield = 1.2; // m2 per tube
           calculatedAdhesiveUnits = Math.ceil(calculatedSqm / adhesiveYield);
           totalAdhesiveUnits += calculatedAdhesiveUnits;
           itemAdhesiveCost = calculatedAdhesiveUnits * adhesivePrice;
        }
        totalAdhesiveCost += itemAdhesiveCost;
      }
      
      totalProductCost += productCost;
      
      if (!item.includeSealant || !item.includeAdhesive) {
        isWarrantyVoid = true;
      }
      
      const itemSubtotal = productCost + itemSealantCost + itemAdhesiveCost;

      return {...item, itemTotal: itemSubtotal, pricePerSheet: convert(pricePerSheetCOP)};
    });
    
    const subtotalBeforeDiscount = totalProductCost + totalSealantCost + totalAdhesiveCost;
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
      totalAdhesiveCost,
      sealantPrices,
      adhesivePrice: adhesivePrice,
      translucentAdhesivePrice: translucentAdhesivePrice,
      totalDiscountAmount,
      totalSealantUnits,
      totalAdhesiveUnits,
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
      message += `- *${item.reference}*: ${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²)\n`;
    });
    
    message += `\n*Desglose de Costos (${currency}):*\n`;
    message += `- Subtotal Productos: ${formatCurrency(quote.totalProductCost)}\n`;
    if(quote.totalSealantCost > 0) {
      const sealantUnitCost = quote.totalSealantCost / quote.totalSealantUnits;
      message += `- Costo Sellante (${quote.totalSealantUnits} u. @ ${formatCurrency(sealantUnitCost)}/u.): ${formatCurrency(quote.totalSealantCost)}\n`;
    }
    if(quote.totalAdhesiveCost > 0) {
       const isTranslucent = quote.items.some(item => referenceDetails[item.reference]?.line === 'Translucida' && item.includeAdhesive);
       const adhesiveUnitCost = isTranslucent ? quote.translucentAdhesivePrice : quote.adhesivePrice;
       message += `- Costo Adhesivo (${quote.totalAdhesiveUnits} u. @ ${formatCurrency(adhesiveUnitCost)}/u.): ${formatCurrency(quote.totalAdhesiveCost)}\n`;
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
                    disabled={trmLoading}
                  />
                  <Button onClick={fetchTrm} disabled={trmLoading} size="icon" variant="outline">
                    {trmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
             </div>
        )}
         <Separator />
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
                  type="text"
                  value={sheets}
                  onChange={(e) => setSheets(e.target.value)}
                  className="w-full"
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
          <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="include-adhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))} />
                <Label htmlFor="include-adhesive">Incluir Adhesivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="include-sealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))} />
                <Label htmlFor="include-sealant">Incluir Sellante</Label>
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
                          Cliente: {customerName || 'N/A'} | Válida hasta {quote.expiryDate} | Moneda: {currency}
                      </CardDescription>
                  </div>
                  <div className="text-right">
                      <div className="relative h-10 w-32 mb-2">
                          <Image src="https://www.latinstorehouse.com/wp-content/uploads/2025/08/Logo-Latin-Store-House-blanco.webp" alt="Latin Store House Logo" fill style={{ objectFit: 'contain' }} />
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
                        {`${item.sheets} láminas (${item.sqMeters.toFixed(2)} M²)`}
                      </p>
                       <p className="text-sm text-muted-foreground font-medium">
                        Precio/Unidad: {formatCurrency(item.pricePerSheet)}
                      </p>
                      {currency === 'USD' && (
                         <div className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`price-${item.id}`} className="text-xs">Precio/Lámina (COP)</Label>
                             <Input 
                                id={`price-${item.id}`}
                                type="text"
                                value={new Intl.NumberFormat('es-CO').format(item.pricePerSheet || 0)}
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
                 {quote.totalSealantCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Sellante ({quote.totalSealantUnits} u. @ {formatCurrency(quote.totalSealantCost / quote.totalSealantUnits)}/u.)</span>
                        <span>{formatCurrency(quote.totalSealantCost)}</span>
                    </div>
                )}
                 {quote.totalAdhesiveCost > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Adhesivo ({quote.totalAdhesiveUnits} u. @ {formatCurrency(quote.totalAdhesiveCost / quote.totalAdhesiveUnits)}/u.)</span>
                        <span>{formatCurrency(quote.totalAdhesiveCost)}</span>
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
                    type="number"
                    value={currency === 'USD' ? quote.laborCost : laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-32 h-8 text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="transport-cost" className="text-muted-foreground">Costo Transporte</Label>
                  <Input
                    id="transport-cost"
                    type="number"
                    value={currency === 'USD' ? quote.transportationCost : transportationCost}
                    onChange={(e) => setTransportationCost(Number(e.target.value))}
                    className="w-32 h-8 text-right"
                    placeholder="0"
                  />
                </div>
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
