import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, FilePlus2, Check, X } from 'lucide-react';

const pendingOrders = [
  { id: 'ORD-128', customer: 'Tech Solutions Inc.', amount: '$4,500.00', date: '2023-11-01', requestedBy: 'John Doe' },
  { id: 'ORD-129', customer: 'Innovate Co.', amount: '$1,230.50', date: '2023-11-01', requestedBy: 'Jane Smith' },
  { id: 'ORD-130', customer: 'Global Exports', amount: '$12,800.00', date: '2023-10-31', requestedBy: 'Peter Jones' },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validaciones Pendientes</CardTitle>
          <CardDescription>Revise y apruebe o rechace los pedidos pendientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Solicitado por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.requestedBy}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Centro de Documentos</CardTitle>
          <CardDescription>Genere nuevas cotizaciones, remitos o facturas para los clientes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-8 text-center">
                <FilePlus2 className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">Nueva Cotización</h3>
                <p className="text-sm text-muted-foreground">Crear una nueva cotización de ventas para un cliente.</p>
                <Button>Crear Cotización</Button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-8 text-center">
                <FilePlus2 className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">Nuevo Remito</h3>
                <p className="text-sm text-muted-foreground">Emitir un remito para un envío.</p>
                <Button>Crear Remito</Button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-8 text-center">
                <FilePlus2 className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">Nueva Factura</h3>
                <p className="text-sm text-muted-foreground">Generar una factura final para un pedido completado.</p>
                <Button>Crear Factura</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
