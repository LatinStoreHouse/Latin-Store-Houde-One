
'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Palette, Link as LinkIcon, Download, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/app/(main)/layout';
import { useToast } from '@/hooks/use-toast';
import { initialDesignRequests, DesignRequest, DesignStatus } from '@/lib/designs';
import { DesignRequestForm } from '@/components/design-request-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const DesignRequestTable = ({ 
    requests,
    onOpenModal,
    onDeleteRequest,
    canEdit
}: {
    requests: DesignRequest[];
    onOpenModal: (request: DesignRequest) => void;
    onDeleteRequest: (id: string) => void;
    canEdit: boolean;
}) => {
    
    const getStatusBadgeVariant = (status: DesignStatus) => {
        switch (status) {
          case 'Pendiente': return 'secondary';
          case 'En Proceso': return 'default';
          case 'Completado': return 'success';
          case 'Rechazado': return 'destructive';
          default: return 'outline';
        }
    };

    if (requests.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No hay solicitudes en esta categoría.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Fecha Entrega Est.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Recursos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.customerName}</TableCell>
                  <TableCell>{req.advisor}</TableCell>
                  <TableCell>{req.requestDate}</TableCell>
                  <TableCell>{req.deliveryDate || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                        {req.status === 'Rechazado' && req.designerNotes && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{req.designerNotes}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    {req.mediaLink && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon">
                                    <a href={req.mediaLink} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="h-4 w-4" />
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver archivos de referencia</TooltipContent>
                        </Tooltip>
                    )}
                     {req.designFile && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon">
                                    <a href={req.designFile} download>
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </TooltipTrigger>
                             <TooltipContent>Descargar propuesta</TooltipContent>
                        </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onOpenModal(req)} disabled={!canEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar / Gestionar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive" disabled={!canEdit}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará la solicitud permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteRequest(req.id)} className="bg-destructive hover:bg-destructive/90">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    );
};

export default function DesignRequestsPage() {
  const [requests, setRequests] = useState<DesignRequest[]>(initialDesignRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DesignRequest | null>(null);
  const { currentUser } = useUser();
  const { toast } = useToast();
  
  const canCreate = currentUser.roles.includes('Asesor de Ventas') || currentUser.roles.includes('Administrador');
  const canEdit = currentUser.roles.includes('Diseño') || currentUser.roles.includes('Administrador');

  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'Pendiente'), [requests]);
  const inProgressRequests = useMemo(() => requests.filter(r => r.status === 'En Proceso'), [requests]);
  const historyRequests = useMemo(() => requests.filter(r => r.status === 'Completado' || r.status === 'Rechazado'), [requests]);

  const handleOpenModal = (request?: DesignRequest) => {
    setEditingRequest(request || null);
    setIsModalOpen(true);
  };

  const handleSaveRequest = (requestData: Omit<DesignRequest, 'id' | 'requestDate' | 'advisor'>) => {
    if (editingRequest) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...editingRequest, ...requestData } : r));
      toast({ title: 'Solicitud Actualizada', description: 'Los detalles de la solicitud de diseño han sido actualizados.' });
    } else {
      const newRequest: DesignRequest = {
        id: `DREQ-${Date.now()}`,
        requestDate: new Date().toISOString().split('T')[0],
        advisor: currentUser.name,
        ...requestData
      };
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: 'Solicitud Creada', description: 'Tu solicitud de diseño ha sido enviada.' });
    }
    setIsModalOpen(false);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({ variant: 'destructive', title: 'Solicitud Eliminada' });
  };
  

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette />
              Gestión de Solicitudes de Diseño
            </CardTitle>
            <CardDescription>
              Crea y gestiona las solicitudes de diseño para los clientes.
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pendientes" className="w-full">
            <TabsList>
                <TabsTrigger value="pendientes">Pendientes ({pendingRequests.length})</TabsTrigger>
                <TabsTrigger value="en-proceso">En Proceso ({inProgressRequests.length})</TabsTrigger>
                <TabsTrigger value="historial">Historial ({historyRequests.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pendientes" className="pt-4">
               <DesignRequestTable 
                 requests={pendingRequests}
                 onOpenModal={handleOpenModal}
                 onDeleteRequest={handleDeleteRequest}
                 canEdit={canEdit}
               />
            </TabsContent>
             <TabsContent value="en-proceso" className="pt-4">
               <DesignRequestTable 
                 requests={inProgressRequests}
                 onOpenModal={handleOpenModal}
                 onDeleteRequest={handleDeleteRequest}
                 canEdit={canEdit}
               />
            </TabsContent>
             <TabsContent value="historial" className="pt-4">
               <DesignRequestTable 
                 requests={historyRequests}
                 onOpenModal={handleOpenModal}
                 onDeleteRequest={handleDeleteRequest}
                 canEdit={canEdit}
               />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRequest ? 'Editar Solicitud de Diseño' : 'Nueva Solicitud de Diseño'}</DialogTitle>
          </DialogHeader>
          <DesignRequestForm 
            request={editingRequest} 
            onSave={handleSaveRequest} 
            onCancel={() => setIsModalOpen(false)}
            isDesigner={canEdit}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
