'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/app/(main)/customers/page';
import { Mail, MessageCircle, Paperclip, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface BulkMessageFormProps {
  customers: Customer[];
}

export function BulkMessageForm({ customers }: BulkMessageFormProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleSendEmail = () => {
    if (!message) {
      toast({ variant: 'destructive', title: 'Error', description: 'El mensaje no puede estar vacío.' });
      return;
    }
    const emails = customers.map(c => c.email).filter(Boolean);
    if (emails.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ninguno de los clientes seleccionados tiene un correo electrónico.' });
      return;
    }

    const bcc = emails.join(',');
    const mailtoLink = `mailto:?bcc=${bcc}&subject=Un mensaje de Latin Store House&body=${encodeURIComponent(message)}`;
    
    window.location.href = mailtoLink;
    
    let toastDescription = 'Tu cliente de correo se ha abierto para enviar el mensaje.';
    if (image) {
      toastDescription += ' No olvides adjuntar la imagen seleccionada manualmente.';
    }

    toast({ title: 'Listo para enviar', description: toastDescription });
  };

  const handleSendWhatsApp = async () => {
    if (!message) {
      toast({ variant: 'destructive', title: 'Error', description: 'El mensaje no puede estar vacío.' });
      return;
    }
    
    try {
        let textToCopy = message;
        if(image) {
            textToCopy += '\n\n(Imagen adjunta)';
        }
        await navigator.clipboard.writeText(textToCopy);
        let toastDescription = 'El mensaje se ha copiado al portapapeles. Ahora puedes pegarlo en WhatsApp.';
        if (image) {
            toastDescription += ' No olvides adjuntar la imagen también.'
        }
        toast({ title: 'Mensaje Copiado', description: toastDescription });
        window.open('https://web.whatsapp.com', '_blank');
    } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el mensaje al portapapeles.' });
    }
  };


  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="bulk-message">Mensaje de la Campaña</Label>
        <Textarea
          id="bulk-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          rows={6}
        />
      </div>

       <div className="space-y-2">
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

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={handleSendEmail} variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Enviar Correo
        </Button>
        <Button onClick={handleSendWhatsApp}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Enviar WhatsApp
        </Button>
      </div>
       <Alert>
          <AlertTitle className="flex items-center gap-2"><MessageCircle className="h-4 w-4"/> Recordatorio de Envío</AlertTitle>
          <AlertDescription className="text-xs">
            Para **WhatsApp**, el mensaje se copiará y deberás pegarlo. Para **Correo**, se abrirá tu cliente de email. En ambos casos, si adjuntaste una imagen, deberás añadirla manualmente al mensaje final.
          </AlertDescription>
        </Alert>
    </div>
  );
}
