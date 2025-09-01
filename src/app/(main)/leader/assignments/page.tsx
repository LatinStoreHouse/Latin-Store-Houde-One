
'use client';
import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initialCustomerData, Customer } from '@/lib/customers';
import { useUser } from '@/app/(main)/layout';
import { Briefcase, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Assignment extends Customer {
    transferNote: string;
    transferDate: string;
}

export default function LeaderAssignmentsPage() {
  const { currentUser } = useUser();

  const assignedCustomersByDate = useMemo(() => {
    const assignments: Assignment[] = [];
    
    // This logic relies on the note format defined in the Customers page.
    const transferRegex = new RegExp(`Cliente transferido de .* a .* por ${currentUser.name}. Nota: (.*)`);

    initialCustomerData.forEach(customer => {
      if (customer.notes) {
        const notesArray = customer.notes.split('\n---\n');
        notesArray.forEach(noteBlock => {
            const match = noteBlock.match(transferRegex);
            if (match) {
                // A more robust solution would be to store transfer date, but for now we use registration date as a proxy
                assignments.push({
                    ...customer,
                    transferNote: match[1] || 'Sin nota.',
                    transferDate: customer.registrationDate, // Placeholder date
                });
            }
        });
      }
    });

    // Group by month and then by day
    return assignments.reduce((acc, assignment) => {
        const date = new Date(assignment.transferDate);
        const month = date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
        const day = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });

        if (!acc[month]) {
            acc[month] = {};
        }
        if (!acc[month][day]) {
            acc[month][day] = [];
        }
        acc[month][day].push(assignment);
        return acc;
    }, {} as Record<string, Record<string, Assignment[]>>);

  }, [currentUser.name]);

  const sortedMonths = Object.keys(assignedCustomersByDate).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
           <Briefcase className="h-6 w-6" />
           <div>
              <CardTitle>Mis Asignaciones de Clientes</CardTitle>
              <CardDescription>
              Un historial de los clientes que has transferido a otros asesores.
              </CardDescription>
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedMonths.length > 0 ? (
            sortedMonths.map(month => (
                <div key={month} className="space-y-4">
                    <h2 className="text-lg font-semibold capitalize sticky top-0 bg-background/80 backdrop-blur-sm py-2">{month}</h2>
                     {Object.keys(assignedCustomersByDate[month]).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()).map(day => (
                        <div key={day} className="ml-4 space-y-3">
                             <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {day}
                             </h3>
                             <div className="pl-6 border-l-2 border-dashed space-y-4">
                                {assignedCustomersByDate[month][day].map(customer => (
                                    <div key={customer.id} className="p-4 rounded-lg border bg-card shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                               <p className="font-semibold">{customer.name}</p>
                                               <p className="text-sm text-muted-foreground">{customer.email}</p>
                                            </div>
                                            <Badge variant="secondary">Asignado a: {customer.assignedTo}</Badge>
                                        </div>
                                         <Separator className="my-2"/>
                                         <p className="text-sm text-muted-foreground italic">"{customer.transferNote}"</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                     ))}
                </div>
            ))
        ) : (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium text-muted-foreground">No hay asignaciones para mostrar.</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Cuando transfiera un cliente a otro asesor desde la página de Clientes, aparecerá aquí.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
