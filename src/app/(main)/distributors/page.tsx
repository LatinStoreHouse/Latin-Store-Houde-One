
'use client';
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Store, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Distributor, initialDistributorData } from '@/lib/distributors';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DistributorForm } from '@/components/distributor-form';

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>(initialDistributorData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | undefined>(undefined);
  const { toast } = useToast();

  const filteredDistributors = useMemo(() => {
    return distributors.filter(distributor =>
      distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [distributors, searchTerm]);

  const handleOpenModal = (distributor?: Distributor) => {
    setSelectedDistributor(distributor);
    setIsModalOpen(true);
  };
  
  const handleSaveDistributor = (distributorData: Omit<Distributor, 'id'>) => {
    if (selectedDistributor) {
      // Edit
      setDistributors(distributors.map(d => d.id === selectedDistributor.id ? { ...d, ...distributorData } as Distributor : d));
      toast({ title: 'Distribuidor Actualizado', description: 'Los datos del distribuidor se han actualizado.' });
    } else {
      // Add
      const newDistributor: Distributor = { 
          ...distributorData, 
          id: `DIST-${Date.now()}`
        };
      setDistributors([...distributors, newDistributor]);
      toast({ title: 'Distribuidor Agregado', description: 'El nuevo distribuidor se ha guardado.' });
    }
    setIsModalOpen(false);
  };
  
  const handleDeleteDistributor = (id: string) => {
     setDistributors(distributors.filter(d => d.id !== id));
     toast({ title: 'Distribuidor Eliminado' });
  }

  const getStatusClasses = (status: 'Activo' | 'Inactivo') => {
    return status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Store className="h-6 w-6" />Gestión de Distribuidores</CardTitle>
            <CardDescription>
              Añada, vea y gestione su red de distribuidores.
            </CardDescription>
          </div>
          <div className="flex gap-2">
           <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Distribuidor
          </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, contacto o ciudad..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Distribuidor</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDistributors.map((distributor) => (
              <TableRow key={distributor.id}>
                <TableCell className="font-medium">{distributor.name}</TableCell>
                <TableCell>
                  <div>{distributor.contactName}</div>
                  <div className="text-sm text-muted-foreground">{distributor.email}</div>
                  <div className="text-sm text-muted-foreground">{distributor.phone}</div>
                </TableCell>
                <TableCell>{distributor.city}, {distributor.country}</TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent", getStatusClasses(distributor.status))}>
                    {distributor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleOpenModal(distributor)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDistributor(distributor.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedDistributor ? 'Editar Distribuidor' : 'Agregar Nuevo Distribuidor'}</DialogTitle>
                <DialogDescription>
                  {selectedDistributor ? 'Actualice los detalles del distribuidor.' : 'Complete el formulario para crear un nuevo socio comercial.'}
                </DialogDescription>
            </DialogHeader>
            <DistributorForm
                distributor={selectedDistributor}
                onSave={handleSaveDistributor}
                onCancel={() => setIsModalOpen(false)}
            />
        </DialogContent>
    </Dialog>
    </>
  );
}
