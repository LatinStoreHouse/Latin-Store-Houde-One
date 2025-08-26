'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';

interface AddProductDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (product: { brand: string; line: string; name: string; price: number, size?: string }) => void;
    brands: string[];
    linesByBrand: Record<string, string[]>;
}

export function AddProductDialog({ isOpen, onOpenChange, onSave, brands, linesByBrand }: AddProductDialogProps) {
    const [brand, setBrand] = useState('');
    const [line, setLine] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [size, setSize] = useState('');
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewLine, setIsNewLine] = useState(false);
    
    const brandOptions = brands.map(b => ({ value: b, label: b }));
    const lineOptions = brand ? (linesByBrand[brand] || []).map(l => ({ value: l, label: l })) : [];
    
    const handleSave = () => {
        onSave({ brand, line, name, price, size });
        resetForm();
    }

    const resetForm = () => {
        setBrand('');
        setLine('');
        setName('');
        setPrice(0);
        setSize('');
        setIsNewBrand(false);
        setIsNewLine(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    }
    
     const handleToggleNewBrand = (checked: boolean) => {
        setIsNewBrand(checked);
        setBrand('');
        setLine('');
        setIsNewLine(false);
    };

    const handleToggleNewLine = (checked: boolean) => {
        setIsNewLine(checked);
        setLine('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox id="is-new-brand-dialog" checked={isNewBrand} onCheckedChange={handleToggleNewBrand} />
                            <Label htmlFor="is-new-brand-dialog">Agregar marca nueva</Label>
                        </div>
                        {isNewBrand ? (
                            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nombre de la nueva marca" />
                        ) : (
                            <Combobox
                                options={brandOptions}
                                value={brand}
                                onValueChange={(value) => { setBrand(value); setLine(''); }}
                                placeholder="Seleccione una marca"
                                searchPlaceholder="Buscar marca..."
                                emptyPlaceholder="No hay marcas."
                            />
                        )}
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox id="is-new-line-dialog" checked={isNewLine} onCheckedChange={handleToggleNewLine} disabled={!brand} />
                            <Label htmlFor="is-new-line-dialog" className={!brand ? 'text-muted-foreground' : ''}>Agregar línea nueva</Label>
                        </div>
                        {isNewLine ? (
                             <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Nombre de la nueva línea" disabled={!brand} />
                        ) : (
                            <Combobox
                                options={lineOptions}
                                value={line}
                                onValueChange={setLine}
                                placeholder="Seleccione una línea"
                                searchPlaceholder="Buscar línea..."
                                emptyPlaceholder="No hay líneas para esta marca."
                                disabled={!brand}
                            />
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label>Nombre del Producto</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Medidas (Opcional)</Label>
                        <Input value={size} onChange={e => setSize(e.target.value)} placeholder="Ej: 1.22x0.61 Mts" />
                    </div>
                     <div className="space-y-2">
                        <Label>Precio (COP)</Label>
                        <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>Añadir Producto</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
