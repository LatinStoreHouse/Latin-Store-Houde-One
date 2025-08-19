'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Megaphone, Users, Send } from 'lucide-react';
import { Role, roles } from '@/lib/roles';
import { useUser } from '@/app/(main)/layout';


const campaigns = [
  {
    id: 'CAMP-001',
    name: 'Promo Verano StoneFlex',
    date: '2024-07-15',
    recipients: 253,
    status: 'Enviado',
  },
  {
    id: 'CAMP-002',
    name: 'Lanzamiento Starwood 2024',
    date: '2024-06-20',
    recipients: 812,
    status: 'Enviado',
  },
  {
    id: 'CAMP-003',
    name: 'Descuento Clientes Inactivos',
    date: '2024-05-01',
    recipients: 50,
    status: 'Enviado',
  },
];

type Campaign = typeof campaigns[0];

export default function CampaignsPage() {
    const { currentUser } = useUser();
    const currentUserRole = currentUser.roles[0];
    const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];
    const canCreate = userPermissions.includes('marketing:create');

    const getStatusBadgeVariant = (status: Campaign['status']) => {
        switch (status) {
            case 'Enviado': return 'success';
            case 'Borrador': return 'secondary';
            case 'Programado': return 'default';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Campañas</CardTitle>
            <CardDescription>
              Cree, gestione y analice sus campañas de marketing por correo electrónico y WhatsApp.
            </CardDescription>
          </div>
          {canCreate && (
             <Button asChild>
                <Link href="/marketing/campaigns/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Campaña
                </Link>
             </Button>
          )}
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre de la Campaña</TableHead>
                        <TableHead>Fecha de Envío</TableHead>
                        <TableHead className="text-center">Destinatarios</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>{campaign.date}</TableCell>
                            <TableCell className="text-center">{campaign.recipients}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(campaign.status)}>
                                    {campaign.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
