

'use client';
import React, { useState, useMemo, useEffect, useContext } from 'react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, PlusCircle, Trash2, Download, RefreshCw, Loader2, HelpCircle, ChevronDown, MessageSquare, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { initialProductPrices } from '@/lib/prices';
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
import { productDimensions } from '@/lib/dimensions';
import { initialInventoryData } from '@/lib/initial-inventory';
import { useUser } from '@/app/(main)/layout';
import { LocationCombobox } from '@/components/location-combobox';
import { InventoryContext } from '@/context/inventory-context';
import { CustomerSelector } from '@/components/customer-selector';
import { Customer } from '@/lib/customers';



const referenceDetails: { [key: string]: { brand: string, line: string } } = {
    'Cut stone': { brand: 'StoneFlex', line: 'Clay' },
    'Travertino': { brand: 'StoneFlex', line: 'Clay' },
    'Concreto encofrado': { brand: 'StoneFlex', line: 'Clay' },
    'Tapia negra': { brand: 'StoneFlex', line: 'Clay' },
    'Black': { brand: 'StoneFlex', line: 'Pizarra' },
    'Black XL': { brand: 'StoneFlex', line: 'Pizarra' },
    'Kund multy': { brand: 'StoneFlex', line: 'Pizarra' },
    'Kund multy XL': { brand: 'StoneFlex', line: 'Pizarra' },
    'Tan': { brand: 'StoneFlex', line: 'Pizarra' },
    'Tan XL': { brand: 'StoneFlex', line: 'Pizarra' },
    'Indian autumn': { brand: 'StoneFlex', line: 'Pizarra' },
    'Indian autumn XL': { brand: 'StoneFlex', line: 'Pizarra' },
    'Indian autumn translucido': { brand: 'StoneFlex', line: 'Translucida' },
    'Indian autumn translucido XL': { brand: 'StoneFlex', line: 'Translucida' },
    'Burning forest': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Burning forest XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Copper': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Copper XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Jeera green': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Jeera green XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Silver shine': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Silver shine XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Silver shine gold': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Silver shine gold XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Steel grey': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Steel grey XL': { brand: 'StoneFlex', line: 'Cuarcitas' },
    'Carrara': { brand: 'StoneFlex', line: 'Mármol' },
    'Carrara XL': { brand: 'StoneFlex', line: 'Mármol' },
    'Crystal white': { brand: 'StoneFlex', line: 'Mármol' },
    'Crystal white XL': { brand: 'StoneFlex', line: 'Mármol' },
    'Himalaya gold': { brand: 'StoneFlex', line: 'Mármol' },
    'Himalaya gold XL': { brand: 'StoneFlex', line: 'Mármol' },
    'Mint white': { brand: 'StoneFlex', line: 'Mármol' },
    'Concreto blanco': { brand: 'StoneFlex', line: 'Concreto' },
    'Concreto blanco XL': { brand: 'StoneFlex', line: 'Concreto' },
    'Concreto gris': { brand: 'StoneFlex', line: 'Concreto' },
    'Concreto gris XL': { brand: 'StoneFlex', line: 'Concreto' },
    'Concrete with holes': { brand: 'StoneFlex', line: 'Concreto' },
    'Concrete with holes XL': { brand: 'StoneFlex', line: 'Concreto' },
    'Concreto gris medium': { brand: 'StoneFlex', line: 'Concreto' },
    'Concreto medio': { brand: 'StoneFlex', line: 'Concreto' },
    'Corten stell': { brand: 'StoneFlex', line: 'Metales' },
    'Mural blue patina with copper': { brand: 'StoneFlex', line: 'Metales' },
    'Mural white with copper gold': { brand: 'StoneFlex', line: 'Metales' },
    'Gate turquoise patina copper': { brand: 'StoneFlex', line: 'Metales' },
    'Corten steel': { brand: 'StoneFlex', line: 'Metales' },
    'Madera nogal': { brand: 'StoneFlex', line: 'Madera' },
    'Madera teka': { brand: 'StoneFlex', line: 'Madera' },
    'Madera ébano': { brand: 'StoneFlex', line: 'Madera' },
    '3d adhesivo - black': { brand: 'StoneFlex', line: '3D' },
    '3d adhesivo - indian rustic': { brand: 'StoneFlex', line: '3D' },
    '3d adhesivo - tan': { brand: 'StoneFlex', line: '3D' },
};


