'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  sourceId: string; // Container ID or warehouse location ('Bodega' / 'Zona Franca')
  advisor: string;
  quoteNumber: string;
  status: 'En espera de validación' | 'Validada' | 'Rechazada';
  source: 'Contenedor' | 'Bodega' | 'Zona Franca';
}

const initialInventoryData = {
  StoneFlex: {
    'Clay': {
      'CUT STONE 120 X 60': { bodega: 15, zonaFranca: 352, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TRAVERTINO': { bodega: 14, zonaFranca: 304, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO ENCOFRADO': { bodega: 1, zonaFranca: 77, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TAPIA NEGRA': { bodega: 2, zonaFranca: 23, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'Insumos': {
      'ADHESIVO TRASLUCIDO': { bodega: 87, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'POLIURETANO STONEFLEX': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SEMI - BRIGHT GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SEMI - BRIGTH 1/ 4 GALON': { bodega: 9, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE SHYNY 1/4 GALON': { bodega: 2, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'Estándar': {
      'BLACK 1.22 X 0.61': { bodega: 217, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'KUND MULTY 1.22 X 0.61': { bodega: 310, zonaFranca: 180, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'TAN 1.22 X 0.61': { bodega: 233, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'INDIAN AUTUMN 1.22 X 0.61': { bodega: 189, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'BURNING FOREST 1.22 X 0.61': { bodega: 227, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'COPPER 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'JEERA GREEN 1.22 X 0.61': { bodega: 689, zonaFranca: 270, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'SILVER SHINE 1.22 X 0.61': { bodega: 752, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE GOLD 1.22 X 0.61': { bodega: 661, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'STEEL GRAY 1.22 X 0.61': { bodega: 875, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CARRARA 1.22 X 0.61': { bodega: 738, zonaFranca: 300, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CRYSTAL WHITE 1.22 X 0.61': { bodega: 14, zonaFranca: 0, separadasBodega: 10, separadasZonaFranca: 0, muestras: 1 },
      'HIMALAYA GOLD 1.22X0.61 MTS': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MINT WHITE 1.22 X 0.61': { bodega: 15, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO BLANCO 1.22 X 0.61': { bodega: 393, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO GRIS 1.22 X 0.61': { bodega: 592, zonaFranca: 380, separadasBodega: 0, separadasZonaFranca: 56, muestras: 1 },
      'CONCRETE WITH HOLES 1.22 X 0.61': { bodega: 62, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'CONCRETO GRIS MEDIUM 1.22 X 0.61': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CORTEN STELL - 2.44 X 0.61': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61': { bodega: 77, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61': { bodega: 35, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61': { bodega: 61, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'MADERA NOGAL 0.15 X 2.44 MTS': { bodega: 540, zonaFranca: 460, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'MADERA TEKA 0.15 X 2.44 MTS': { bodega: 137, zonaFranca: 600, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      '3D ADHESIVO - 0,90 M2 - BLACK': { bodega: 206, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC': { bodega: 277, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      '3D ADHESIVO - 0,90 M2 - TAN': { bodega: 177, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 1 },
      'PANEL 3D - INDIAN AUTUMN 1.22 X 0.61': { bodega: 13, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PANEL 3D - TAN 1.22 X 0.61': { bodega: 5, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
    'XL': {
      'BLACK 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'TAN 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'kUND MULTY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INDIAN AUTUMN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'COPPER 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'BURNING FOREST 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'JEERA GREEN 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SILVER SHINE GOLD 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'STEEL GREY 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO BLANCO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO GRIS 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO MEDIO 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CONCRETO WITH HOLES 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CARRARA 2.44 X 1.22': { bodega: 60, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CRYSTAL WHITE 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'HIMALAYA GOLD 2.44 X 1.22': { bodega: 47, zonaFranca: 0, separadasBodega: 8, separadasZonaFranca: 0, muestras: 0 },
      'CORTEN STEEL 2.44 X 1.22': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    },
  },
  Starwood: {
    'Productos': {
      'PERGOLA 9x4 - 3 MTS COFFEE': { bodega: 64, zonaFranca: 144, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9x4 - 3 MTS CHOCOLATE': { bodega: 142, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK ESTANDAR 14.5 CM X 2.2 CM X 2.21 MTS COFFEE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN': { bodega: 193, zonaFranca: 620, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR EB - LG': { bodega: 60, zonaFranca: 126, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS CAMEL': { bodega: 465, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS COFFEE': { bodega: 613, zonaFranca: 720, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6.8x2.5 - 3 MTS CHOCOLATE': { bodega: 166, zonaFranca: 800, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'CLIP PLASTICO PARA DECK WPC': { bodega: 166, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DURMIENTE PLASTICO 3x3 - 2.90 MTS': { bodega: 228, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9x4 - 3 MTS CAMEL': { bodega: 193, zonaFranca: 520, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10x5 - 3 MTS CAMEL': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 16X8 - 3 MTS CAMEL': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DECK 13.5x2.5 TECK': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 10X5 - 5.60 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 9X4 CM X 4 MTS CHOCOLATE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DURMIENTE PLASTICO 6 X 6 - 1 MTS': { bodega: 34, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'PERGOLA 16X8 - 3 MTS CHOCOLATE': { bodega: 6, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DAILY CLEAN': { bodega: 10, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'INTENSIVE CLEAN': { bodega: 17, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE WPC 1 GALON': { bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'SELLANTE WPC 1/4 GALON': { bodega: 25, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'DAILY CLEAN GALON': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL ROBLE': { bodega: 37, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL MAPLE': { bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL NEGRO': { bodega: 52, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'REMATE WALL PANEL GRIS': { bodega: 51, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'BOCEL DECORATIVO BLANCO': { bodega: 287, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
      'LISTON 6X4 - 3 MTS CHOCOLATE': { bodega: 49, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: 0 },
    }
  },
};


// Mock data, in real app this would come from the transit page/state
const productsInTransit = [
    { value: 'CUT STONE 120 X 60', label: 'CUT STONE 120 X 60', available: 200, sourceId: 'MSCU1234567' },
    { value: 'TRAVERTINO', label: 'TRAVERTINO', available: 150, sourceId: 'MSCU1234567' },
    { value: 'BLACK 1.22 X 0.61', label: 'BLACK 1.22 X 0.61', available: 500, sourceId: 'CMAU7654321' },
];

const getAllInventoryProducts = () => {
    const products: { name: string, data: any }[] = [];
    for (const brand in initialInventoryData) {
        const subcategories = initialInventoryData[brand as keyof typeof initialInventoryData];
        for (const subCategory in subcategories) {
            const productList = subcategories[subCategory];
            for (const productName in productList) {
                products.push({
                    name: productName,
                    data: productList[productName as keyof typeof productList],
                });
            }
        }
    }
    return products;
}

const initialReservations: Reservation[] = [
    { id: 'RES-001', customer: 'Constructora XYZ', product: 'CUT STONE 120 X 60', quantity: 50, sourceId: 'MSCU1234567', advisor: 'Jane Smith', quoteNumber: 'COT-2024-001', status: 'En espera de validación', source: 'Contenedor' },
    { id: 'RES-002', customer: 'Diseños Modernos', product: 'CONCRETO GRIS 1.22 X 0.61', quantity: 10, sourceId: 'Bodega', advisor: 'John Doe', quoteNumber: 'COT-2024-002', status: 'En espera de validación', source: 'Bodega' },
    { id: 'RES-003', customer: 'Arquitectura Andina', product: 'KUND MULTY 1.22 X 0.61', quantity: 25, sourceId: 'Zona Franca', advisor: 'Jane Smith', quoteNumber: 'COT-2024-003', status: 'Validada', source: 'Zona Franca' },
    { id: 'RES-004', customer: 'Hogar Futuro', product: 'TAN 1.22 X 0.61', quantity: 30, sourceId: 'Bodega', advisor: 'John Doe', quoteNumber: 'COT-2024-004', status: 'Rechazada', source: 'Bodega' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [reservationSource, setReservationSource] = useState<'Contenedor' | 'Bodega' | 'Zona Franca'>('Contenedor');
  const { toast } = useToast();

  const inventoryProducts = useMemo(() => getAllInventoryProducts(), []);

  const productOptions = useMemo(() => {
    switch(reservationSource) {
        case 'Contenedor':
            return productsInTransit.map(p => ({ ...p, label: `${p.label}`}));
        case 'Bodega':
            return inventoryProducts.map(p => ({ value: p.name, label: p.name, available: p.data.bodega - p.data.separadasBodega, sourceId: 'Bodega' }));
        case 'Zona Franca':
            return inventoryProducts.map(p => ({ value: p.name, label: p.name, available: p.data.zonaFranca - p.data.separadasZonaFranca, sourceId: 'Zona Franca' }));
        default:
            return [];
    }
  }, [reservationSource, inventoryProducts]);
  
  const pendingReservations = useMemo(() => reservations.filter(r => 
    r.status === 'En espera de validación' &&
    (r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [reservations, searchTerm]);

  const historyReservations = useMemo(() => reservations.filter(r => 
    r.status !== 'En espera de validación' &&
    (r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [reservations, searchTerm]);

  const handleCreateReservation = () => {
    if (!customerName || !productName || quantity <= 0 || !quoteNumber) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos.'});
        return;
    }

    const productInfo = productOptions.find(p => p.value === productName);
    if (!productInfo) {
        toast({ variant: 'destructive', title: 'Error', description: 'Producto no encontrado.'});
        return;
    }
    
    if(quantity > productInfo.available) {
        toast({ variant: 'destructive', title: 'Error de Stock', description: `La cantidad solicitada (${quantity}) excede la disponible (${productInfo.available}).`});
        return;
    }

    const newReservation: Reservation = {
        id: `RES-00${reservations.length + 1}`,
        customer: customerName,
        product: productName,
        quantity,
        sourceId: productInfo.sourceId,
        advisor: 'Usuario Admin', // Mock current user
        quoteNumber: quoteNumber,
        status: 'En espera de validación',
        source: reservationSource,
    };

    setReservations([...reservations, newReservation]);
    setCustomerName('');
    setProductName('');
    setQuantity(0);
    setQuoteNumber('');
    setIsNewReservationDialogOpen(false);
    toast({ title: 'Éxito', description: 'Reserva creada y pendiente de validación.' });
  };
  
  const getSelectedProductInfo = () => {
    if (!productName) return null;
    const product = productOptions.find(p => p.value === productName);
    if (!product) return null;
    
    let sourceText = product.sourceId;
    if (reservationSource === 'Contenedor') {
        sourceText = `Contenedor ${product.sourceId}`;
    } else {
        sourceText = reservationSource;
    }

    return `Disponible: ${product.available} en ${sourceText}`;
  };
  
  const getStatusBadgeVariant = (status: Reservation['status']) => {
    switch (status) {
        case 'Validada': return 'default';
        case 'En espera de validación': return 'secondary';
        case 'Rechazada': return 'destructive';
    }
  }
  
  const renderOrigin = (reservation: Reservation) => {
    if (reservation.source === 'Contenedor') {
      return `Contenedor (${reservation.sourceId})`;
    }
    return reservation.source;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas de Productos</CardTitle>
            <CardDescription>Cree y gestione las reservas de productos en tránsito o en bodega.</CardDescription>
          </div>
          <Dialog open={isNewReservationDialogOpen} onOpenChange={setIsNewReservationDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Reserva
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Crear Nueva Reserva</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label>Origen del Producto</Label>
                        <RadioGroup value={reservationSource} onValueChange={(value) => setReservationSource(value as 'Contenedor' | 'Bodega' | 'Zona Franca')} className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Contenedor" id="source-container" />
                            <Label htmlFor="source-container">Contenedor en Tránsito</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Bodega" id="source-warehouse" />
                            <Label htmlFor="source-warehouse">Bodega</Label>
                          </div>
                           <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Zona Franca" id="source-free-zone" />
                            <Label htmlFor="source-free-zone">Zona Franca</Label>
                          </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label># Cotización</Label>
                        <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="ej. COT-2024-001" />
                    </div>
                    <div className="space-y-2">
                        <Label>Nombre del Cliente</Label>
                        <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={productName}
                            onValueChange={setProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontraron productos"
                        />
                        <p className="text-sm text-muted-foreground">{getSelectedProductInfo()}</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleCreateReservation}>Crear Reserva</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por cliente, producto o cotización..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          <Card>
            <CardHeader>
                <CardTitle>Reservas Pendientes de Validación</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Cotización</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.quoteNumber}</TableCell>
                      <TableCell>{reservation.customer}</TableCell>
                      <TableCell>{reservation.product}</TableCell>
                      <TableCell>{reservation.quantity}</TableCell>
                      <TableCell>{renderOrigin(reservation)}</TableCell>
                      <TableCell>{reservation.advisor}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(reservation.status)}>
                            {reservation.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingReservations.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No se encontraron reservas pendientes.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Historial de Reservas</CardTitle>
            <CardDescription>Reservas que ya han sido validadas o rechazadas.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead># Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.quoteNumber}</TableCell>
                  <TableCell>{reservation.customer}</TableCell>
                  <TableCell>{reservation.product}</TableCell>
                  <TableCell>{reservation.quantity}</TableCell>
                  <TableCell>{renderOrigin(reservation)}</TableCell>
                  <TableCell>{reservation.advisor}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                        {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {historyReservations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No hay registros en el historial.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
