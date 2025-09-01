
'use client';
import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initialCustomerData, Customer } from '@/lib/customers';
import { useUser } from '@/app/(main)/layout';
import { Users, StickyNote } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AssignedCustomersPage() {
  const { currentUser } = useUser();

  const assignedCustomers = useMemo(() => {
    return initialCustomerData.filter(
      (customer) => customer.redirectedTo === currentUser.name
    );
  }, [currentUser.name]);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <Users className="h-6 w-6" />
             <div>
                <CardTitle>Mis Clientes Asignados</CardTitle>
                <CardDescription>
                Estos son los clientes que han sido redireccionados para tu gestión.
                </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha de Redirección</TableHead>
                <TableHead>Notas del Asesor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedCustomers.length > 0 ? (
                assignedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone}</div>
                    </TableCell>
                    <TableCell>{customer.registrationDate}</TableCell>
                    <TableCell>
                      {customer.notes ? (
                        <Tooltip>
                            <TooltipTrigger>
                               <p className="line-clamp-2">{customer.notes}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{customer.notes}</p>
                            </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">Sin notas</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No tienes clientes asignados por el momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
