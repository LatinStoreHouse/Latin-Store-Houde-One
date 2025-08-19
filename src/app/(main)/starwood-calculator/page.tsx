'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { initialProductPrices as productPrices } from '@/lib/prices';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
);


const starwoodProducts = {
    'PERGOLA 9x4 - 3 MTS COFFEE': { width: 0.09, length: 3, type: 'pergola' },
    'PERGOLA 9x4 - 3 MTS CHOCOLATE': { width: 0.09, length: 3, type: 'pergola' },
    'PERGOLA 10x5 - 3 COFFEE': { width: 0.1, length: 3, type: 'pergola' },
    'PERGOLA 10x5 - 3 MTS CHOCOLATE': { width: 0.1, length: 3, type: 'pergola' },
    'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE': { width: 0.145, length: 2.21, type: 'deck' },
    'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN': { width: 0.138, length: 3, type: 'deck' },
    'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG': { width: 0.138, length: 3, type: 'deck' },
    'LISTON 6.8x2.5 - 3 MTS CAMEL': { width: 0.068, length: 3, type: 'liston' },
    'LISTON 6.8x2.5 - 3 MTS COFFEE': { width: 0.068, length: 3, type: 'liston' },
    'LISTON 6.8x2.5 - 3 MTS CHOCOLATE': { width: 0.068, length: 3, type: 'liston' },
};

const IVA_RATE = 0.19;

interface QuoteItem {
  id: number;
  reference: string;
  sqMeters: number;
  units: number;
  clips: number;
  sleepers: number;
  screws: number;
  sealant: number;
}