const allReferences = Object.keys(referenceDetails);

const IVA_RATE = 0.19; // 19%

type SealantType = 'Sellante semi - brigth 1/ 4 galon' | 'Sellante shyny 1/4 galon';
type SealantFinish = 'semibright' | 'shiny';

interface QuoteItem {
  id: number;
  reference: string;
  sqMeters: number;
  sheets: number;
  calculationMode: 'sqm' | 'sheets' | 'units';
  pricePerSheet: number;
}

const sealantPerformance = {
    'Sellante semi - brigth 1/ 4 galon': { clay: 10, other: 18 },
    'Sellante shyny 1/4 galon': { clay: 10, other: 18 },
};

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


function AdhesiveReferenceTable() {
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Tabla de Referencia de Insumos</DialogTitle>
                <CardDescription>Rendimiento estimado de adhesivos y sellantes por tipo de referencia.</CardDescription>
            </DialogHeader>
             <div className="space-y-6 py-4">
                <div>
                    <h3 className="font-semibold mb-2">Adhesivo (Rendimiento por unidad)</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Línea de Producto</TableHead>
                                <TableHead>Adhesivo por Lámina (1.22x0.61)</TableHead>
                                <TableHead>Adhesivo por Lámina (2.44x1.22)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Pizarra, Cuarcitas, Mármol (excepto Himalaya), Clay</TableCell>
                                <TableCell>0.5 unidades</TableCell>
                                <TableCell>2 unidades</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Mármol (Línea Himalaya)</TableCell>
                                <TableCell>1.5 unidades</TableCell>
                                <TableCell>3.5 unidades</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Concreto</TableCell>
                                <TableCell>1.8 unidades</TableCell>
                                <TableCell>3 unidades</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Línea Translúcida</TableCell>
                                <TableCell>0.5 unidades (Adhesivo Translúcido)</TableCell>
                                <TableCell>2 unidades (Adhesivo Translúcido)</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Línea Metales</TableCell>
                                <TableCell>1.5 unidades (2.44x0.61)</TableCell>
                                <TableCell>3 unidades (2.44x1.22)</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Línea Madera</TableCell>
                                <TableCell>0.5 unidades (0.15x2.44)</TableCell>
                                <TableCell>N/A</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Sellante (Rendimiento por M²)</h3>
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
                        </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground mt-2">
                       Nota: Se recomienda el uso del sellante semi-brillante para un acabado óptimo y duradero.
                    </p>
                </div>
            </div>
        </DialogContent>
    );
}

