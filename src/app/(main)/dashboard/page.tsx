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
    TrendingUp,
    TrendingDown,
    Users,
    UserCog,
    Tags,
    ShieldCheck,
    CheckSquare,
    BookUser,
    FileText,
    BotMessageSquare,
    Ship
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

const topMovers = [
    { name: 'KUND MULTY 1.22 X 0.61', moved: 152, change: 12.5 },
    { name: 'CONCRETO GRIS 1.22 X 0.61', moved: 121, change: 8.2 },
    { name: 'TAN 1.22 X 0.61', moved: 98, change: 5.1 },
    { name: 'CARRARA 2.44 X 1.22', moved: 85, change: 15.3 },
    { name: 'SILVER SHINE GOLD 1.22 X 0.61', moved: 76, change: -2.1 },
];

const bottomMovers = [
    { name: 'MINT WHITE 1.22 X 0.61', moved: 2, change: 0 },
    { name: 'COPPER 2.44 X 1.22', moved: 1, change: 0 },
    { name: 'CONCRETO MEDIO 2.44 X 1.22', moved: 1, change: 0 },
    { name: 'PANEL 3D - TAN 1.22 X 0.61', moved: 0, change: 0 },
    { name: 'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22', moved: 0, change: 0 },
];

const navItems = [
  { href: '/inventory', label: 'Inventario', icon: Warehouse, permission: 'inventory:view' },
  { href: '/transit', label: 'Contenedores', icon: Ship, permission: 'inventory:transit' },
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
    <Button variant="outline" className="flex flex-col h-28 w-full justify-center" asChild>
        <Link href={href}>
            <Icon className="h-8 w-8 text-primary mb-2" />
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

    const accessibleNavItems = navItems.filter(hasPermission);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {overviewItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Navega a las secciones más importantes de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {accessibleNavItems.map(item => (
                <QuickAccessItem key={item.label} href={item.href} icon={item.icon} label={item.label} />
            ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
                <CardTitle>Productos con Mayor Movimiento</CardTitle>
                <CardDescription>Los productos más vendidos este mes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Movidas</TableHead>
                            <TableHead className="text-right">Cambio</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topMovers.map(item => (
                            <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.moved}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={item.change > 0 ? 'default' : 'destructive'} className="flex w-fit items-center gap-1 ml-auto">
                                        {item.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {item.change}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Productos con Menor Movimiento</CardTitle>
                <CardDescription>Los productos menos vendidos este mes.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Movidas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bottomMovers.map(item => (
                            <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.moved}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
