
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
import Image from 'next/image';

const WhatsAppIcon = () => (
    <Image src="/imagenes/logos/Logo Whatsapp.svg" alt="WhatsApp" width={16} height={16} />
);

const starwoodProducts = [
  'Liston 9x4 coffee',
  'Liston 9x4 chocolate',
  'Liston 10x5 coffee',
  'Liston 10x5 chocolate',
  'Deck (teak/coffee)',
  'Deck (ebony/light gray)',
  'Deck (redwood/walnut)',
  'Liston 6.8x2.5 camel',
  'Liston 6.8x2.5 coffee',
  'Liston 6.8x2.5 chocolate',
  'Liston 9x4 camel',
  'Liston 10x5 camel',
  'Liston 16x8 camel',
  'Liston 16x8 chocolate',
  'Liston 6x4 chocolate',
];

const starwoodSupplies = [
  'Bocel decorativo blanco',
  'Clip plastico para deck wpc',
  'Daily clean',
  'Daily clean galon',
  'Durmiente plastico 3x3',
  'Durmiente plastico 6x6',
  'Intensive clean',
  'Remate wall panel gris',
  'Remate wall panel maple',
  'Remate wall panel negro',
  'Remate wall panel roble',
  'Sellante wpc 1 galon',
  'Sellante wpc 1/4 galon',
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
  
  const [productReference, setProductReference] = useState('');
  const [productUnits, setProductUnits] = useState<number | string>(1);

  const [supplyReference, setSupplyReference] = useState('');
  const [supplyUnits, setSupplyUnits] = useState<number | string>(1);

  const [customerName, setCustomerName] = useState('');

  const productOptions = useMemo(() => {
    return starwoodProducts.map(ref => ({ value: ref, label: ref }));
  }, []);
  
  const supplyOptions = useMemo(() => {
    return starwoodSupplies.map(ref => ({ value: ref, label: ref }));
  }, []);

  useEffect(() => {
    const customerNameParam = searchParams.get('customerName');
    if (customerNameParam) {
        setCustomerName(decodeURIComponent(customerNameParam));
    }
  }, [searchParams]);


  const handleAddProduct = (type: 'product' | 'supply') => {
    const reference = type === 'product' ? productReference : supplyReference;
    const units = type === 'product' ? Number(productUnits) : Number(supplyUnits);
    
    if (!reference || units <= 0) return;

    const newItem: QuoteItem = {
      id: Date.now(),
      reference,
      units,
    };

    setQuoteItems([...quoteItems, newItem]);

    if (type === 'product') {
      setProductReference('');
      setProductUnits(1);
    } else {
      setSupplyReference('');
      setSupplyUnits(1);
    }
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
    let subtotal = 0;
    const detailedItems = quoteItems.map(item => {
      const price = productPrices[item.reference as keyof typeof productPrices];
      const hasPrice = price !== undefined && price > 0;
      const itemCost = hasPrice ? item.units * price : 0;
      if (hasPrice) {
        subtotal += itemCost;
      }
      
      return { 
        ...item,
        itemCost,
        hasPrice
      };
    });

    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    return {
      items: detailedItems,
      subtotal: subtotal,
      iva,
      total: total,
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

    const tableBody = quote.items.map(item => {
        const price = productPrices[item.reference as keyof typeof productPrices];
        const priceText = (price !== undefined && price > 0) ? formatCurrency(price) : 'Precio Pendiente';
        return [
            item.reference,
            item.units,
            priceText,
            item.hasPrice ? formatCurrency(item.itemCost) : 'N/A'
        ];
    });

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
          <div>
            <h3 className="text-lg font-medium mb-4">Productos Principales</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                   <Label>Referencia de Producto</Label>
                   <Combobox
                     options={productOptions}
                     value={productReference}
                     onValueChange={setProductReference}
                     placeholder="Seleccione un producto"
                     searchPlaceholder="Buscar producto..."
                     emptyPlaceholder="No se encontraron productos."
                   />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="product-units-input">Cantidad (Unidades)</Label>
                    <Input
                      id="product-units-input"
                      type="number"
                      value={productUnits}
                      onChange={(e) => setProductUnits(e.target.value)}
                      className="w-full"
                      min="1"
                    />
                  </div>
                  <Button onClick={() => handleAddProduct('product')} disabled={!productReference}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
              </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4">Insumos y Accesorios</h3>
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
                  <Button onClick={() => handleAddProduct('supply')} disabled={!supplyReference}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
              </div>
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
                       <p className="font-medium">{item.hasPrice ? formatCurrency(item.itemCost) : <span className="text-destructive">Precio Pendiente</span>}</p>
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
                    <Button variant="outline" onClick={handleShareOnWhatsApp} className="gap-2">
                        <WhatsAppIcon />
                        <span>Compartir</span>
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
