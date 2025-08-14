'use client';

import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Container } from '@/app/(main)/transit/page';
import { CalendarIcon, Container as ContainerIcon } from 'lucide-react';

interface ContainerHistoryItemProps {
  container: Container;
}

export function ContainerHistoryItem({ container }: ContainerHistoryItemProps) {
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
            <h4 className="mb-2 font-medium">Productos en el Contenedor</h4>
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
