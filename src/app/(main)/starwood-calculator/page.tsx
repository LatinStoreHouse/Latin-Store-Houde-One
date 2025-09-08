

'use client';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download, MessageSquare, Save, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { initialProductPrices as productPrices } from '@/lib/prices';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { LocationCombobox } from '@/components/location-combobox';
import { useUser } from '@/app/(main)/layout';
import { InventoryContext, StarwoodYields } from '@/context/inventory-context';
import { CustomerSelector } from '@/components/customer-selector';
import { Customer } from '@/lib/customers';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';


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
  'Adhesivo',
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

// Utility function to safely get base64 from an image
const getImageBase64 = (src: string): Promise<{ base64: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve({ base64: dataURL, width: img.width, height: img.height });
            } catch (e) {
                console.error("Error converting canvas to data URL", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image for PDF conversion:", src, e);
            resolve(null); // Resolve with null if the image fails to load
        };
    });
};

function SettingsDialog() {
    const context = useContext(InventoryContext);
    if (!context) throw new Error("Context not found");
    const { starwoodYields, setStarwoodYields } = context;
    const { toast } = useToast();

    const [localYields, setLocalYields] = useState<StarwoodYields>(starwoodYields);

    const handleYieldChange = (key: keyof StarwoodYields, value: string) => {
        setLocalYields(prev => ({ ...prev, [key]: Number(value) }));
    };

    const handleSave = () => {
        setStarwoodYields(localYields);
        toast({ title: "Ajustes guardados", description: "Los rendimientos de Starwood han sido actualizados." });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Ajustes de la Calculadora Starwood</DialogTitle>
                <DialogDescription>
                    Modifique los valores de rendimiento para los insumos calculados automáticamente.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Clips por M² de Deck</Label>
                        <Input type="number" value={localYields.clipsPerSqM} onChange={(e) => handleYieldChange('clipsPerSqM', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>M. Lineales de Durmiente por M²</Label>
                        <Input type="number" value={localYields.sleeperLinearMetersPerSqM} onChange={(e) => handleYieldChange('sleeperLinearMetersPerSqM', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label># Listones por Adhesivo</Label>
                        <Input type="number" value={localYields.listonsPerAdhesive} onChange={(e) => handleYieldChange('listonsPerAdhesive', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label># Listones por Sellante (1/4 gal)</Label>
                        <Input type="number" value={localYields.listonsPerSealant} onChange={(e) => handleYieldChange('listonsPerSealant', e.target.value)} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function StarwoodCalculatorPage() {
  const searchParams = useSearchParams();
  const context = useContext(InventoryContext);
  if (!context) throw new Error("Inventory context not found");
  const { addQuote, starwoodYields } = context;

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  
  const [productReference, setProductReference] = useState('');
  const [productUnits, setProductUnits] = useState<number | string>(1);

  const [supplyReference, setSupplyReference] = useState('');
  const [supplyUnits, setSupplyUnits] = useState<number | string>(1);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; } | null>(null);

  const [includeClips, setIncludeClips] = useState(true);
  const [includeSleepers, setIncludeSleepers] = useState(true);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [includeSealant, setIncludeSealant] = useState(true);

  const [laborCost, setLaborCost] = useState(0);
  const [transportationCost, setTransportationCost] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [offerValidity, setOfferValidity] = useState('');
  const {currentUser} = useUser();
  
  const isDistributor = useMemo(() => currentUser.roles.includes('Distribuidor'), [currentUser.roles]);
  const canEditSettings = currentUser.roles.includes('Administrador');

  const viewMode = useMemo(() => {
    return isDistributor ? 'distributor' : 'internal';
  }, [isDistributor]);


  const selectedProductIsDeck = useMemo(() => productReference.toLowerCase().includes('deck'), [productReference]);
  const selectedProductIsListon = useMemo(() => productReference.toLowerCase().includes('liston'), [productReference]);
  
  const anyDeckInQuote = useMemo(() => quoteItems.some(item => item.reference.toLowerCase().includes('deck')), [quoteItems]);
  const anyListonInQuote = useMemo(() => quoteItems.some(item => item.reference.toLowerCase().includes('liston')), [quoteItems]);


  const productOptions = useMemo(() => {
    return starwoodProducts.map(ref => ({ value: ref, label: ref }));
  }, []);
  
  const supplyOptions = useMemo(() => {
    return starwoodSupplies.map(ref => ({ value: ref, label: ref }));
  }, []);

  useEffect(() => {
    const customerNameParam = searchParams.get('customerName');
    if (customerNameParam && viewMode === 'internal') {
        setCustomerName(decodeURIComponent(customerNameParam));
    }
  }, [searchParams, viewMode]);

  const handleLocationChange = (newLocation: { lat: number; lng: number; address: string } | null) => {
    setLocation(newLocation);
    if (newLocation) {
        setCustomerAddress(newLocation.address);
    }
  }

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
  
  const handleCurrencyInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = Number(value.replace(/[^0-9]/g, ''));
    setter(numericValue);
  };

  const calculateQuote = () => {
    let subtotal = 0;
    let totalDeckSqm = 0;
    let totalListonUnits = 0;

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
      if (item.reference.toLowerCase().includes('liston')) {
          totalListonUnits += item.units;
      }
      
      return { 
        ...item,
        price,
        itemCost,
        hasPrice
      };
    });
    
    let clipsCost = 0;
    let sleepersCost = 0;
    let clipCount = 0;
    let sleeperCount = 0;
    let adhesiveCost = 0;
    let sealantCost = 0;
    let adhesiveCount = 0;
    let sealantCount = 0;

    if (totalDeckSqm > 0) {
        if (includeClips) {
            clipCount = Math.ceil(totalDeckSqm * starwoodYields.clipsPerSqM);
            const clipPrice = productPrices['Clip plastico para deck wpc'] || 0;
            clipsCost = clipCount * clipPrice;
            subtotal += clipsCost;
        }
        if (includeSleepers) {
            const sleeperLinearMeters = (totalDeckSqm * starwoodYields.sleeperLinearMetersPerSqM);
            sleeperCount = Math.ceil(sleeperLinearMeters / 2.3);
            const sleeperPrice = productPrices['Durmiente plastico 3x3'] || 0;
            sleepersCost = sleeperCount * sleeperPrice;
            subtotal += sleepersCost;
        }
    }

    if (totalListonUnits > 0) {
        if (includeAdhesive) {
            adhesiveCount = Math.ceil(totalListonUnits / starwoodYields.listonsPerAdhesive);
            const adhesivePrice = productPrices['Adhesivo'] || 0;
            adhesiveCost = adhesiveCount * adhesivePrice;
            subtotal += adhesiveCost;
        }
        if (includeSealant) {
            sealantCount = Math.ceil(totalListonUnits / starwoodYields.listonsPerSealant);
            const sealantPrice = productPrices['Sellante wpc 1/4 galon'] || 0;
            sealantCost = sealantCount * sealantPrice;
            subtotal += sealantCost;
        }
    }


    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva + laborCost + transportationCost;
    
    const creationDate = new Date();
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    const quoteNumber = `V-200-${Date.now().toString().slice(-4)}`;

    return {
      quoteNumber,
      items: detailedItems,
      subtotal: subtotal,
      iva,
      total: total,
      laborCost,
      transportationCost,
      clips: { count: clipCount, cost: clipsCost, price: productPrices['Clip plastico para deck wpc'] || 0 },
      sleepers: { count: sleeperCount, cost: sleepersCost, price: productPrices['Durmiente plastico 3x3'] || 0 },
      adhesives: { count: adhesiveCount, cost: adhesiveCost, price: productPrices['Adhesivo'] || 0 },
      sealants: { count: sealantCount, cost: sealantCost, price: productPrices['Sellante wpc 1/4 galon'] || 0 },
      creationDate: creationDate,
      expiryDate: expiryDate.toLocaleDateString('es-CO'),
    };
  };

  const quote = quoteItems.length > 0 ? calculateQuote() : null;

  const handleSaveQuote = () => {
    if (!quote) return;
     addQuote({
        quoteNumber: quote.quoteNumber,
        calculatorType: 'Starwood',
        customerName: customerName,
        advisorName: currentUser.name,
        creationDate: new Date().toISOString(),
        total: quote.total,
        currency: 'COP',
        items: quote.items.map(i => ({ reference: i.reference, quantity: i.units, price: i.price })),
        details: quote,
    });
  }

  const handleSelectCustomer = (customer: Customer | null) => {
    if (customer) {
        setCustomerName(customer.name);
        setCustomerEmail(customer.email || '');
        setCustomerPhone(customer.phone || '');
        setCustomerAddress(customer.address || '');
        setCustomerTaxId(customer.taxId || '');
        if (customer.address) {
            setLocation({ address: customer.address, lat: 0, lng: 0 }); // Posición no es crucial aquí
        } else {
            setLocation(null);
        }
    } else {
        // Reset fields if 'new customer' is chosen or cleared
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerTaxId('');
        setLocation(null);
    }
  };
  
   const generatePdfContent = (doc: jsPDF, quote: NonNullable<ReturnType<typeof calculateQuote>>, pageWidth: number) => {
    const today = new Date();

    let startY = 40;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimado/a:', 14, startY);
    startY += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(customerName.toUpperCase() || 'CLIENTE GENERAL', 14, startY);
    startY += 5;
    
    if (customerTaxId) {
        doc.text(`NIT/Cédula: ${customerTaxId}`, 14, startY);
        startY += 5;
    }
    if (customerAddress) {
        doc.text(`Dirección: ${customerAddress}`, 14, startY);
        startY += 5;
    }
    if (customerPhone) {
        doc.text(`Teléfono: ${customerPhone}`, 14, startY);
        startY += 5;
    }
    if (customerEmail) {
        doc.text(`Correo: ${customerEmail}`, 14, startY);
        startY += 5;
    }

    startY += 3;

    doc.setFont('helvetica', 'bold');
    doc.text(`Ref: Cotización Starwood - ${quote.quoteNumber}`, 14, startY);
    startY += 8;

    doc.setFont('helvetica', 'normal');
    doc.text('Es grato para nosotros poner a su consideración la siguiente propuesta:', 14, startY);
    startY += 8;
    
    const head = [['Item', 'Descripción', 'Unidad', 'M²', 'Cantidad', 'Valor Unitario', '%Dto.', 'Valor Total']];
    const body: any[][] = [];

    quote.items.forEach((item, index) => {
        const price = productPrices[item.reference as keyof typeof productPrices];
        const priceText = (price !== undefined && price > 0) ? formatCurrency(price) : 'Precio Pendiente';
        const sqMetersText = item.sqMeters ? item.sqMeters.toFixed(2) : '';
        body.push([(index + 1).toString(), item.reference, 'UND', sqMetersText, item.units, priceText, '0.00', item.hasPrice ? formatCurrency(item.itemCost) : 'N/A']);
    });

    if (quote.clips.count > 0) {
        body.push([(body.length + 1).toString(), 'Clip plastico para deck wpc', 'UND', '', quote.clips.count, formatCurrency(quote.clips.price), '0.00', formatCurrency(quote.clips.cost)]);
    }
    if (quote.sleepers.count > 0) {
        body.push([(body.length + 1).toString(), 'Durmiente plastico 3x3', 'UND', '', quote.sleepers.count, formatCurrency(quote.sleepers.price), '0.00', formatCurrency(quote.sleepers.cost)]);
    }
    if (quote.adhesives.count > 0) {
        body.push([(body.length + 1).toString(), 'Adhesivo', 'UND', '', quote.adhesives.count, formatCurrency(quote.adhesives.price), '0.00', formatCurrency(quote.adhesives.cost)]);
    }
    if (quote.sealants.count > 0) {
        body.push([(body.length + 1).toString(), 'Sellante wpc 1/4 galon', 'UND', '', quote.sealants.count, formatCurrency(quote.sealants.price), '0.00', formatCurrency(quote.sealants.cost)]);
    }

    doc.autoTable({
        startY: startY,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
        }
    });

    let finalY = (doc as any).autoTable.previous.finalY;
    
    // Totals table
    const summaryData = [
        ['Total Bruto', formatCurrency(quote.subtotal)],
        ['IVA', formatCurrency(quote.iva)],
    ];
    if (quote.laborCost > 0) {
        summaryData.push(['Mano de Obra', formatCurrency(quote.laborCost)]);
    }
    if (quote.transportationCost > 0) {
        summaryData.push(['Transporte', formatCurrency(quote.transportationCost)]);
    }
    summaryData.push(['Total a Pagar', formatCurrency(quote.total)]);


    doc.autoTable({
        startY: finalY + 2,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'right' }, 1: { halign: 'right' } },
        margin: { left: 110 }
    });
    
    finalY = (doc as any).autoTable.previous.finalY;
    startY = finalY + 15;

    // Commercial Terms
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Despacho:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(deliveryTerms, 50, startY);
    startY += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Forma de Pago:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentTerms, 50, startY);
    startY += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Validez de la oferta:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(offerValidity + `, ${today.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric'})}`, 50, startY);
    startY += 15;

    // Signature
    doc.text('Cordialmente,', 14, startY);
    startY += 15;
    doc.text(currentUser.name, 14, startY);
  };
  
  const handleDownloadPdf = async () => {
    if (!quote) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    
    const starwoodLogoData = await getImageBase64('/imagenes/logos/Logo-Starwood-color.png');
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');

    if (starwoodLogoData) {
        const logoWidth = 30; // Adjusted size for Starwood logo
        const logoHeight = starwoodLogoData.height * (logoWidth / starwoodLogoData.width);
        doc.addImage(starwoodLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    if (latinLogoData) {
        const logoWidth = 20; // Reduced size
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        const xPos = pageWidth - logoWidth - 14;
        doc.addImage(latinLogoData.base64, 'PNG', xPos, 10, logoWidth, logoHeight);
        doc.setFontSize(8);
        doc.text('NIT: 900493221-0', xPos + logoWidth / 2, 10 + logoHeight + 4, { align: 'center' });
    }
    
    generatePdfContent(doc, quote, pageWidth);
    doc.save('cotizacion_starwood.pdf');
  };
  
  const handleShareOnWhatsApp = () => {
    if (!quote) return;

    let message = `*Cotización de Starwood - Latin Store House*\n\n`;
    if (viewMode !== 'distributor') {
      message += `*Cliente:* ${customerName || 'N/A'}\n`;
      message += `*Fecha de Cotización:* ${quote.creationDate.toLocaleDateString('es-CO')}\n`;
      message += `*Válida hasta:* ${quote.expiryDate}\n\n`;
    }


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
    if (quote.adhesives.count > 0) {
        message += `*Insumo: Adhesivo*\n`;
        message += `- ${quote.adhesives.count} unidades (Calculado para la instalación)\n\n`;
    }
    if (quote.sealants.count > 0) {
        message += `*Insumo: Sellante wpc 1/4 galon*\n`;
        message += `- ${quote.sealants.count} unidades (Calculado para la instalación)\n\n`;
    }

    message += `*Desglose de Costos (COP):*\n`;
    message += `- *Subtotal:* ${formatCurrency(quote.subtotal)}\n`;
    message += `- IVA (19%): ${formatCurrency(quote.iva)}\n`;
    if (quote.laborCost > 0) {
        message += `- Costo Mano de Obra: ${formatCurrency(quote.laborCost)}\n`;
    }
    if (quote.transportationCost > 0) {
        message += `- Costo Transporte: ${formatCurrency(quote.transportationCost)}\n`;
    }
    message += `\n*Total Estimado: ${formatCurrency(quote.total)}*\n\n`;

     if (notes) {
        message += `*Notas Adicionales:*\n${notes}\n\n`;
    }

    message += `_Esta es una cotización preliminar y no incluye costos de instalación._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
              <CardTitle>Calculadora de Cotizaciones - Starwood</CardTitle>
              <CardDescription>
                Estime el costo para productos Starwood por unidad, con cálculo automático de insumos para deck y listones.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 {canEditSettings && (
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                        </Button>
                        </DialogTrigger>
                        <SettingsDialog />
                    </Dialog>
                 )}
                <Image src="/imagenes/logos/Logo-Starwood-color.png" alt="Starwood Logo" width={80} height={26} className="object-contain"/>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'internal' && (
            <div className="space-y-4">
                <CustomerSelector
                    onCustomerSelect={handleSelectCustomer}
                    onNameChange={setCustomerName}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-tax-id">NIT o Cédula</Label>
                        <Input id="customer-tax-id" value={customerTaxId} onChange={(e) => setCustomerTaxId(e.target.value)} placeholder="Ingrese el NIT o cédula..."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customer-phone">Teléfono</Label>
                        <Input id="customer-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ingrese el teléfono..."/>
                    </div>
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="customer-email">Correo Electrónico</Label>
                        <Input id="customer-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Ingrese el correo..."/>
                    </div>
                </div>
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="location">Dirección</Label>
                    <LocationCombobox value={location} onChange={handleLocationChange} city={customerAddress} />
                </div>
                <Separator />
            </div>
        )}
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
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                {selectedProductIsDeck && (
                    <>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeClips" checked={includeClips} onCheckedChange={(checked) => setIncludeClips(Boolean(checked))}/>
                            <Label htmlFor="includeClips">Incluir Clips (para Deck)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeSleepers" checked={includeSleepers} onCheckedChange={(checked) => setIncludeSleepers(Boolean(checked))}/>
                            <Label htmlFor="includeSleepers">Incluir Durmientes (para Deck)</Label>
                        </div>
                    </>
                )}
                 {selectedProductIsListon && (
                    <>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeAdhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))}/>
                            <Label htmlFor="includeAdhesive">Incluir Adhesivo (para Listones)</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="includeSealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))}/>
                            <Label htmlFor="includeSealant">Incluir Sellante (para Listones)</Label>
                        </div>
                    </>
                 )}
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
              {viewMode !== 'distributor' && <CardDescription>Cliente: {customerName || 'N/A'} | Válida hasta: {quote.expiryDate.toLocaleString('es-CO')}</CardDescription>}
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

              {(quote.clips.count > 0 || quote.sleepers.count > 0 || quote.adhesives.count > 0 || quote.sealants.count > 0) && (
                <>
                <Separator />
                <div className="space-y-2">
                    <p className="font-medium text-sm">Insumos Calculados</p>
                    {quote.clips.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Clip plastico para deck wpc</p>
                                <p className="text-sm text-muted-foreground">{quote.clips.count} unidades @ {formatCurrency(quote.clips.price)}/u.</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.clips.cost)}</p>
                        </div>
                    )}
                    {quote.sleepers.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Durmiente plastico 3x3</p>
                                <p className="text-sm text-muted-foreground">{quote.sleepers.count} unidades @ {formatCurrency(quote.sleepers.price)}/u.</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.sleepers.cost)}</p>
                        </div>
                    )}
                    {quote.adhesives.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Adhesivo</p>
                                <p className="text-sm text-muted-foreground">{quote.adhesives.count} unidades @ {formatCurrency(quote.adhesives.price)}/u.</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.adhesives.cost)}</p>
                        </div>
                    )}
                    {quote.sealants.count > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">Sellante wpc 1/4 galon</p>
                                <p className="text-sm text-muted-foreground">{quote.sealants.count} unidades @ {formatCurrency(quote.sealants.price)}/u.</p>
                            </div>
                            <p className="font-medium">{formatCurrency(quote.sealants.cost)}</p>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="labor-cost" className="text-muted-foreground">Costo Mano de Obra</Label>
                  <Input id="labor-cost" type="text" value={formatCurrency(laborCost)} onChange={(e) => handleCurrencyInputChange(setLaborCost)(e)} className="w-32 h-8 text-right" placeholder="0"/>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="transport-cost" className="text-muted-foreground">Costo Transporte</Label>
                  <Input id="transport-cost" type="text" value={formatCurrency(transportationCost)} onChange={(e) => handleCurrencyInputChange(setTransportationCost)(e)} className="w-32 h-8 text-right" placeholder="0"/>
                </div>
              </div>
              
              {viewMode === 'internal' && (
                <>
                    <Separator />
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium mb-2">Términos Comerciales</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="delivery-terms">Despacho</Label>
                                    <Input id="delivery-terms" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="payment-terms">Forma de Pago</Label>
                                    <Input id="payment-terms" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="offer-validity">Validez de la Oferta</Label>
                                    <Input id="offer-validity" value={offerValidity} onChange={e => setOfferValidity(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas Adicionales</Label>
                            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Especifique cualquier detalle o condición..."/>
                        </div>
                    </div>
                </>
              )}

              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                    {viewMode === 'internal' && (
                        <Button variant="outline" onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleShareOnWhatsApp} className="gap-2">
                        <MessageSquare />
                        <span>Compartir</span>
                    </Button>
                     {viewMode === 'internal' && (
                        <Button onClick={handleSaveQuote}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cotización
                        </Button>
                    )}
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
