
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
import { MoreHorizontal, Search, Handshake, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Partner, initialPartnerData } from '@/lib/partners';
import { initialDistributorData } from '@/lib/distributors';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DistributorForm } from '@/components/distributor-form';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(() => [
    ...initialDistributorData.map(d => ({ ...d, type: 'Distribuidor' as const })),
    ...initialPartnerData
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>(undefined);
  const { toast } = useToast();

  const filteredPartners = useMemo(() => {
    return partners.filter(partner =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partners, searchTerm]);

  const handleOpenModal = (partner?: Partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };
  
  const handleSavePartner = (partnerData: Omit<Partner, 'id'>) => {
    if (selectedPartner) {
      // Edit
      setPartners(partners.map(p => p.id === selectedPartner.id ? { ...p, ...partnerData } as Partner : p));
      toast({ title: 'Socio Actualizado', description: 'Los datos del socio comercial se han actualizado.' });
    } else {
      // Add
      const newPartner: Partner = { 
          ...partnerData, 
          id: `SOCIO-${Date.now()}`
        };
      setPartners([...partners, newPartner]);
      toast({ title: 'Socio Agregado', description: 'El nuevo socio comercial se ha guardado.' });
    }
    setIsModalOpen(false);
  };
  
  const handleDeletePartner = (id: string) => {
     setPartners(partners.filter(p => p.id !== id));
     toast({ title: 'Socio Eliminado' });
  }

  const getStatusClasses = (status: 'Activo' | 'Inactivo') => {
    return status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
  
  const getTypeBadgeClasses = (type: 'Partner' | 'Distribuidor') => {
      return type === 'Distribuidor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Handshake className="h-6 w-6" />Gestión de Socios Comerciales</CardTitle>
            <CardDescription>
              Añada, vea y gestione su red de distribuidores y partners.
            </CardDescription>
          </div>
          <div className="flex gap-2">
           <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Socio
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
              <TableHead>Nombre del Socio</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium">{partner.name}</TableCell>
                <TableCell>
                  <div>{partner.contactName}</div>
                  <div className="text-sm text-muted-foreground">{partner.email}</div>
                  <div className="text-sm text-muted-foreground">{partner.phone}</div>
                </TableCell>
                <TableCell>{partner.city}, {partner.country}</TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent font-medium", getTypeBadgeClasses(partner.type))}>
                    {partner.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent", getStatusClasses(partner.status))}>
                    {partner.status}
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
                        <DropdownMenuItem onClick={() => handleOpenModal(partner)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePartner(partner.id)} className="text-destructive">
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
                <DialogTitle>{selectedPartner ? 'Editar Socio Comercial' : 'Agregar Nuevo Socio'}</DialogTitle>
                <DialogDescription>
                  {selectedPartner ? 'Actualice los detalles del socio.' : 'Complete el formulario para crear un nuevo socio comercial.'}
                </DialogDescription>
            </DialogHeader>
            <DistributorForm
                partner={selectedPartner}
                onSave={handleSavePartner}
                onCancel={() => setIsModalOpen(false)}
            />
        </DialogContent>
    </Dialog>
    </>
  );
}
