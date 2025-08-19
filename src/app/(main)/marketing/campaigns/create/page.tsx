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


type AudienceType = 'all' | 'byStatus' | 'selected';
type ChannelType = 'email' | 'whatsapp';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-current"><title>WhatsApp</title><path d="M12.04 2.018c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.573 0 3.09-.37 4.49-1.035l3.493 1.032-1.06-3.39c.734-1.424 1.145-3.01 1.145-4.688.002-5.522-4.476-9.92-9.998-9.92zm3.328 12.353c-.15.27-.547.433-.945.513-.378.075-.826.104-1.312-.054-.933-.3-1.854-.9-2.61-1.68-.89-.897-1.472-1.95-1.63-2.93-.05-.293.003-.593.05-.86.06-.29.117-.582.26-.78.23-.32.512-.423.703-.408.19.012.36.003.504.003.144 0 .317.006.46.33.175.39.593 1.45.64 1.55.05.1.085.225.01.375-.074.15-.15.255-.255.36-.105.105-.204.224-.29.33-.085.105-.18.21-.074.405.23.45.983 1.416 1.95 2.13.772.58 1.48.74 1.83.656.35-.086.58-.33.725-.63.144-.3.11-.555.07-.643-.04-.09-.436-.51-.58-.68-.144-.17-.29-.26-.404-.16-.115.1-.26.15-.375.12-.114-.03-.26-.06-.375-.11-.116-.05-.17-.06-.24-.01-.07.05-.16.21-.21.28-.05.07-.1.08-.15.05-.05-.03-.21-.07-.36-.13-.15-.06-.8-.38-1.52-.98-.98-.82-1.65-1.85-1.72-2.02-.07-.17.08-1.3 1.3-1.3h.2c.114 0 .22.05.29.13.07.08.1.18.1.28l.02 1.35c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1H9.98c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.15c0-.11.05-.22.13-.29-.08-.07-.18-.1-.28-.1h.02c.11 0 .22.05.29.13.07.08.1.18.1.28l.01.12c0 .11-.05.22-.13.29-.08.07-.18-.1-.28-.1h-.03c-.11 0-.22-.05-.29-.13-.07-.08-.1-.18-.1-.28v-.02c0-.11.05-.22.13-.29.08-.07-.18.1.28.1h.01c.11 0 .22-.05.29-.13.07.08.1.18.1.28a.38.38 0 0 0-.13-.29c-.08-.07-.18-.1-.28-.1z"/></svg>
);


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
            try {
                await navigator.clipboard.writeText(message);
                let toastDescription = 'El mensaje se ha copiado al portapapeles. Ahora puedes pegarlo en WhatsApp.';
                if (image) {
                   toastDescription += ' No olvides adjuntar la imagen también.'
                }
                toast({ title: 'Mensaje Copiado', description: toastDescription });
                window.open('https://web.whatsapp.com', '_blank');
            } catch (err) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el mensaje al portapapeles.' });
            }
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
