
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DesignRequest, DesignStatus, designStatuses } from '@/lib/designs';
import { FileUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/app/(main)/layout';

interface DesignRequestFormProps {
    request?: DesignRequest | null;
    onSave: (request: Omit<DesignRequest, 'id' | 'requestDate' | 'advisor'>) => void;
    onCancel: () => void;
    currentUser: ReturnType<typeof useUser>['currentUser'];
}

export function DesignRequestForm({ request, onSave, onCancel, currentUser }: DesignRequestFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [description, setDescription] = useState('');
    const [mediaLink, setMediaLink] = useState('');
    const [status, setStatus] = useState<DesignStatus>('Pendiente');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [designFile, setDesignFile] = useState<File | null>(null);
    const [existingDesignFile, setExistingDesignFile] = useState<string | undefined>('');
    const [designerNotes, setDesignerNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const isDesigner = currentUser.roles.includes('Diseño') || currentUser.roles.includes('Administrador');
    const isOwner = request ? currentUser.name === request.advisor : false;

    useEffect(() => {
        if (request) {
            setCustomerName(request.customerName);
            setDescription(request.description);
            setMediaLink(request.mediaLink);
            setStatus(request.status);
            setDeliveryDate(request.deliveryDate || '');
            setExistingDesignFile(request.designFile);
            setDesignerNotes(request.designerNotes || '');
        } else {
            // Reset form for new request
            setCustomerName('');
            setDescription('');
            setMediaLink('');
            setStatus('Pendiente');
            setDeliveryDate('');
            setDesignFile(null);
            setExistingDesignFile('');
            setDesignerNotes('');
        }
    }, [request]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalStatus = status;
        if (isOwner && !isDesigner && request) {
            finalStatus = 'Pendiente';
            toast({ title: 'Solicitud Reenviada', description: 'Tus cambios han sido guardados y la solicitud fue enviada a revisión nuevamente.'})
        }

        onSave({
            customerName,
            description,
            mediaLink,
            status: finalStatus,
            deliveryDate,
            designFile: designFile ? `/uploads/${designFile.name}` : existingDesignFile,
            designerNotes
        });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast({ variant: 'destructive', title: 'Error', description: 'Solo se permiten archivos PDF.' });
                return;
            }
            setDesignFile(file);
            setExistingDesignFile(file.name);
        }
    };

    const handleRemoveFile = () => {
        setDesignFile(null);
        setExistingDesignFile('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
    
    const canEditAdvisorFields = isDesigner || !request || isOwner;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
                <Label htmlFor="customerName">Nombre del Cliente</Label>
                <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required disabled={!canEditAdvisorFields} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Descripción de la Solicitud</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} disabled={!canEditAdvisorFields} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="mediaLink">Enlace a Fotos/Videos (WeTransfer, Drive, etc.)</Label>
                <Input id="mediaLink" value={mediaLink} onChange={e => setMediaLink(e.target.value)} required disabled={!canEditAdvisorFields} />
            </div>

            {isDesigner && (
                <div className="p-4 border rounded-md space-y-4 bg-muted/50">
                    <h3 className="font-semibold text-center">Panel de Diseño</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as DesignStatus)}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deliveryDate">Fecha Estimada de Entrega</Label>
                            <Input id="deliveryDate" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Propuesta de Diseño (PDF)</Label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                        {existingDesignFile ? (
                             <div className="flex items-center justify-between rounded-md border bg-background p-2">
                                <span className="text-sm truncate">{existingDesignFile}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                <FileUp className="mr-2 h-4 w-4" />
                                Subir Propuesta
                            </Button>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="designerNotes">Notas del Diseñador (Visible para el asesor)</Label>
                        <Textarea id="designerNotes" value={designerNotes} onChange={e => setDesignerNotes(e.target.value)} rows={3} placeholder="Si rechaza la solicitud, explique aquí el motivo o la información que falta..."/>
                    </div>
                </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{request ? 'Guardar Cambios' : 'Enviar Solicitud'}</Button>
            </div>
        </form>
    );
}
