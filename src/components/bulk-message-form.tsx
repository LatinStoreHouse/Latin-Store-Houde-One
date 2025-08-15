'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/app/(main)/customers/page';
import { Mail, MessageCircle } from 'lucide-react';

interface BulkMessageFormProps {
  customers: Customer[];
}

export function BulkMessageForm({ customers }: BulkMessageFormProps) {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

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
    
    toast({ title: 'Listo para enviar', description: 'Tu cliente de correo se ha abierto para enviar el mensaje.' });
  };

  const handleSendWhatsApp = async () => {
    if (!message) {
      toast({ variant: 'destructive', title: 'Error', description: 'El mensaje no puede estar vacío.' });
      return;
    }
    
    try {
        await navigator.clipboard.writeText(message);
        toast({ title: 'Mensaje Copiado', description: 'El mensaje se ha copiado al portapapeles. Ahora puedes pegarlo en WhatsApp.' });
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
          rows={8}
        />
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
       <p className="text-xs text-muted-foreground text-center pt-2">
        Recordatorio: El envío por WhatsApp requiere copiar el mensaje y pegarlo en su lista de difusión o chats. Asegúrese de cumplir con las políticas de WhatsApp.
      </p>
    </div>
  );
}
