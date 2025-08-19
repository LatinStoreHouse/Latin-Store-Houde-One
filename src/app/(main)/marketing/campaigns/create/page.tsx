'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, BotMessageSquare, Users, ShoppingBag } from 'lucide-react';
import { CampaignPreview } from '@/components/campaign-preview';
import { initialInventoryData } from '@/lib/initial-inventory';


type AudienceType = 'all' | 'byProduct';

const getAllProducts = (): ComboboxOption[] => {
    const products: ComboboxOption[] = [];
    for (const brand in initialInventoryData) {
        for (const subCategory in initialInventoryData[brand as keyof typeof initialInventoryData]) {
            for (const productName in initialInventoryData[brand as keyof typeof initialInventoryData][subCategory]) {
                products.push({
                    value: productName,
                    label: productName,
                });
            }
        }
    }
    // Remove duplicates and sort
    return [...new Map(products.map(item => [item['value'], item])).values()].sort((a,b) => a.label.localeCompare(b.label));
};

export default function CreateCampaignPage() {
    const [campaignName, setCampaignName] = useState('');
    const [audience, setAudience] = useState<AudienceType>('all');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [message, setMessage] = useState('');

    const productOptions = useMemo(() => getAllProducts(), []);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/marketing/campaigns">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Nueva Campaña</h1>
            <p className="text-muted-foreground">Define los detalles y el contenido de tu campaña de marketing.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Detalles de la Campaña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                        <Input 
                            id="campaign-name"
                            placeholder="Ej: Promo Invierno 2024"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>2. Definir Audiencia</CardTitle>
                    <CardDescription>Selecciona a quién se le enviará esta campaña.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={audience} onValueChange={(v) => setAudience(v as AudienceType)} className="space-y-4">
                        <Label htmlFor="audience-all" className="flex items-start gap-4 space-y-1 rounded-md border p-4 cursor-pointer">
                            <RadioGroupItem value="all" id="audience-all" className="mt-1"/>
                            <div className="flex-1">
                                <span className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Todos los Clientes</span>
                                <p className="text-sm text-muted-foreground mt-1">Enviar la campaña a cada cliente en tu base de datos.</p>
                            </div>
                        </Label>
                        <Label htmlFor="audience-product" className="flex items-start gap-4 space-y-1 rounded-md border p-4 cursor-pointer">
                             <RadioGroupItem value="byProduct" id="audience-product" className="mt-1"/>
                            <div className="flex-1">
                                <span className="font-semibold flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Clientes por Producto Comprado</span>
                                <p className="text-sm text-muted-foreground mt-1">Enviar solo a clientes que han comprado un producto específico en el pasado. (Requiere historial de ventas detallado).</p>
                                {audience === 'byProduct' && (
                                    <div className="mt-3">
                                         <Combobox
                                            options={productOptions}
                                            value={selectedProduct}
                                            onValueChange={setSelectedProduct}
                                            placeholder="Seleccione un producto"
                                            searchPlaceholder="Buscar producto..."
                                            emptyPlaceholder="No se encontró el producto."
                                        />
                                    </div>
                                )}
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>3. Contenido del Mensaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                         <Textarea 
                            placeholder="Escribe el mensaje de tu campaña aquí..."
                            rows={8}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                         />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full">
                            <BotMessageSquare className="mr-2 h-4 w-4" />
                            Generar con IA
                        </Button>
                        <Button className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Campaña
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <CampaignPreview
                campaignName={campaignName}
                message={message}
             />
        </div>
      </div>
    </div>
  );
}
