

'use client';
import Link from 'next/link';
import React, { useState, useMemo, useContext, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
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
    Clock,
    BarChart,
    Download,
    DollarSign,
    Package
} from 'lucide-react';
import { Role, roles } from '@/lib/roles';
import { InventoryContext, AppNotification } from '@/context/inventory-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navItems } from '@/components/main-layout';
import { useUser } from '@/context/user-context';
import { initialSalesData } from '@/lib/sales-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MonthPicker } from '@/components/month-picker';
import { Separator } from '@/components/ui/separator';
import { ResponsiveContainer, Pie, Cell, Tooltip as RechartsTooltip, Legend, PieChart } from 'recharts';
import { initialCustomerData } from '@/lib/customers';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicMonthlyAnalysis = dynamic(() => import('@/components/dashboard/monthly-analysis').then(mod => mod.MonthlyAnalysis), {
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false,
});

const DynamicTopMovers = dynamic(() => import('@/components/dashboard/top-movers').then(mod => mod.TopMovers), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});

const DynamicBottomMovers = dynamic(() => import('@/components/dashboard/bottom-movers').then(mod => mod.BottomMovers), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});


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

const latestQuotes = [
    { id: 'COT-2024-088', customer: 'Diseños Modernos SAS', date: '2024-07-28' },
    { id: 'COT-2024-087', customer: 'Constructora XYZ', date: '2024-07-27' },
    { id: 'COT-2024-086', customer: 'Hogar Futuro', date: '2024-07-26' },
];

const QuickAccessItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string; }) => (
    <Button variant="outline" className="flex flex-col h-28 w-full justify-center" asChild>
        <Link href={href}>
            <Icon className="h-8 w-8 text-primary mb-2" />
            <span className="text-center text-xs whitespace-normal">{label}</span>
        </Link>
    </Button>
);


export default function DashboardPage() {
    const inventoryContext = useContext(InventoryContext);
    const userContext = useUser();
    if (!inventoryContext || !userContext) {
      throw new Error('DashboardPage must be used within an InventoryProvider and UserProvider');
    }
    const { notifications, reservations, addNotification } = inventoryContext;
    const { currentUser } = userContext;

    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsDate, setStatsDate] = useState(new Date());
    const [visibleNotifications, setVisibleNotifications] = useState<AppNotification[]>([]);

    const currentUserRole = currentUser.roles[0];
    const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];

    useEffect(() => {
        // Show only the 3 latest unread notifications relevant to the user
        const unread = notifications
            .filter(n => !n.read)
            .filter(n => (!n.user && !n.role) || (n.user === currentUser.name) || (n.role && currentUser.roles.includes(n.role)))
            .slice(0, 3);
        setVisibleNotifications(unread);
    }, [notifications, currentUser.name, currentUser.roles]);

    const dismissDashboardNotification = (id: number) => {
        setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    };

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        return userPermissions.includes(permission);
    };

    const expiringReservations = useMemo(() => {
        const canView = currentUser.roles.includes('Administrador') || currentUser.roles.includes('Asesor de Ventas');
        if (!canView) return [];

        const now = new Date();
        return reservations.filter(r => {
            if (r.status !== 'Validada' || !r.expirationDate) return false;
            
            // Advisors only see their own expiring reservations
            if (currentUser.roles.includes('Asesor de Ventas') && !currentUser.roles.includes('Administrador') && r.advisor !== currentUser.name) {
                return false;
            }

            const expiration = new Date(r.expirationDate);
            const diffTime = expiration.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 2 && diffDays >= 0;
        });
    }, [reservations, currentUser.name, currentUser.roles]);

    const allNavItems = navItems.flatMap(item => item.subItems ? item.subItems.map(sub => ({...sub, icon: item.icon})) : [{ ...item, icon: item.icon }]);
    const accessibleNavItems = allNavItems.filter(item => item.href !== '/dashboard' && hasPermission(item.permission));
    const overviewItems = currentUserRole === 'Asesor de Ventas' ? salesOverviewItems : inventoryOverviewItems;
    const isAdvisor = currentUserRole === 'Asesor de Ventas';
  
  return (
    <>
    <div className="space-y-6">
      <div className="space-y-4">
        {expiringReservations.map(res => (
            <Alert key={`exp-${res.id}`} variant="destructive" className="relative">
             <Clock className="h-4 w-4" />
             <AlertTitle className="font-semibold">¡Reserva a Punto de Expirar!</AlertTitle>
             <AlertDescription>
                Tu reserva para **{res.quantity} unidades** de **{res.product}** ({res.quoteNumber}) vence el **{res.expirationDate}**. Por favor, gestiona el despacho pronto.
             </AlertDescription>
           </Alert>
        ))}
        {visibleNotifications.map(notification => (
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
                onClick={() => dismissDashboardNotification(notification.id)}
             >
                <X className="h-4 w-4" />
             </Button>
           </Alert>
        ))}
      </div>

      <div className="flex justify-end gap-2">
          {isAdvisor && (
              <Button variant="outline" onClick={() => setIsStatsModalOpen(true)}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Mis Estadísticas
              </Button>
          )}
      </div>

      {currentUserRole !== 'Partners' && currentUserRole !== 'Marketing' && (
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
      
      {(currentUserRole === 'Partners' || currentUserRole === 'Asesor de Ventas') && (
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

      {currentUserRole !== 'Partners' && currentUserRole !== 'Asesor de Ventas' && currentUserRole !== 'Marketing' &&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <DynamicTopMovers />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <DynamicBottomMovers />
            </Suspense>
        </div>
      )}
    </div>

    {isAdvisor && (
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Estadísticas de {currentUser.name}</DialogTitle>
                    <DialogDescription>
                        Revise su rendimiento de captación de clientes y el estado general de su cartera.
                    </DialogDescription>
                </DialogHeader>
                <Suspense fallback={<div className="h-[400px] flex justify-center items-center"><Skeleton className="h-full w-full" /></div>}>
                    <DynamicMonthlyAnalysis date={statsDate} onDateChange={setStatsDate} />
                </Suspense>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}
