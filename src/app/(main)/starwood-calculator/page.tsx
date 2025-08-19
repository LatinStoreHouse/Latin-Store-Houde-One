'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download } from 'lucide-react';
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


const starwoodProducts = [
    'Pérgola 9x4 cm',
    'Pérgola 10x5 cm',
    'Pérgola 16x8 cm',
    'Liston 6.8x2.5 cm',
    'Deck 13.8x2.9 cm',
];

const IVA_RATE = 0.19;

interface QuoteItem {
  id: number;
  reference: string;
  units: number;
}

export default function StarwoodCalculatorPage() {
  const searchParams = useSearchParams();
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [units, setUnits] = useState<number | string>(1);

  const referenceOptions = useMemo(() => {
    return starwoodProducts.map(ref => ({ value: ref, label: ref }));
  }, []);
  
  useEffect(() => {
    const customerNameParam = searchParams.get('customerName');
    if (customerNameParam) {
        setCustomerName(decodeURIComponent(customerNameParam));
    }
  }, [searchParams]);


  const handleAddProduct = () => {
    if (!reference || Number(units) <= 0) return;

    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      units: Number(units),
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
      totalCost += productCost;
      
      return { 
        ...item, 
        productCost,
        subtotal: productCost,
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
  
  const handleDownloadPdf = async () => {
    if (!quote) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Latin Store House', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Cotización Starwood', 14, 30);


    doc.setFontSize(10);
    doc.text(`Cliente: ${customerName || 'N/A'}`, 14, 40);
    doc.text(`Válida hasta: ${quote.expiryDate}`, 14, 45);

    const tableBody = quote.items.map(item => [
      item.reference,
      item.units,
      formatCurrency(productPrices[item.reference] || 0),
      formatCurrency(item.subtotal)
    ]);

    doc.autoTable({ 
      startY: 55, 
      head: [['Producto', 'Unidades', 'Precio Unitario', 'Total']], 
      body: tableBody 
    });
    
    const finalY = (doc as any).autoTable.previous.finalY || 150;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal)}`, 14, finalY + 10);
    doc.text(`IVA (19%): ${formatCurrency(quote.iva)}`, 14, finalY + 17);
    doc.setFontSize(14);
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
        message += `- ${item.units} unidades\n\n`;
    });

    message += `*Desglose de Costos (COP):*\n`;
    message += `- *Subtotal:* ${formatCurrency(quote.subtotal)}\n`;
    message += `- IVA (19%): ${formatCurrency(quote.iva)}\n`;
    message += `\n*Total Estimado: ${formatCurrency(quote.total)}*\n\n`;
    message += `_Esta es una cotización preliminar y no incluye costos de instalación o insumos._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Cotizaciones - Starwood</CardTitle>
        <CardDescription>
          Estime el costo para productos Starwood por unidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="customer-name">Nombre del Cliente (Opcional)</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ingrese el nombre del cliente..."
            />
          </div>
          <Separator />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 items-end">
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
                <Label htmlFor="units-input">Cantidad (Unidades)</Label>
                <Input
                  id="units-input"
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full"
                  min="1"
                />
              </div>
          </div>
          <div className="flex justify-end">
              <Button onClick={handleAddProduct} className="mt-4" disabled={!reference}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar a la Cotización
              </Button>
            </div>

         {quote && (
          <Card className="bg-primary/5 mt-6">
            <CardHeader>
              <CardTitle>Resumen de la Cotización</CardTitle>
              <CardDescription>Cliente: {customerName || 'N/A'} | Válida hasta: {quote.expiryDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {quote.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-md bg-background">
                     <div>
                        <p className="font-semibold">{item.reference}</p>
                        <p className="text-sm text-muted-foreground">{item.units} unidades</p>
                     </div>
                    <div className="flex items-center gap-4">
                       <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)} className="h-7 w-7">
                           <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
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
