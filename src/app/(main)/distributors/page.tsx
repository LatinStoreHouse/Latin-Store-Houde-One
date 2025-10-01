
'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Handshake, PlusCircle, Edit, Trash2, ListFilter, X, Users, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Partner, initialPartnerData } from '@/lib/partners';
import { initialDistributorData } from '@/lib/distributors';
import { initialCustomerData, Customer } from '@/lib/customers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DistributorForm } from '@/components/distributor-form';
import { useUser } from '@/context/user-context';
import { roles } from '@/lib/roles';

const partnerTypes = ['Distribuidor', 'Partner'];

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(() => [
    ...initialDistributorData.map(d => ({ ...d, type: 'Distribuidor' as const })),
    ...initialPartnerData
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>(undefined);
  const { toast } = useToast();
  const { currentUser } = useUser();

  const userPermissions = useMemo(() => {
    const permissions = new Set<string>();
    currentUser.roles.forEach(userRole => {
      const roleConfig = roles.find(r => r.name === userRole);
      if (roleConfig) {
        roleConfig.permissions.forEach(p => permissions.add(p));
      }
    });
     currentUser.individualPermissions?.forEach(p => permissions.add(p));
    return Array.from(permissions);
  }, [currentUser]);
  
  const canManagePartners = userPermissions.includes('partners:manage');

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
        const searchMatch =
            partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.city.toLowerCase().includes(searchTerm.toLowerCase());
        
        const typeMatch = typeFilter.length === 0 || typeFilter.includes(partner.type);

        return searchMatch && typeMatch;
    });
  }, [partners, searchTerm, typeFilter]);
  
  const assignedCustomers = useMemo(() => {
    if (!selectedPartner) return [];
    return initialCustomerData.filter(
      (customer) => customer.redirectedTo === selectedPartner.name
    );
  }, [selectedPartner]);

  const handleOpenModal = (partner?: Partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };
  
  const handleOpenClientsModal = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsClientsModalOpen(true);
  };

  const handleOpenDetailsModal = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDetailsModalOpen(true);
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
  
  const toggleFilter = (filterSetter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    filterSetter(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setTypeFilter([]);
  }

  const areFiltersActive = typeFilter.length > 0;

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
          {canManagePartners && (
             <div className="flex gap-2">
                <Button onClick={() => handleOpenModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Socio
                </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, contacto o ciudad..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <div className="flex w-full sm:w-auto items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span>Filtros</span>
                        {areFiltersActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {partnerTypes.map(type => (
                        <DropdownMenuCheckboxItem
                            key={type}
                            checked={typeFilter.includes(type)}
                            onCheckedChange={() => toggleFilter(setTypeFilter, type)}
                        >
                            {type}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {areFiltersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="h-4 w-4" />
                    Limpiar
                </Button>
            )}
           </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Socio</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha de Entrada</TableHead>
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
                  <div className="text-sm text-muted-foreground">NIT/Cédula: {partner.taxId}</div>
                   {partner.email.map((e, i) => (
                      <div key={i} className="text-sm text-muted-foreground">{e}</div>
                   ))}
                   {partner.phone.map((p, i) => (
                       <div key={i} className="text-sm text-muted-foreground">{p}</div>
                   ))}
                </TableCell>
                <TableCell>{partner.startDate || 'N/A'}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDetailsModal(partner)}>
                            <Info className="mr-2 h-4 w-4" />
                            Ver Detalles
                        </DropdownMenuItem>
                         {canManagePartners && (
                           <>
                            <DropdownMenuItem onClick={() => handleOpenModal(partner)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenClientsModal(partner)}>
                                <Users className="mr-2 h-4 w-4" />
                                Ver Clientes Asignados
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePartner(partner.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                           </>
                         )}
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

    <Dialog open={isClientsModalOpen} onOpenChange={setIsClientsModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Clientes Asignados a {selectedPartner?.name}</DialogTitle>
                <DialogDescription>
                  Lista de clientes que han sido redireccionados a este socio comercial.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha de Redirección</TableHead>
                            <TableHead>Nota</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedCustomers.length > 0 ? (
                            assignedCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </TableCell>
                                    <TableCell>{customer.registrationDate}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{customer.notes?.split('\n---\n').pop()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No se han asignado clientes a este socio.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DialogContent>
    </Dialog>

    <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalles de {selectedPartner?.name}</DialogTitle>
                <DialogDescription>
                    Información completa del socio comercial.
                </DialogDescription>
            </DialogHeader>
            {selectedPartner && (
                <div className="space-y-4 py-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold text-muted-foreground">Tipo:</span> {selectedPartner.type}</div>
                        <div><span className="font-semibold text-muted-foreground">Estado:</span> <Badge className={cn("border-transparent", getStatusClasses(selectedPartner.status))}>{selectedPartner.status}</Badge></div>
                        <div><span className="font-semibold text-muted-foreground">NIT/Cédula:</span> {selectedPartner.taxId}</div>
                        <div><span className="font-semibold text-muted-foreground">Fecha de Entrada:</span> {selectedPartner.startDate || 'N/A'}</div>
                        <div className="col-span-2"><span className="font-semibold text-muted-foreground">Contacto Principal:</span> {selectedPartner.contactName}</div>
                        <div className="col-span-2 space-y-1">
                            <p className="font-semibold text-muted-foreground">Correos Electrónicos:</p>
                            {selectedPartner.email.map((e, i) => <p key={i}>{e}</p>)}
                        </div>
                         <div className="col-span-2 space-y-1">
                            <p className="font-semibold text-muted-foreground">Teléfonos:</p>
                            {selectedPartner.phone.map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                        <div className="col-span-2"><span className="font-semibold text-muted-foreground">Dirección:</span> {selectedPartner.address}, {selectedPartner.city}, {selectedPartner.country}</div>
                        <div><span className="font-semibold text-muted-foreground">Descuento:</span> {selectedPartner.discountPercentage || 0}%</div>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">Notas de Contrato:</p>
                        <p className="p-2 bg-muted/50 rounded-md mt-1">{selectedPartner.contractNotes || 'Sin notas.'}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-muted-foreground">Notas Generales:</p>
                        <p className="p-2 bg-muted/50 rounded-md mt-1">{selectedPartner.notes || 'Sin notas.'}</p>
                    </div>
                </div>
            )}
        </DialogContent>
    </Dialog>

    </>
  );
}
