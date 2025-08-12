'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { 
    Warehouse, 
    Truck, 
    PackageSearch,
    LayoutDashboard,
    Users,
    UserCog,
    LogOut,
    Calculator,
    ChevronDown,
    Tags,
    ShieldCheck,
    CheckSquare,
    Container,
    BookUser,
    FileText,
    BotMessageSquare
} from 'lucide-react';
import { Role, roles } from '@/lib/roles';

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

const navItems = [
  { href: '/inventory', label: 'Inventario', icon: Warehouse, permission: 'inventory:view' },
  { href: '/transit', label: 'Tránsito', icon: Truck, permission: 'inventory:transit' },
  { href: '/reservations', label: 'Reservas', icon: BookUser, permission: 'reservations:view' },
  { href: '/orders', label: 'Despachos', icon: Truck, permission: 'orders:view' },
  { href: '/validation', label: 'Validación', icon: CheckSquare, permission: 'validation:view' },
  { href: '/customers', label: 'Clientes', icon: Users, permission: 'customers:view' },
  { href: '/pricing', label: 'Precios', icon: Tags, permission: 'pricing:view' },
  { href: '/users', label: 'Usuarios', icon: UserCog, permission: 'users:manage' },
  { href: '/reports', label: 'Reportes', icon: FileText, permission: 'reports:view' },
  { href: '/advisor', label: 'Asesor IA', icon: BotMessageSquare, permission: 'advisor:use' },
];

const currentUserRole: Role = 'Administrador';

const QuickAccessItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string; }) => (
    <Button variant="outline" className="flex flex-col h-24 w-full" asChild>
        <Link href={href}>
            <Icon className="h-8 w-8 text-primary mb-1" />
            <span className="text-center text-xs">{label}</span>
        </Link>
    </Button>
);

export default function DashboardPage() {
    const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];

    const hasPermission = (item: any) => {
        if (!item.permission) return true;
        return userPermissions.includes(item.permission);
    };

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
              <CardTitle>Accesos Directos</CardTitle>
              <CardDescription>Navegue rápidamente a las secciones más importantes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {navItems.filter(hasPermission).map((item) => (
                item.href && <QuickAccessItem key={item.label} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </CardContent>
      </Card>

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
