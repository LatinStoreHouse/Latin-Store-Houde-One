'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, BotMessageSquare, Users, BarChartHorizontal, Mail, MessageSquare } from 'lucide-react';
import { CampaignPreview } from '@/components/campaign-preview';
import { Customer, CustomerStatus, initialCustomerData, customerStatuses } from '@/lib/customers';
import { Checkbox } from '@/components/ui/checkbox';


type AudienceType = 'all' | 'byStatus';
type ChannelType = 'email' | 'whatsapp';


export default function CreateCampaignPage() {
    const [campaignName, setCampaignName] = useState('');
    const [audience, setAudience] = useState<AudienceType>('all');
    const [selectedStatuses, setSelectedStatuses] = useState<CustomerStatus[]>([]);
    const [message, setMessage] = useState('');
    const [channel, setChannel] = useState<ChannelType>('email');

    const audienceCount = useMemo(() => {
        if (audience === 'all') {
            return initialCustomerData.length;
        }
         if (audience === 'byStatus' && selectedStatuses.length > 0) {
            const customersWithStatus = new Set(
                initialCustomerData
                    .filter(c => selectedStatuses.includes(c.status))
                    .map(c => c.id)
            );
            return customersWithStatus.size;
        }
        return 0;
    }, [audience, selectedStatuses]);
    
    const handleStatusChange = (status: CustomerStatus, checked: boolean) => {
        if (checked) {
            setSelectedStatuses([...selectedStatuses, status]);
        } else {
            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
        }
    }


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
                                 {audience === 'all' && (
                                     <p className="text-sm text-primary font-medium pt-2">
                                        Esta campaña se enviará a **{audienceCount}** {audienceCount === 1 ? 'cliente' : 'clientes'}.
                                    </p>
                                 )}
                            </div>
                        </Label>
                         <Label htmlFor="audience-status" className="flex items-start gap-4 space-y-1 rounded-md border p-4 cursor-pointer">
                             <RadioGroupItem value="byStatus" id="audience-status" className="mt-1"/>
                            <div className="flex-1">
                                <span className="font-semibold flex items-center gap-2"><BarChartHorizontal className="h-4 w-4" />Clientes por Estado</span>
                                <p className="text-sm text-muted-foreground mt-1">Enviar solo a clientes que se encuentren en los estados seleccionados.</p>
                                {audience === 'byStatus' && (
                                    <div className="mt-3 space-y-2">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {customerStatuses.map(status => (
                                                 <div key={status} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`status-${status}`}
                                                        checked={selectedStatuses.includes(status)}
                                                        onCheckedChange={(checked) => handleStatusChange(status, Boolean(checked))}
                                                    />
                                                    <Label htmlFor={`status-${status}`} className="font-normal text-sm">{status}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedStatuses.length > 0 && (
                                            <p className="text-sm text-primary font-medium pt-2">
                                                Esta campaña se enviará a **{audienceCount}** {audienceCount === 1 ? 'cliente' : 'clientes'}.
                                            </p>
                                        )}
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
                     <Textarea 
                        placeholder="Escribe el mensaje de tu campaña aquí..."
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                     />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>4. Canal de Envío</CardTitle>
                    <CardDescription>Elige cómo se enviará esta campaña a tus clientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup value={channel} onValueChange={(v) => setChannel(v as ChannelType)} className="grid grid-cols-2 gap-4">
                        <Label htmlFor="channel-email" className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="email" id="channel-email" className="sr-only"/>
                            <Mail className="h-8 w-8"/>
                            <span className="font-semibold">Email</span>
                        </Label>
                        <Label htmlFor="channel-whatsapp" className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="whatsapp" id="channel-whatsapp" className="sr-only"/>
                            <MessageSquare className="h-8 w-8"/>
                            <span className="font-semibold">WhatsApp</span>
                        </Label>
                    </RadioGroup>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