export default function StoneflexCalculatorPage() {
  const searchParams = useSearchParams();
  const context = useContext(InventoryContext);
  if (!context) throw new Error("Inventory context not found");
  const { addQuote } = context;

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; } | null>(null);

  const [sqMeters, setSqMeters] = useState<number | string>(1);
  const [sheets, setSheets] = useState<number | string>(1);
  const [discount, setDiscount] = useState<number | string>(0);
  const [wastePercentage, setWastePercentage] = useState<number | string>(0);
  const [includeAdhesive, setIncludeAdhesive] = useState(true);
  const [includeSealant, setIncludeSealant] = useState(true);
  const [sealantFinish, setSealantFinish] = useState<SealantFinish>('semibright');
  const [calculationMode, setCalculationMode] = useState<'sqm' | 'sheets'>('sqm');
  const [laborCost, setLaborCost] = useState(0);
  const [transportationCost, setTransportationCost] = useState(0);
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [trm, setTrm] = useState<number | string>('');
  const [trmLoading, setTrmLoading] = useState(false);
  const { toast } = useToast();
  const {currentUser} = useUser();

  const [supplyReference, setSupplyReference] = useState('');
  const [supplyUnits, setSupplyUnits] = useState<number | string>(1);
  const [notes, setNotes] = useState('');
  
  // New state for commercial terms
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [offerValidity, setOfferValidity] = useState('');

  const isDistributor = useMemo(() => currentUser.roles.includes('Distribuidor'), [currentUser.roles]);
  const isPartner = useMemo(() => currentUser.roles.includes('Partner'), [currentUser.roles]);
  
  const viewMode = useMemo(() => {
    if (isDistributor) return 'distributor';
    // Partners have the full view, same as internal
    return 'internal';
  }, [isDistributor]);


  const referenceOptions = useMemo(() => {
    return allReferences.map(ref => ({ value: ref, label: `${ref} (${productDimensions[ref as keyof typeof productDimensions] || 'N/A'})` }));
  }, []);

  const supplyOptions = useMemo(() => {
    const stoneflexSupplies = Object.keys(initialInventoryData.StoneFlex?.Insumos || {});
    const starwoodSupplies = Object.keys(initialInventoryData.Starwood?.Insumos || {});
    const allSupplies = [...stoneflexSupplies, ...starwoodSupplies];
    return allSupplies.map(ref => ({ value: ref, label: ref }));
  }, []);

  useEffect(() => {
    const customerNameParam = searchParams.get('customerName');
    if (customerNameParam && viewMode === 'internal') {
        setCustomerName(decodeURIComponent(customerNameParam));
    }
  }, [searchParams, viewMode]);

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
    const dimension = productDimensions[ref as keyof typeof productDimensions];
    if (!dimension) return 0;
    
    if (dimension.includes('Caja')) {
        const sqmMatch = dimension.match(/(\d[.,]?\d*)\s*M²/i);
        if (sqmMatch) return parseFloat(sqmMatch[1].replace(',', '.'));
        return 0;
    }

    const matches = dimension.match(/(\d[.,]?\d*)/g);
    if (matches && matches.length >= 2) {
      const width = parseFloat(matches[0].replace(',', '.'));
      const height = parseFloat(matches[1].replace(',', '.'));
      return width * height;
    }
    return 1; // Default
  }

  const parseDecimal = (value: string | number) => {
    if (typeof value === 'number') return value;
    return parseFloat(value.toString().replace(',', '.')) || 0;
  };
  
  const handleLocationChange = (newLocation: { lat: number; lng: number; address: string } | null) => {
    setLocation(newLocation);
    if (newLocation) {
        setCustomerAddress(newLocation.address);
    }
  }

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

    const pricePerSheet = initialProductPrices[reference as keyof typeof initialProductPrices] || 0;

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
      pricePerSheet: initialProductPrices[supplyReference as keyof typeof initialProductPrices] || 0
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
    let isWarrantyVoid = false;
    let manualSuppliesCost = 0;
    let totalSqmClay = 0;
    let totalSqmOther = 0;

    const trmValue = currency === 'USD' ? parseDecimal(trm) : 1;
    if (currency === 'USD' && trmValue === 0) return null;
    
    const convert = (value: number) => currency === 'USD' ? value / trmValue : value;
    const discountValue = parseDecimal(discount);
    
    const adhesivePriceCOP = initialProductPrices['Adhesivo'] || 0;
    const translucentAdhesivePriceCOP = initialProductPrices['ADHESIVO TRASLUCIDO'] || 0;

    const detailedItems = quoteItems.map(item => {
      const details = referenceDetails[item.reference as keyof typeof referenceDetails];
      const pricePerSheetCOP = item.pricePerSheet;
      const hasPrice = pricePerSheetCOP > 0;
      
      if (item.calculationMode === 'units') { // Manual Supply
          const itemCost = hasPrice ? convert(pricePerSheetCOP * item.sheets) : 0;
          if (hasPrice) manualSuppliesCost += itemCost;
          return {...item, itemTotal: itemCost, pricePerSheet: hasPrice ? convert(pricePerSheetCOP) : 0, hasPrice};
      }

      if (!details) return {...item, itemTotal: 0, pricePerSheet: 0, hasPrice: false};
      
      if (hasPrice) {
        if (details.line === 'Clay') {
            totalSqmClay += item.sqMeters;
        } else {
            totalSqmOther += item.sqMeters;
        }
      }

      const calculatedSheets = item.sheets;
      const productCost = hasPrice ? convert(pricePerSheetCOP * calculatedSheets) : 0;
      
      if (hasPrice) totalProductCost += productCost;
      
      if (includeAdhesive && details.line !== '3D' && hasPrice) {
          let adhesivePerSheet = 0;
          const dimension = productDimensions[item.reference as keyof typeof productDimensions] || '';
          const isStandardSize = dimension.includes('1.22x0.61') || dimension.includes('1.20*0.60');
          const isMetalStandardSize = dimension.includes('2.44x0.61');
          const isXLSize = dimension.includes('2.44x1.22') || dimension.includes('2.95*1.20') || dimension.includes('2.90*0.56');
          const isWoodSize = dimension.includes('0.15x2.44');

          if (details.line === 'Translucida') {
              adhesivePerSheet = isStandardSize ? 0.5 : 2;
              totalTranslucentAdhesiveUnits += calculatedSheets * adhesivePerSheet;
          } else {
              if (details.line === 'Pizarra' || details.line === 'Cuarcitas' || (details.line === 'Mármol' && !item.reference.includes('Himalaya')) || details.line === 'Clay') {
                  adhesivePerSheet = isStandardSize ? 0.5 : 2;
              } else if (details.line === 'Mármol' && item.reference.includes('Himalaya')) {
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
      
      if (!includeAdhesive || !includeSealant) {
        isWarrantyVoid = true;
      }
      
      const itemSubtotal = productCost;

      return {...item, itemTotal: itemSubtotal, pricePerSheet: hasPrice ? convert(pricePerSheetCOP) : 0, hasPrice };
    });
    
    // Adhesive Cost Calculation
    const totalStandardAdhesiveCost = convert(Math.ceil(totalStandardAdhesiveUnits) * adhesivePriceCOP);
    const totalTranslucentAdhesiveCost = convert(Math.ceil(totalTranslucentAdhesiveUnits) * translucentAdhesivePriceCOP);
    
    // Sealant Cost Calculation
    let totalSealantCost = 0;
    let sealantQuarters = 0;
    let sealantQuarterType: SealantType | null = null;
    
    if (includeSealant) {
        const quarterRef = sealantFinish === 'semibright' ? 'Sellante semi - brigth 1/ 4 galon' : 'Sellante shyny 1/4 galon';
        const quarterPriceCOP = initialProductPrices[quarterRef as keyof typeof initialProductPrices] || 0;
        
        if (quarterPriceCOP > 0) {
            const quarterPerf = sealantPerformance[quarterRef as SealantType];
            
            const quartersForClay = totalSqmClay > 0 ? Math.ceil(totalSqmClay / quarterPerf.clay) : 0;
            const quartersForOther = totalSqmOther > 0 ? Math.ceil(totalSqmOther / quarterPerf.other) : 0;
            
            sealantQuarters = quartersForClay + quartersForOther;

            if (sealantQuarters > 0) {
                totalSealantCost = convert(sealantQuarters * quarterPriceCOP);
                sealantQuarterType = quarterRef as SealantType;
            }
        }
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
      sealantQuarters,
      sealantQuarterPrice: sealantQuarterType ? convert(initialProductPrices[sealantQuarterType] || 0) : 0,
      sealantQuarterType,
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

  const handleSaveQuote = () => {
    if (!quote) return;
     addQuote({
        quoteNumber: `V-100-${Date.now().toString().slice(-4)}`,
        calculatorType: 'StoneFlex',
        customerName: customerName,
        advisorName: currentUser.name,
        creationDate: new Date().toISOString(),
        total: quote.totalCost,
        currency: currency,
        items: quote.items.map(i => ({ reference: i.reference, quantity: i.sheets, price: i.pricePerSheet })),
        details: quote,
    });
  }

  const handleSelectCustomer = (customer: Customer | null) => {
    if (customer) {
        setCustomerName(customer.name);
        setCustomerEmail(customer.email);
        setCustomerPhone(customer.phone);
        setCustomerAddress(customer.address);
        setCustomerTaxId(customer.taxId || '');
        if (customer.address) {
            setLocation({ address: customer.address, lat: 0, lng: 0 }); // Posición no es crucial aquí
        } else {
            setLocation(null);
        }
    } else {
        // Reset fields if 'new customer' is chosen or cleared
        setCustomerEmail('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerTaxId('');
        setLocation(null);
    }
  };

  const generatePdfContent = (doc: jsPDF, quote: NonNullable<ReturnType<typeof calculateQuote>>, pageWidth: number) => {
    const today = new Date();
    const quoteNumber = `V - 100 - ${Math.floor(Math.random() * 9000) + 1000}`;

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
    doc.text(`Ref: Cotización Stoneflex - ${quoteNumber}`, 14, startY);
    startY += 8;

    doc.setFont('helvetica', 'normal');
    doc.text('Es grato para nosotros poner a su consideración la siguiente propuesta:', 14, startY);
    startY += 8;
    
    const head = [['Item', 'Descripción', 'Unidad', 'M²', 'Cantidad', 'Valor Unitario', '%Dto.', 'Valor Total']];
    const body: any[][] = [];

    quote.items.forEach((item, index) => {
        const dimensionText = productDimensions[item.reference as keyof typeof productDimensions] ? `(${productDimensions[item.reference as keyof typeof productDimensions]})` : '';
        const title = item.calculationMode === 'units' ? item.reference : `${item.reference} ${dimensionText}`;
        const sqMetersText = item.calculationMode === 'sqm' ? item.sqMeters.toFixed(2) : '';
        const qty = item.sheets.toFixed(2);
        const price = item.hasPrice ? (item.pricePerSheet).toFixed(2) : '0.00';
        const total = item.hasPrice ? (item.itemTotal).toFixed(2) : '0.00';
        body.push([(index + 1).toString(), title, 'UND', sqMetersText, qty, formatNumber(price), '0.00', formatNumber(total)]);
    });

    if (quote.totalStandardAdhesiveCost > 0) {
        body.push([(body.length + 1).toString(), 'Adhesivo (Estándar)', 'UND', '', quote.totalStandardAdhesiveUnits, formatNumber(quote.adhesivePrice), '0.00', formatNumber(quote.totalStandardAdhesiveCost)]);
    }
    if (quote.totalTranslucentAdhesiveCost > 0) {
        body.push([(body.length + 1).toString(), 'Adhesivo (Translúcido)', 'UND', '', quote.totalTranslucentAdhesiveUnits, formatNumber(quote.translucentAdhesivePrice), '0.00', formatNumber(quote.totalTranslucentAdhesiveCost)]);
    }
    if (quote.totalSealantCost > 0 && quote.sealantQuarters > 0) {
        body.push([(body.length + 1).toString(), 'Sellante (1/4 de galón)', 'UND', '', quote.sealantQuarters, formatNumber(quote.sealantQuarterPrice), '0.00', formatNumber(quote.totalSealantCost)]);
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
    const summaryData: (string | number)[][] = [
        ['Total Bruto', formatNumber(quote.subtotal + quote.totalDiscountAmount)],
        ['IVA', formatNumber(quote.ivaAmount)],
    ];

    if (quote.laborCost > 0) {
        summaryData.push(['Mano de Obra', formatCurrency(quote.laborCost)]);
    }
    if (quote.transportationCost > 0) {
        summaryData.push(['Transporte', formatCurrency(quote.transportationCost)]);
    }
    
    summaryData.push(['Total a Pagar', formatCurrency(quote.totalCost)]);

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
    
    const stoneflexLogoData = await getImageBase64('/imagenes/logos/Logo-StoneFlex-v-color.png');
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');

    if (stoneflexLogoData) {
        const logoWidth = 25;
        const logoHeight = stoneflexLogoData.height * (logoWidth / stoneflexLogoData.width);
        doc.addImage(stoneflexLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    if (latinLogoData) {
        const logoWidth = 30;
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        doc.addImage(latinLogoData.base64, 'PNG', pageWidth - logoWidth - 14, 10, logoWidth, logoHeight);
    }
    
    generatePdfContent(doc, quote, pageWidth);
    doc.save(`Cotizacion_${customerName || 'Cliente'}_Stoneflex.pdf`);
};

  
  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  const handleExportXLSX = () => {
    if (!quote) return;

    const dataToExport = quote.items.map(item => ({
        'Referencia': item.reference,
        'Modo Cálculo': item.calculationMode,
        'M²': item.sqMeters > 0 ? item.sqMeters.toFixed(2) : '',
        'Láminas/Unidades': item.sheets,
        'Precio Unitario': item.hasPrice ? formatCurrency(item.pricePerSheet) : 'Precio Pendiente',
        'Costo Total': item.hasPrice ? formatCurrency(item.itemTotal) : 'N/A'
    }));

    // Add supplies to the export
    if (quote.totalStandardAdhesiveCost > 0) {
        dataToExport.push({ 'Referencia': 'Adhesivo (Estándar)', 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.totalStandardAdhesiveUnits, 'Precio Unitario': formatCurrency(quote.adhesivePrice), 'Costo Total': formatCurrency(quote.totalStandardAdhesiveCost) });
    }
     if (quote.totalTranslucentAdhesiveCost > 0) {
        dataToExport.push({ 'Referencia': 'Adhesivo (Translúcido)', 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.totalTranslucentAdhesiveUnits, 'Precio Unitario': formatCurrency(quote.translucentAdhesivePrice), 'Costo Total': formatCurrency(quote.totalTranslucentAdhesiveCost) });
    }
     if (quote.totalSealantCost > 0 && quote.sealantQuarters > 0) {
        dataToExport.push({ 'Referencia': `Sellante (1/4 de galón)`, 'Modo Cálculo': 'Automático', 'M²': '', 'Láminas/Unidades': quote.sealantQuarters, 'Precio Unitario': formatCurrency(quote.sealantQuarterPrice), 'Costo Total': formatCurrency(quote.totalSealantCost) });
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
    if (viewMode === 'internal') {
        message += `*Cliente:* ${customerName || 'N/A'}\n`;
        if (customerTaxId) message += `*NIT/Cédula:* ${customerTaxId}\n`;
        if (customerEmail) message += `*Correo:* ${customerEmail}\n`;
        if (customerPhone) message += `*Teléfono:* ${customerPhone}\n`;
    }


    message += `*Moneda:* ${currency}\n`;
    if (currency === 'USD') {
        message += `*TRM usada:* ${formatCurrency(parseDecimal(trm))}\n`;
    }

    if (viewMode === 'internal') {
       message += `*Fecha de Cotización:* ${quote.creationDate.toLocaleDateString('es-CO')}\n`;
       message += `*Válida hasta:* ${quote.expiryDate}\n\n`;
    }
    
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
    if (quote.totalSealantCost > 0 && quote.sealantQuarters > 0) {
        message += `- Costo Sellante (1/4 de galón) (${quote.sealantQuarters} u. @ ${formatCurrency(quote.sealantQuarterPrice)}/u.): ${formatCurrency(quote.totalSealantCost)}\n`;
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
        message += `*Nota Importante:* La no inclusión de adhesivo o sellante puede anular la garantía del producto.\n`;
    }
    message += `_Esta es una cotización preliminar realizada sin confirmación de medidas y el costo final puede variar. No incluye costos de instalación ni envío si no se especifica._`;

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
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Calculadora de Cotizaciones - StoneFlex</CardTitle>
                <CardDescription>
                  Añada productos y estime el costo total de la cotización.
                </CardDescription>
            </div>
            <Image src="/imagenes/logos/Logo-StoneFlex-v-color.png" alt="StoneFlex Logo" width={80} height={80} className="object-contain"/>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'internal' && (
            <>
                <CustomerSelector
                    onCustomerSelect={handleSelectCustomer}
                    onNameChange={setCustomerName}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-tax-id">NIT o Cédula</Label>
                        <Input
                            id="customer-tax-id"
                            value={customerTaxId}
                            onChange={(e) => setCustomerTaxId(e.target.value)}
                            placeholder="Ingrese el NIT o cédula..."
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customer-phone">Teléfono</Label>
                        <Input
                            id="customer-phone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Ingrese el teléfono..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customer-email">Correo Electrónico</Label>
                        <Input
                            id="customer-email"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="Ingrese el correo..."
                        />
                    </div>
                </div>
                 <div className="space-y-2 col-span-full">
                    <Label htmlFor="location">Dirección / Ciudad</Label>
                    <LocationCombobox value={location} onChange={handleLocationChange} city={customerAddress} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Moneda de la Cotización</Label>
                        <div className="flex items-center gap-4">
                            <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'COP' | 'USD')} className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="COP" id="currency-cop" />
                                <Label htmlFor="currency-cop" className="font-normal">COP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="USD" id="currency-usd" />
                                <Label htmlFor="currency-usd" className="font-normal">USD</Label>
                            </div>
                            </RadioGroup>
                            {currency === 'USD' && (
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="trm-input" className="text-sm shrink-0">TRM:</Label>
                                    <Input
                                        id="trm-input"
                                        type="text"
                                        value={trm}
                                        onChange={handleDecimalInputChange(setTrm)}
                                        className="w-full h-8"
                                        placeholder={trmLoading ? 'Cargando...' : ''}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Separator />
            </>
        )}
         
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
                            <span className="font-medium">M² por Lámina:</span> {getSqmPerSheet(reference).toFixed(2)} M²
                        </div>
                     )}
                 </div>
                 <div className="space-y-2">
                    <Label>Calcular por</Label>
                    <RadioGroup defaultValue="sqm" value={calculationMode} onValueChange={(value) => setCalculationMode(value as 'sqm' | 'sheets')} className="flex items-center gap-4 pt-2">
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
            <h3 className="text-lg font-medium mb-2">Insumos y Accesorios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-4">
                     <h4 className="font-medium mb-4">Insumos (Automático)</h4>
                     <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="include-adhesive" checked={includeAdhesive} onCheckedChange={(checked) => setIncludeAdhesive(Boolean(checked))} />
                            <Label htmlFor="include-adhesive">Incluir Adhesivo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="include-sealant" checked={includeSealant} onCheckedChange={(checked) => setIncludeSealant(Boolean(checked))} />
                            <Label htmlFor="include-sealant">Incluir Sellante</Label>
                        </div>
                        {includeSealant && (
                            <div className="mt-4 space-y-2 pl-6">
                                <Label>Acabado del Sellante</Label>
                                <RadioGroup value={sealantFinish} onValueChange={(v) => setSealantFinish(v as SealantFinish)} className="flex gap-4 pt-2">
                                    <RadioGroupItem value="semibright" id="finish-semi" />
                                    <Label htmlFor="finish-semi" className="font-normal">Semi-Brillante</Label>
                                    <RadioGroupItem value="shiny" id="finish-shiny" />
                                    <Label htmlFor="finish-shiny" className="font-normal">Brillante</Label>
                                </RadioGroup>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                                            <HelpCircle className="mr-1 h-3 w-3" />
                                            ¿No estás seguro? Ver tabla de rendimiento
                                        </Button>
                                    </DialogTrigger>
                                    <AdhesiveReferenceTable />
                                </Dialog>
                            </div>
                        )}
                    </div>
                </Card>
                <Card className="p-4">
                     <h4 className="font-medium mb-4">Insumos (Adicional)</h4>
                     <div className="space-y-4">
                         <div className="grid grid-cols-[2fr_1fr] gap-2 items-end">
                            <div className="space-y-1">
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
                             <div className="space-y-1">
                                <Label htmlFor="supply-units-input">Unidades</Label>
                                <Input
                                  id="supply-units-input"
                                  type="number"
                                  value={supplyUnits}
                                  onChange={(e) => setSupplyUnits(e.target.value)}
                                  className="w-full"
                                  min="1"
                                />
                              </div>
                          </div>
                           <Button onClick={handleAddSupply} disabled={!supplyReference} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar Insumo
                          </Button>
                     </div>
                </Card>
            </div>
          </div>
         
         {quote && (
          <Card className="bg-primary/5 mt-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Resumen de la Cotización</CardTitle>
                      {viewMode === 'internal' && (
                        <CardDescription>
                            Cliente: {customerName || 'N/A'} | Válida hasta {quote.expiryDate} | Moneda: {currency}
                        </CardDescription>
                      )}
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
                      {item.hasPrice && viewMode === 'internal' && (
                       <p className="text-sm text-muted-foreground font-medium">
                        Precio/Unidad: {formatCurrency(item.pricePerSheet)}
                       </p>
                      )}
                      {currency !== 'USD' && item.calculationMode !== 'units' && viewMode === 'internal' && (
                         <div className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`price-${item.id}`} className="text-xs">Precio/Lámina (COP)</Label>
                             <Input 
                                id={`price-${item.id}`}
                                type="text"
                                value={new Intl.NumberFormat('es-CO').format(initialProductPrices[item.reference as keyof typeof initialProductPrices] || 0)}
                                onChange={(e) => handleItemPriceChange(item.id, parseDecimal(e.target.value.replace(/[^0-9]/g, '')))}
                                className="h-7 w-28"
                            />
                         </div>
                      )}
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{item.hasPrice ? formatCurrency(item.itemTotal) : <span className="text-destructive">Precio Pendiente</span>}</p>
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
                  {quote.totalSealantCost > 0 && quote.sealantQuarters > 0 && (
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Sellante (1/4 de galón) ({quote.sealantQuarters} u. @ {formatCurrency(quote.sealantQuarterPrice)}/u.)</span>
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
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Especifique cualquier detalle, condición o nota importante para esta cotización..."
                            />
                        </div>
                    </div>
                </>
              )}

              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  {viewMode === 'internal' && (
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
                  Costo Total Estimado: {formatCurrency(quote.totalCost)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground pt-2 space-y-1 text-center">
                  <p>
                    Esta es una cotización preliminar realizada sin confirmación de medidas y el costo final puede variar. No incluye costos de instalación ni envío si no se especifica.
                  </p>
                  {currency === 'USD' && (
                    <p className="font-semibold">
                      Nota: La TRM (Tasa Representativa del Mercado) puede variar diariamente, lo cual podría afectar el valor final de esta cotización al momento de la facturación.
                    </p>
                  )}
                  {quote.isWarrantyVoid && (
                    <p className="font-semibold text-destructive">
                      La no inclusión de adhesivo o sellante puede anular la garantía del producto.
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
