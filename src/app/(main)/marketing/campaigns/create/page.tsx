
'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, BotMessageSquare, Users, BarChartHorizontal, Mail, Loader2, Paperclip, X, UserCheck } from 'lucide-react';
import { CampaignPreview } from '@/components/campaign-preview';
import { Customer, CustomerStatus, initialCustomerData, customerStatuses } from '@/lib/customers';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getCampaignMessageSuggestion } from '@/app/actions';
import { WhatsAppIcon } from '@/components/social-icons';



export default function CreateCampaignPage() {
    const searchParams = useSearchParams();
    const customerIdsParam = searchParams.get('customer_ids');

    const [campaignName, setCampaignName] = useState('');
    const [audience, setAudience] = useState<AudienceType>('all');
    const [selectedStatuses, setSelectedStatuses] = useState<CustomerStatus[]>([]);
    const [message, setMessage] = useState('');
    const [channel, setChannel] = useState<ChannelType>('email');
    const [isGenerating, setIsGenerating] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const preselectedCustomerIds = useMemo(() => {
        return customerIdsParam ? customerIdsParam.split(',').map(Number) : [];
    }, [customerIdsParam]);

    useEffect(() => {
        if (preselectedCustomerIds.length > 0) {
            setAudience('selected');
        }
    }, [preselectedCustomerIds]);

    const selectedCustomers = useMemo(() => {
        if (audience === 'all') {
            return initialCustomerData;
        }
        if (audience === 'byStatus' && selectedStatuses.length > 0) {
            return initialCustomerData.filter(c => selectedStatuses.includes(c.status));
        }
        if (audience === 'selected' && preselectedCustomerIds.length > 0) {
            return initialCustomerData.filter(c => preselectedCustomerIds.includes(c.id));
        }
        return [];
    }, [audience, selectedStatuses, preselectedCustomerIds]);
    
    const audienceCount = selectedCustomers.length;
    
    type AudienceType = 'all' | 'byStatus' | 'selected';
    type ChannelType = 'email' | 'whatsapp';
    
    const handleStatusChange = (status: CustomerStatus, checked: boolean) => {
        if (checked) {
            setSelectedStatuses([...selectedStatuses, status]);
        } else {
            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
        }
    };
    
    const handleGenerateWithAI = async () => {
        if (!campaignName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, ingrese un nombre de campaña para generar el mensaje.' });
            return;
        }
        setIsGenerating(true);
        const result = await getCampaignMessageSuggestion({ campaignName });
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error de IA', description: result.error });
        } else if (result.result) {
            setMessage(result.result.campaignMessage);
            toast({ title: 'Éxito', description: 'Mensaje de campaña generado por la IA.' });
        }
        setIsGenerating(false);
    };

    const handleSendCampaign = async () => {
        if (!message) {
            toast({ variant: 'destructive', title: 'Error', description: 'El mensaje no puede estar vacío.' });
            return;
        }
        if (audienceCount === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'La audiencia seleccionada no tiene clientes.' });
            return;
        }

        if (channel === 'email') {
            const emails = selectedCustomers.map(c => c.email).filter(Boolean);
            if (emails.length === 0) {
                toast({ variant: 'destructive', title: 'Error', description: 'Ninguno de los clientes seleccionados tiene un correo electrónico.' });
                return;
            }
            const bcc = emails.join(',');
            const mailtoLink = `mailto:?bcc=${bcc}&subject=${encodeURIComponent(campaignName)}&body=${encodeURIComponent(message)}`;
            
            window.location.href = mailtoLink;
            
            let toastDescription = 'Tu cliente de correo se ha abierto para enviar el mensaje.';
            if (image) {
                toastDescription += ' No olvides adjuntar la imagen seleccionada manualmente.';
            }
            toast({ title: 'Listo para enviar', description: toastDescription });

        } else { // WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            let toastDescription = 'WhatsApp se ha abierto con tu mensaje listo para enviar.';
            if (image) {
               toastDescription += ' No olvides adjuntar la imagen también.'
            }
            toast({ title: 'Listo para enviar', description: toastDescription });
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit for preview
                toast({ variant: 'destructive', title: 'Error', description: 'La imagen es demasiado grande. Elige una de menos de 2MB.' });
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


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
                        {preselectedCustomerIds.length > 0 && (
                             <Label htmlFor="audience-selected" className="flex items-start gap-4 space-y-1 rounded-md border-2 border-primary bg-primary/5 p-4 cursor-pointer">
                                <RadioGroupItem value="selected" id="audience-selected" className="mt-1"/>
                                <div className="flex-1">
                                    <span className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" />Clientes Seleccionados</span>
                                    <p className="text-sm text-primary/80 mt-1">Enviar la campaña a los clientes que elegiste en la página anterior.</p>
                                     {audience === 'selected' && (
                                         <p className="text-sm text-primary font-bold pt-2">
                                            Esta campaña se enviará a **{audienceCount}** {audienceCount === 1 ? 'cliente' : 'clientes'}.
                                        </p>
                                     )}
                                </div>
                            </Label>
                        )}
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
                        placeholder="Escribe el mensaje de tu campaña aquí o genéralo con IA..."
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                     />
                     <div className="space-y-2 pt-4">
                        <Label>Imagen de la Campaña (Opcional)</Label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleImageChange}
                        />
                        {!imagePreview ? (
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                            <Paperclip className="mr-2 h-4 w-4" />
                            Adjuntar Imagen
                            </Button>
                        ) : (
                            <div className="relative w-full h-48 rounded-md border p-2">
                                <Image src={imagePreview} alt="Vista previa de la imagen" fill style={{ objectFit: 'contain' }} />
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                        if(fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground text-center">
                            Recomendado: menor a 500KB para una entrega rápida.
                        </p>
                    </div>
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
                            <WhatsAppIcon />
                            <span className="font-semibold">WhatsApp</span>
                        </Label>
                    </RadioGroup>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button variant="outline" className="w-full" onClick={handleGenerateWithAI} disabled={isGenerating}>
                             {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BotMessageSquare className="mr-2 h-4 w-4" />}
                            Generar con IA
                        </Button>
                        <Button className="w-full" onClick={handleSendCampaign}>
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
