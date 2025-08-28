
'use client';

import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Container } from '@/context/inventory-context';
import { CalendarIcon, Container as ContainerIcon, Undo2 } from 'lucide-react';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface ContainerHistoryItemProps {
  container: Container;
  onRevert: (containerId: string) => void;
  canRevert: boolean;
}

export function ContainerHistoryItem({ container, onRevert, canRevert }: ContainerHistoryItemProps) {
  return (
    <AccordionItem value={container.id}>
      <AccordionTrigger className="rounded-md border px-4 hover:no-underline">
        <div className="flex w-full items-center justify-between text-sm">
            <div className="flex items-center gap-4">
                <ContainerIcon className="h-6 w-6 text-muted-foreground" />
                <span className="font-semibold">{container.id}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Agregado: {container.creationDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Llegada: {container.eta}</span>
                </div>
            </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 border border-t-0 rounded-b-md">
            <div className="flex justify-between items-center mb-2">
                 <h4 className="font-medium">Productos en el Contenedor</h4>
                 {canRevert && container.status === 'Ya llego' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="outline" size="sm">
                                <Undo2 className="mr-2 h-4 w-4" />
                                Revertir a Puerto
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro de que desea revertir este contenedor?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción devolverá el contenedor al estado "En puerto" y descontará las unidades correspondientes del inventario de Zona Franca. Las reservas asociadas volverán a apuntar al contenedor.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onRevert(container.id)}>Sí, revertir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {container.products.map((product, index) => (
                        <TableRow key={index}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="text-right">{product.quantity}</TableCell>
                        </TableRow>
                    ))}
                    {container.products.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                No se registraron productos en este contenedor.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
