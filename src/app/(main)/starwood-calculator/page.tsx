
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  'Deck (ebony/light gray)',
  'Deck (redwood/walnut)',
  'Deck (teak/coffee)',
  'Liston 10x5 camel',
  'Liston 10x5 chocolate',
  'Liston 10x5 coffee',
  'Liston 16x8 camel',
  'Liston 16x8 chocolate',
  'Liston 6.8x2.5 camel',
  'Liston 6.8x2.5 chocolate',
  'Liston 6.8x2.5 coffee',
  'Liston 6x4 chocolate',
  'Liston 9x4 camel',
  'Liston 9x4 chocolate',
  'Liston 9x4 coffee',
].sort();

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
].sort();


const IVA_RATE = 0.19;

interface QuoteItem {
  id: number;
  reference: string;
  units: number;
  sqMeters?: number;
}

const DECK_SQM_PER_UNIT = 2.9 * 0.138;

export default function StarwoodCalculatorPage() {
  const searchParams = useSearchParams();
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  
  const [productReference, setProductReference] = useState('');
  const [productUnits, setProductUnits] = useState<number | string>(1);

  const [supplyReference, setSupplyReference] = useState('');
  const [supplyUnits, setSupplyUnits] = useState<number | string>(1);

  const [customerName, setCustomerName] = useState('');

  const [includeClips, setIncludeClips] = useState(true);
  const [includeSleepers, setIncludeSleepers] = useState(true);

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

    if (type === 'product' && reference.toLowerCase().includes('deck')) {
        newItem.sqMeters = units * DECK_SQM_PER_UNIT;
    }

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
    let totalDeckSqm = 0;

    const detailedItems = quoteItems.map(item => {
      const price = productPrices[item.reference as keyof typeof productPrices];
      const hasPrice = price !== undefined && price > 0;
      const itemCost = hasPrice ? item.units * price : 0;
      
      if (hasPrice) {
        subtotal += itemCost;
      }
      if (item.reference.toLowerCase().includes('deck')) {
          totalDeckSqm += item.sqMeters || 0;
      }
      
      return { 
        ...item,
        itemCost,
        hasPrice
      };
    });
    
    let clipsCost = 0;
    let sleepersCost = 0;
    let clipCount = 0;
    let sleeperCount = 0;

    if (totalDeckSqm > 0) {
        if (includeClips) {
            clipCount = Math.ceil(totalDeckSqm * 21);
            const clipPrice = productPrices['Clip plastico para deck wpc'] || 0;
            clipsCost = clipCount * clipPrice;
            subtotal += clipsCost;
        }
        if (includeSleepers) {
            const sleeperLinearMeters = (totalDeckSqm * 3.5);
            sleeperCount = Math.ceil(sleeperLinearMeters / 2.3);
            const sleeperPrice = productPrices['Durmiente plastico 3x3'] || 0;
            sleepersCost = sleeperCount * sleeperPrice;
            subtotal += sleepersCost;
        }
    }


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
      clips: { count: clipCount, cost: clipsCost, price: productPrices['Clip plastico para deck wpc'] || 0 },
      sleepers: { count: sleeperCount, cost: sleepersCost, price: productPrices['Durmiente plastico 3x3'] || 0 },
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

    if (quote.clips.count > 0) {
        tableBody.push(['Clip plastico para deck wpc', quote.clips.count, formatCurrency(quote.clips.price), formatCurrency(quote.clips.cost)]);
    }
    if (quote.sleepers.count > 0) {
        tableBody.push(['Durmiente plastico 3x3', quote.sleepers.count, formatCurrency(quote.sleepers.price), formatCurrency(quote.sleepers.cost)]);
    }


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
        message += `- ${item.units} unidades`;
        if (item.sqMeters) {
            message += ` (${item.sqMeters.toFixed(2)} M² aprox.)`;
        }
        message += `\n\n`;
    });

    if (quote.clips.count > 0) {
        message += `*Insumo: Clip plastico para deck wpc*\n`;
        message += `- ${quote.clips.count} unidades (Calculado para la instalación)\n\n`;
    }
     if (quote.sleepers.count > 0) {
        message += `*Insumo: Durmiente plastico 3x3*\n`;
        message += `- ${quote.sleepers.count} unidades (Calculado para la instalación)\n\n`;
    }

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
          Estime el costo para productos Starwood por unidad, con cálculo automático de insumos para deck.
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
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="includeClips"
                        checked={includeClips}
                        onCheckedChange={(checked) => setIncludeClips(Boolean(checked))}
                    />
                    <Label htmlFor="includeClips">Incluir Clips (Automático)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox
                        id="includeSleepers"
                        checked={includeSleepers}
                        onCheckedChange={(checked) => setIncludeSleepers(Boolean(checked))}
                    />
                    <Label htmlFor="includeSleepers">Incluir Durmientes (Automático)</Label>
                </div>
              </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4">Insumos y Accesorios (Adicional)</h3>
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
                        <p className="text-sm text-muted-foreground">
                            {item.units} unidades
                            {item.sqMeters && (
                                <span className="text-primary font-medium ml-2">({item.sqMeters.toFixed(2)} M² aprox.)</span>
                            )}
                        </p>
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

              {(quote.clips.count > 0 || quote.sleepers.count > 0) && (
                <>
                <Separator />
                <div className="space-y-2">
                    <p className="font-medium text-sm">Insumos Calculados</p>
                    {quote.clips.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Clip plastico para deck wpc</p>
                                <p className="text-sm text-muted-foreground">{quote.clips.count} unidades</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.clips.cost)}</p>
                        </div>
                    )}
                    {quote.sleepers.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Durmiente plastico 3x3</p>
                                <p className="text-sm text-muted-foreground">{quote.sleepers.count} unidades</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.sleepers.cost)}</p>
                        </div>
                    )}
                </div>
                </>
              )}

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