export default function StarwoodCalculatorPage() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [sqMeters, setSqMeters] = useState<number | string>(1);
  const [wastePercentage, setWastePercentage] = useState<number | string>(5);

  const referenceOptions = useMemo(() => {
    return Object.keys(starwoodProducts).map(ref => ({ value: ref, label: ref }));
  }, []);

  const parseDecimal = (value: string | number) => {
    if (typeof value === 'number') return value;
    return parseFloat(value.toString().replace(',', '.')) || 0;
  };
  
  const handleDecimalInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*[,.]?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleAddProduct = () => {
    if (!reference) return;

    const productInfo = starwoodProducts[reference as keyof typeof starwoodProducts];
    const totalSqm = parseDecimal(sqMeters) * (1 + parseDecimal(wastePercentage) / 100);
    const sqmPerUnit = productInfo.width * productInfo.length;
    
    const units = Math.ceil(totalSqm / sqmPerUnit);
    
    // Insumos
    const clipsPerSqm = 23;
    const sleepersPerSqm = 3.5;
    const screwsPerSqm = 46;
    const sealantYieldPerGallon = 20; // m2

    const clips = Math.ceil(totalSqm * clipsPerSqm);
    const sleepers = Math.ceil(totalSqm * sleepersPerSqm);
    const screws = Math.ceil(totalSqm * screwsPerSqm);
    const sealantGallons = Math.ceil(totalSqm / sealantYieldPerGallon);

    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      sqMeters: totalSqm,
      units,
      clips,
      sleepers,
      screws,
      sealant: sealantGallons,
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
    let totalCost = 0;
    const detailedItems = quoteItems.map(item => {
      const productCost = item.units * (productPrices[item.reference] || 0);
      const clipsCost = item.clips * (productPrices['CLIP PLASTICO PARA DECK WPC'] || 0);
      const sleepersCost = item.sleepers * (productPrices['DURMIENTE PLASTICO 3x3 - 2.90 MTS'] || 0);
      const screwsCost = 0; // Screws price not available yet
      const sealantCost = item.sealant * (productPrices['SELLANTE WPC 1 GALON'] || 0);

      const subtotal = productCost + clipsCost + sleepersCost + screwsCost + sealantCost;
      totalCost += subtotal;
      
      return { 
        ...item, 
        productCost,
        clipsCost,
        sleepersCost,
        screwsCost,
        sealantCost,
        subtotal
      };
    });

    const iva = totalCost * IVA_RATE;
    const finalTotal = totalCost + iva;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    return {
      items: detailedItems,
      subtotal: totalCost,
      iva,
      total: finalTotal,
      creationDate: creationDate.toLocaleDateString('es-CO'),
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    };
  };

  const quote = quoteItems.length > 0 ? calculateQuote() : null;
  
  const handleDownloadPdf = () => {
    if (!quote) return;
    const doc = new jsPDF();
    doc.text(`Cotización Starwood - Cliente: ${customerName || 'N/A'}`, 14, 20);
    doc.text(`Válida hasta ${quote.expiryDate}`, 14, 26);

    quote.items.forEach((item, index) => {
        let y = 35 + (index * 50);
        doc.text(`Producto: ${item.reference}`, 14, y);
        y += 7;
        const tableBody = [
            ['Item', 'Cantidad', 'Precio Unitario', 'Total'],
            [`Unidades (${item.sqMeters.toFixed(2)} M² total)`, item.units, formatCurrency(productPrices[item.reference] || 0), formatCurrency(item.productCost)],
            ['Clips', item.clips, formatCurrency(productPrices['CLIP PLASTICO PARA DECK WPC'] || 0), formatCurrency(item.clipsCost)],
            ['Durmientes', item.sleepers, formatCurrency(productPrices['DURMIENTE PLASTICO 3x3 - 2.90 MTS'] || 0), formatCurrency(item.sleepersCost)],
            ['Sellante (galón)', item.sealant, formatCurrency(productPrices['SELLANTE WPC 1 GALON'] || 0), formatCurrency(item.sealantCost)],
        ];
        doc.autoTable({ startY: y, head: [tableBody[0]], body: tableBody.slice(1) });
    });

    const finalY = (doc as any).autoTable.previous.finalY || 150;
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal)}`, 14, finalY + 10);
    doc.text(`IVA (19%): ${formatCurrency(quote.iva)}`, 14, finalY + 17);
    doc.text(`Total: ${formatCurrency(quote.total)}`, 14, finalY + 24);

    doc.save('cotizacion_starwood.pdf');
  };
  
  const handleShareOnWhatsApp = () => {
    if (!quote) return;

    let message = `*Cotización de Starwood - Latin Store House*\n\n`;
    message += `*Cliente:* ${customerName || 'N/A'}\n`;
    message += `*Fecha de Cotización:* ${quote.creationDate}\n`;
    message += `*Válida hasta:* ${quote.expiryDate}\n\n`;

    quote.items.forEach(item => {
        message += `*Producto: ${item.reference}*\n`;
        message += `- ${item.units} unidades para ${item.sqMeters.toFixed(2)} M²\n`;
        message += `- ${item.clips} clips\n`;
        message += `- ${item.sleepers} durmientes\n`;
        message += `- ${item.sealant} galones de sellante\n\n`;
    });

    message += `*Desglose de Costos (COP):*\n`;
    message += `- *Subtotal:* ${formatCurrency(quote.subtotal)}\n`;
    message += `- IVA (19%): ${formatCurrency(quote.iva)}\n`;
    message += `\n*Total Estimado: ${formatCurrency(quote.total)}*\n\n`;
    message += `_Esta es una cotización preliminar y no incluye costos de instalación._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Cotizaciones - Starwood</CardTitle>
        <CardDescription>
          Estime la cantidad de materiales y el costo para productos Starwood (Decks, Pérgolas, etc.).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="customer-name">Nombre del Cliente</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ingrese el nombre del cliente..."
            />
          </div>
          <Separator />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
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
                <Label htmlFor="sqm-input">Metros Cuadrados (M²)</Label>
                <Input
                  id="sqm-input"
                  type="text"
                  value={sqMeters}
                  onChange={handleDecimalInputChange(setSqMeters)}
                  className="w-full"
                />
              </div>
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
              <Button onClick={handleAddProduct} className="mt-4" disabled={!reference || !customerName}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar a la Cotización
              </Button>
            </div>

         {quote && (
          <Card className="bg-primary/5 mt-6">
            <CardHeader>
              <CardTitle>Resumen de la Cotización</CardTitle>
              <CardDescription>Cliente: {customerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {quote.items.map(item => (
                  <div key={item.id} className="p-3 rounded-md bg-background">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{item.reference} - {item.sqMeters.toFixed(2)} M²</p>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)} className="h-7 w-7">
                           <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                     <ul className="text-sm text-muted-foreground list-disc pl-5 mt-1">
                        <li>{item.units} unidades de {item.reference} - {formatCurrency(item.productCost)}</li>
                        <li>{item.clips} clips - {formatCurrency(item.clipsCost)}</li>
                        <li>{item.sleepers} durmientes - {formatCurrency(item.sleepersCost)}</li>
                        <li>{item.sealant} galones de sellante - {formatCurrency(item.sealantCost)}</li>
                    </ul>
                    <p className="text-right font-medium mt-2">Subtotal Item: {formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span>{formatCurrency(quote.iva)}</span>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                    <Button variant="outline" onClick={handleShareOnWhatsApp}>
                        <WhatsAppIcon />
                        <span className="ml-2">Compartir</span>
                    </Button>
                </div>
                <p className="text-lg font-bold text-right">
                  Total: {formatCurrency(quote.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
