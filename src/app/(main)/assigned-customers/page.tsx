
'use client';
import React, { useMemo, useState } from 'react';
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
import { initialCustomerData, Customer, customerStatuses, CustomerStatus } from '@/lib/customers';
import { useUser } from '@/context/user-context';
import { BookUser, StickyNote, MoreHorizontal, Edit, Milestone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AssignedCustomersPage() {
  const { currentUser } = useUser();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>(initialCustomerData);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [currentStatus, setCurrentStatus] = useState<CustomerStatus>('Contactado');


  const assignedCustomers = useMemo(() => {
    return customers.filter(
      (customer) => customer.redirectedTo === currentUser.name
    );
  }, [currentUser.name, customers]);

  const handleOpenNoteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentNote(customer.notes || '');
    setIsNoteModalOpen(true);
  };
  
  const handleOpenStatusModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentStatus(customer.status);
    setIsStatusModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedCustomer) return;

    setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id ? { ...c, notes: currentNote } : c
    ));
    toast({ title: 'Nota Actualizada', description: `Se ha guardado la nota para ${selectedCustomer.name}.` });
    setIsNoteModalOpen(false);
  };
  
  const handleSaveStatus = () => {
    if (!selectedCustomer) return;

    setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id ? { ...c, status: currentStatus } : c
    ));
    toast({ title: 'Estado Actualizado', description: `El estado de ${selectedCustomer.name} es ahora ${currentStatus}.` });
    setIsStatusModalOpen(false);
  };


  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <BookUser className="h-6 w-6" />
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
                <TableHead>Notas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
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
                    <TableCell>{customer.status}</TableCell>
                    <TableCell className="text-center">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleOpenStatusModal(customer)}>
                                    <Milestone className="mr-2 h-4 w-4" />
                                    Editar Estado
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenNoteModal(customer)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Añadir/Editar Nota
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No tienes clientes asignados por el momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir/Editar Nota para {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>Guarda un registro de tus interacciones y seguimientos con este cliente.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note-textarea" className="sr-only">Nota</Label>
            <Textarea 
              id="note-textarea"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              rows={6}
              placeholder="Escribe tus notas aquí..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNote}>Guardar Nota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Estado de {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>Selecciona el nuevo estado de este cliente en tu proceso de venta.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status-select">Estado del Cliente</Label>
            <Select value={currentStatus} onValueChange={(value) => setCurrentStatus(value as CustomerStatus)}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {customerStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveStatus}>Actualizar Estado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
}
