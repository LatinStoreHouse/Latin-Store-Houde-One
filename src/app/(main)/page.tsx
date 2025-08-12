import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Truck, PackageSearch } from 'lucide-react';

const overviewItems = [
  {
    title: 'En Almacén',
    value: '12,504',
    icon: Warehouse,
    description: '+2.5% desde el mes pasado',
  },
  {
    title: 'En Tránsito',
    value: '1,230',
    icon: Truck,
    description: '+15.1% desde el mes pasado',
  },
  {
    title: 'En Zona Franca',
    value: '3,456',
    icon: PackageSearch,
    description: '-3.2% desde el mes pasado',
  },
];

const recentActivities = [
    { id: 'ORD-001', item: 'Laptops de Alto Rendimiento', quantity: 50, status: 'Enviado', date: '2023-10-26' },
    { id: 'ORD-002', item: 'Sillas de Oficina Ergonómicas', quantity: 100, status: 'Procesando', date: '2023-10-25' },
    { id: 'ORD-003', item: 'Monitores 4K', quantity: 75, status: 'Entregado', date: '2023-10-24' },
    { id: 'ORD-004', item: 'Teclados Mecánicos', quantity: 200, status: 'Esperando Envío', date: '2023-10-23' },
    { id: 'ORD-005', item: 'Cámaras Web', quantity: 150, status: 'Enviado', date: '2023-10-22' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {overviewItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Pedido</TableHead>
                <TableHead>Artículo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.id}</TableCell>
                  <TableCell>{activity.item}</TableCell>
                  <TableCell>{activity.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'Entregado' ? 'default' : activity.status === 'Enviado' ? 'secondary' : 'outline'}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell>{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
