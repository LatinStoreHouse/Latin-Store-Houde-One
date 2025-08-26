
'use client';

import React, { useState, useMemo, useContext } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, PackagePlus, FileDown, AlertTriangle, TrendingUp, UserPlus, Send } from 'lucide-react';
import { InventoryContext } from '@/context/inventory-context';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/app/(main)/layout';
import { roles } from '@/lib/roles';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Suggestion {
  productName: string;
  currentStock: number;
  monthlyMovement: number;
  reason: 'Stock Bajo' | 'Alta Demanda';
}

interface AdvisorSuggestion {
    id: number;
    productName: string;
    quantity: number;
    reason: string;
    advisorName: string;
}

const initialAdvisorSuggestions: AdvisorSuggestion[] = [
    { id: 1, productName: 'Carrara XL', quantity: 50, reason: 'Varios clientes de proyectos grandes lo han solicitado y no tenemos stock.', advisorName: 'Jane Smith' },
    { id: 2, productName: 'Madera teka', quantity: 100, reason: 'Se agotó muy rápido el último lote, alta demanda en la zona.', advisorName: 'John Doe' },
];

export default function PurchaseSuggestionsPage() {
  const { inventoryData } = useContext(InventoryContext)!;
  const { currentUser } = useUser();
  const { toast } = useToast();
  
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const [advisorSuggestions, setAdvisorSuggestions] = useState<AdvisorSuggestion[]>(initialAdvisorSuggestions);
  
  // Form state for new suggestions
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [reason, setReason] = useState('');

  const userPermissions = roles.find(r => r.name === currentUser.roles[0])?.permissions || [];
  const canCreateSuggestion = userPermissions.includes('purchasing:suggestions:create');
  const canViewSystemSuggestions = currentUser.roles[0] === 'Administrador' || currentUser.roles[0] === 'Tráfico';


  const systemSuggestions: Suggestion[] = useMemo(() => {
    const suggestionList: Suggestion[] = [];
    const productSet = new Set<string>();

    const lastMonthKey = Object.keys(inventoryMovementData).sort().pop() || '';
    const lastMonthMovers = inventoryMovementData[lastMonthKey]?.topMovers || [];

    for (const brand in inventoryData) {
      for (const line in inventoryData[brand]) {
        for (const name in inventoryData[brand][line]) {
          if (productSet.has(name)) continue;

          const product = inventoryData[brand][line][name];
          const availableStock = (product.bodega - product.separadasBodega) + (product.zonaFranca - product.separadasZonaFranca);
          const monthlyMovement = lastMonthMovers.find(m => m.name === name)?.moved || 0;

          // Suggestion logic
          if (availableStock < 50 && monthlyMovement > 20) {
            suggestionList.push({
              productName: name,
              currentStock: availableStock,
              monthlyMovement: monthlyMovement,
              reason: 'Stock Bajo',
            });
            productSet.add(name);
          } else if (monthlyMovement > 100) {
             suggestionList.push({
              productName: name,
              currentStock: availableStock,
              monthlyMovement: monthlyMovement,
              reason: 'Alta Demanda',
            });
            productSet.add(name);
          }
        }
      }
    }
    return suggestionList;
  }, [inventoryData]);

  const productOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (const brand in inventoryData) {
        for (const line in inventoryData[brand]) {
             for (const name in inventoryData[brand][line]) {
                options.push({ value: name, label: name });
             }
        }
    }
    return options;
  }, [inventoryData]);
  
  const handleSelectionChange = (productName: string, checked: boolean) => {
    setSelectedSuggestions(prev => ({ ...prev, [productName]: checked }));
  }

  const handleCreatePurchaseOrder = () => {
    const selectedProducts = systemSuggestions.filter(s => selectedSuggestions[s.productName]);
    if (selectedProducts.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione al menos una sugerencia del sistema.'});
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Pre-Orden de Compra Sugerida (Sistema)', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generada: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);

    const tableBody = selectedProducts.map(item => [
      item.productName,
      item.currentStock,
      item.monthlyMovement,
      item.reason
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Producto', 'Stock Actual', 'Mov. Mensual', 'Razón']],
      body: tableBody
    });

    doc.save('Pre-Orden_Sugerida_Sistema.pdf');
    toast({ title: 'Éxito', description: 'Se ha generado un PDF con la pre-orden de compra.'});
  }

  const handleSendAdvisorSuggestion = () => {
    if (!productName || !quantity || !reason) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos para enviar la sugerencia.' });
        return;
    }

    const newSuggestion: AdvisorSuggestion = {
        id: Date.now(),
        productName,
        quantity: Number(quantity),
        reason,
        advisorName: currentUser.name
    };

    setAdvisorSuggestions(prev => [newSuggestion, ...prev]);
    toast({ title: 'Sugerencia Enviada', description: 'Gracias, tu recomendación ha sido enviada al equipo de compras.'});

    // Reset form
    setProductName('');
    setQuantity('');
    setReason('');
  }

  return (
    <div className="space-y-6">
      {canCreateSuggestion && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6" /> Recomendar Compra
                </CardTitle>
                <CardDescription>
                    ¿Un cliente pidió algo que no tienes? ¿Notas una nueva tendencia? Envía tu sugerencia al equipo de compras.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={productName}
                            onValueChange={setProductName}
                            placeholder="Seleccione un producto"
                            searchPlaceholder="Buscar producto..."
                            emptyPlaceholder="No se encontró producto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cantidad Sugerida</Label>
                        <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ej: 100" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Razón / Justificación</Label>
                    <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Varios clientes han preguntado por este producto y no tenemos stock." />
                 </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSendAdvisorSuggestion}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Sugerencia
                    </Button>
                 </div>
            </CardContent>
        </Card>
      )}

      {canViewSystemSuggestions && (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6" /> Sugerencias del Sistema
                </CardTitle>
                <CardDescription>
                Recomendaciones automáticas de productos para reponer basadas en el inventario y las ventas.
                </CardDescription>
            </div>
            <Button onClick={handleCreatePurchaseOrder} disabled={!Object.values(selectedSuggestions).some(Boolean)}>
                <FileDown className="mr-2 h-4 w-4" />
                Generar Pre-Orden
            </Button>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {systemSuggestions.map((suggestion) => (
                <Card key={suggestion.productName} className="p-4 flex items-center gap-4">
                    <Checkbox
                        className="h-5 w-5"
                        checked={selectedSuggestions[suggestion.productName] || false}
                        onCheckedChange={(checked) => handleSelectionChange(suggestion.productName, Boolean(checked))}
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <p className="font-semibold">{suggestion.productName}</p>
                    <div className="text-sm">
                        <p className="text-muted-foreground">Stock Actual</p>
                        <p className="font-medium">{suggestion.currentStock} unidades</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-muted-foreground">Movimiento Último Mes</p>
                        <p className="font-medium">{suggestion.monthlyMovement} unidades</p>
                    </div>
                    </div>
                    <Badge variant={suggestion.reason === 'Stock Bajo' ? 'destructive' : 'default'} className="flex items-center gap-2">
                        {suggestion.reason === 'Stock Bajo' ? (
                        <AlertTriangle className="h-4 w-4" />
                        ) : (
                        <TrendingUp className="h-4 w-4" />
                        )}
                        {suggestion.reason}
                    </Badge>
                </Card>
                ))}
                {systemSuggestions.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        <PackagePlus className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-medium">¡Todo en orden!</h3>
                        <p>No hay sugerencias de compra por el momento.</p>
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Sugerencias de Asesores</CardTitle>
            <CardDescription>Recomendaciones de compra enviadas por el equipo de ventas.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {advisorSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                        <div className="flex items-start gap-4">
                             <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-x-4 gap-y-2">
                                <p className="font-semibold col-span-1 md:col-span-1">{suggestion.productName}</p>
                                <div className="text-sm col-span-1 md:col-span-1">
                                    <p className="text-muted-foreground">Cantidad Sugerida</p>
                                    <p className="font-medium">{suggestion.quantity} unidades</p>
                                </div>
                                <div className="text-sm col-span-1 md:col-span-1">
                                    <p className="text-muted-foreground">Sugerido por</p>
                                    <p className="font-medium">{suggestion.advisorName}</p>
                                </div>
                                <div className="text-sm col-span-full mt-2">
                                    <p className="text-muted-foreground">Razón</p>
                                    <p>{suggestion.reason}</p>
                                </div>
                             </div>
                             {canViewSystemSuggestions && <Button size="sm" variant="outline">Crear Orden</Button>}
                        </div>
                    </Card>
                ))}
                 {advisorSuggestions.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        <PackagePlus className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-medium">No hay sugerencias</h3>
                        <p>Aún no se han enviado recomendaciones por parte de los asesores.</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
