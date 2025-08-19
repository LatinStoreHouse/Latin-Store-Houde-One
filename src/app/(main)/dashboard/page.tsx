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
    TrendingUp,
    TrendingDown,
    Users,
    Bell,
    X,
    Receipt,
} from 'lucide-react';
import { Role, roles } from '@/lib/roles';
import { useContext } from 'react';
import { InventoryContext } from '@/context/inventory-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navItems, useUser } from '@/app/(main)/layout';


const inventoryOverviewItems = [
  {
    title: 'En Almacén',
    value: '12,504',
    icon: TrendingUp,
    description: '+2.5% desde el mes pasado',
  },
  {
    title: 'En Tránsito',
    value: '1,230',
    icon: TrendingUp,
    description: '+15.1% desde el mes pasado',
  },
  {
    title: 'En Zona Franca',
    value: '3,456',
    icon: TrendingDown,
    description: '-3.2% desde el mes pasado',
  },
];

const salesOverviewItems = [
    {
      title: 'Nuevos Clientes',
      value: '+235',
      icon: Users,
      description: '+18.1% desde el mes pasado',
    },
    {
      title: 'Cotizaciones Enviadas',
      value: '1,286',
      icon: TrendingUp,
      description: '+12.2% desde el mes pasado',
    },
    {
      title: 'Ventas Cerradas',
      value: '315',
      icon: TrendingUp,
      description: '+8.9% desde el mes pasado',
    },
]

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

const latestQuotes = [
    { id: 'COT-2024-088', customer: 'Diseños Modernos SAS', date: '2024-07-28' },
    { id: 'COT-2024-087', customer: 'Constructora XYZ', date: '2024-07-27' },
    { id: 'COT-2024-086', customer: 'Hogar Futuro', date: '2024-07-26' },
];

const QuickAccessItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string; }) => (
    <Button variant="outline" className="flex flex-col h-28 w-full justify-center" asChild>
        <Link href={href}>
            <Icon className="h-8 w-8 text-primary mb-2" />
            <span className="text-center text-xs">{label}</span>
        </Link>
    </Button>
);

export default function DashboardPage() {
    const inventoryContext = useContext(InventoryContext);
    const userContext = useUser();
    if (!inventoryContext || !userContext) {
      throw new Error('DashboardPage must be used within an InventoryProvider and UserProvider');
    }
    const { notifications, dismissNotification } = inventoryContext;
    const { currentUser } = userContext;

    const currentUserRole = currentUser.roles[0];
    const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        return userPermissions.includes(permission);
    };

    const allNavItems = navItems.flatMap(item => item.subItems ? item.subItems.map(sub => ({...sub, icon: item.icon})) : [{ ...item, icon: item.icon }]);
    const accessibleNavItems = allNavItems.filter(item => item.href !== '/dashboard' && hasPermission(item.permission));
    const overviewItems = currentUserRole === 'Asesor de Ventas' ? salesOverviewItems : inventoryOverviewItems;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notifications.map(notification => (
           <Alert key={notification.id} className="relative bg-primary/10 border-primary/20">
             <Bell className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary font-semibold">{notification.title}</AlertTitle>
             <AlertDescription className="text-primary/80">
                {notification.message}
             </AlertDescription>
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 text-primary/80 hover:text-primary"
                onClick={() => dismissNotification(notification.id)}
             >
                <X className="h-4 w-4" />
             </Button>
           </Alert>
        ))}
      </div>

      {currentUserRole !== 'Partners' && (
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
      )}


      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Navega a las secciones más importantes de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {accessibleNavItems.map(item => (
                <QuickAccessItem key={item.label} href={item.href!} icon={item.icon} label={item.label} />
            ))}
        </CardContent>
      </Card>
      
      {currentUserRole === 'Partners' && (
        <Card>
           <CardHeader>
              <CardTitle>Últimas Cotizaciones</CardTitle>
              <CardDescription>Un vistazo rápido a tus cotizaciones más recientes.</CardDescription>
           </CardHeader>
           <CardContent>
              <Table>
                 <TableHeader>
                    <TableRow>
                       <TableHead># Cotización</TableHead>
                       <TableHead>Cliente</TableHead>
                       <TableHead>Fecha</TableHead>
                       <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {latestQuotes.map(quote => (
                       <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.id}</TableCell>
                          <TableCell>{quote.customer}</TableCell>
                          <TableCell>{quote.date}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                  <Link href="/invoices">Ver Detalle</Link>
                              </Button>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      )}

      {currentUserRole !== 'Partners' && currentUserRole !== 'Asesor de Ventas' && (
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
      )}
    </div>
  );
}
