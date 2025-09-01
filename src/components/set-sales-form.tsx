'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MonthPicker } from './month-picker';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from './ui/table';

interface SetSalesFormProps {
    advisorName: string;
    salesData: { [month: string]: { sales: number } };
    onSave: (advisorName: string, salesData: { [month: string]: { sales: number } }) => void;
    onCancel: () => void;
}

export function SetSalesForm({ advisorName, salesData, onSave, onCancel }: SetSalesFormProps) {
    const [localSalesData, setLocalSalesData] = useState(salesData);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newSaleValue, setNewSaleValue] = useState<number | string>('');
    const { toast } = useToast();

    useEffect(() => {
        setLocalSalesData(salesData);
    }, [salesData]);

    const handleAddOrUpdateSale = () => {
        if (newSaleValue === '' || Number(newSaleValue) < 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, ingrese un valor de venta válido.' });
            return;
        }
        
        const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
        setLocalSalesData(prev => ({
            ...prev,
            [monthKey]: { sales: Number(newSaleValue) }
        }));
        setNewSaleValue('');
    };
    
    const handleRemoveSale = (monthKey: string) => {
        setLocalSalesData(prev => {
            const newData = {...prev};
            delete newData[monthKey];
            return newData;
        });
    }

    const handleSubmit = () => {
        onSave(advisorName, localSalesData);
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(value);
    };

    const sortedSalesMonths = Object.keys(localSalesData).sort().reverse();
    
    return (
        <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <div className="space-y-2">
                    <Label>Mes a Registrar/Actualizar</Label>
                    <MonthPicker date={selectedDate} onDateChange={setSelectedDate} />
                </div>
                 <div className="space-y-2">
                    <Label>Valor Total de Venta (COP)</Label>
                    <Input 
                        type="number" 
                        value={newSaleValue}
                        onChange={(e) => setNewSaleValue(e.target.value)}
                        placeholder="Ej: 150000000"
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="button" onClick={handleAddOrUpdateSale}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir/Actualizar Venta
                    </Button>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Ventas Registradas para {advisorName}</h4>
                 <div className="max-h-48 overflow-y-auto border rounded-md">
                    <Table>
                        <TableBody>
                            {sortedSalesMonths.length > 0 ? sortedSalesMonths.map(monthKey => (
                                <TableRow key={monthKey}>
                                    <TableCell className="font-medium">{monthKey}</TableCell>
                                    <TableCell>{formatCurrency(localSalesData[monthKey].sales)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveSale(monthKey)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground h-20">
                                        No hay ventas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="button" onClick={handleSubmit}>Guardar Cambios</Button>
            </div>
        </div>
    )
}
