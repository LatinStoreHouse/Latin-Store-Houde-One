
'use client';

import React, { useState, useMemo, useContext } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, PackagePlus, FileDown, AlertTriangle, TrendingUp } from 'lucide-react';
import { InventoryContext } from '@/context/inventory-context';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

export default function PurchaseSuggestionsPage() {
  const { inventoryData } = useContext(InventoryContext)!;
  const { toast } = useToast();
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});

  const suggestions: Suggestion[] = useMemo(() => {
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
  
  const handleSelectionChange = (productName: string, checked: boolean) => {
    setSelectedSuggestions(prev => ({ ...prev, [productName]: checked }));
  }

  const handleCreatePurchaseOrder = () => {
    const selectedProducts = suggestions.filter(s => selectedSuggestions[s.productName]);
    if (selectedProducts.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione al menos una sugerencia.'});
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Pre-Orden de Compra Sugerida', 14, 22);
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

    doc.save('Pre-Orden_Sugerida.pdf');
    toast({ title: 'Éxito', description: 'Se ha generado un PDF con la pre-orden de compra.'});
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6" /> Sugerencias de Compra
            </CardTitle>
            <CardDescription>
              Recomendaciones de productos para reponer basadas en el inventario actual y el movimiento de ventas.
            </CardDescription>
          </div>
          <Button onClick={handleCreatePurchaseOrder} disabled={!Object.values(selectedSuggestions).some(Boolean)}>
            <FileDown className="mr-2 h-4 w-4" />
            Generar Pre-Orden
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
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
            {suggestions.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <PackagePlus className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium">¡Todo en orden!</h3>
                    <p>No hay sugerencias de compra por el momento.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
