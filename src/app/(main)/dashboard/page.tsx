

'use client';
import Link from 'next/link';
import React, { useState, useMemo, useContext } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
    Download
} from 'lucide-react';
import { Role, roles } from '@/lib/roles';
import { InventoryContext } from '@/context/inventory-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navItems, useUser } from '@/app/(main)/layout';
import { initialSalesData } from '@/lib/sales-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MonthPicker } from '@/components/month-picker';
import { Separator } from '@/components/ui/separator';
import { ResponsiveContainer, Pie, Cell, Tooltip as RechartsTooltip, Legend, PieChart } from 'recharts';
import { initialCustomerData } from '@/lib/customers';


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
    { name: 'Mint white', moved: 2, change: 0 },
    { name: 'Copper', moved: 1, change: 0 },
    { name: 'Concreto medio', moved: 1, change: 0 },
    { name: 'Panel 3d - tan', moved: 0, change: 0 },
    { name: 'Indian autumn translucido', moved: 0, change: 0 },
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

const PIE_COLORS = ['#29ABE2', '#00BCD4', '#f44336', '#E2E229', '#E29ABE', '#FFC107', '#4CAF50'];

export default function DashboardPage() {
    const inventoryContext = useContext(InventoryContext);
    const userContext = useUser();
    if (!inventoryContext || !userContext) {
      throw new Error('DashboardPage must be used within an InventoryProvider and UserProvider');
    }
    const { notifications, dismissNotification, reservations } = inventoryContext;
    const { currentUser } = userContext;

    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsDate, setStatsDate] = useState(new Date());

    const currentUserRole = currentUser.roles[0];
    const userPermissions = roles.find(r => r.name === currentUserRole)?.permissions || [];

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        return userPermissions.includes(permission);
    };

    const expiringReservations = useMemo(() => {
        if (currentUserRole !== 'Asesor de Ventas') return [];

        const now = new Date();
        return reservations.filter(r => {
            if (r.advisor !== currentUser.name || r.status !== 'Validada') return false;
            
            // This logic assumes a `validationDate` property exists. 
            // Since it's not on the Reservation type, we'll simulate it for now.
            // In a real app, this should be part of the reservation data.
            const validationDate = new Date(new Date().setDate(now.getDate() - (Math.random() * 10))); // Mock date
            const diffTime = now.getTime() - validationDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 5;
        });
    }, [reservations, currentUser.name, currentUserRole]);

    const allNavItems = navItems.flatMap(item => item.subItems ? item.subItems.map(sub => ({...sub, icon: item.icon})) : [{ ...item, icon: item.icon }]);
    const accessibleNavItems = allNavItems.filter(item => item.href !== '/dashboard' && hasPermission(item.permission));
    const overviewItems = currentUserRole === 'Asesor de Ventas' ? salesOverviewItems : inventoryOverviewItems;
    const isAdvisor = currentUserRole === 'Asesor de Ventas';
  
    const advisorStats = useMemo(() => {
        if (!isAdvisor) return null;
        
        // Stats for the selected month
        const year = statsDate.getFullYear();
        const month = statsDate.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

        const newCustomersThisMonth = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return c.assignedTo === currentUser.name && regDate.getFullYear() === year && regDate.getMonth() === month;
        });
        
        const monthlySales = initialSalesData[currentUser.name]?.[monthKey]?.sales || 0;

        // Stats for all time for the pie chart
        const allAdvisorCustomers = initialCustomerData.filter(c => c.assignedTo === currentUser.name);
        const statusDistribution = allAdvisorCustomers.reduce((acc, customer) => {
            acc[customer.status] = (acc[customer.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            newCustomersCount: newCustomersThisMonth.length,
            newCustomersList: newCustomersThisMonth,
            statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
            monthlySales: monthlySales,
        }

    }, [isAdvisor, statsDate, currentUser.name]);

     const handleDownloadStats = () => {
        if (!advisorStats) return;
        const doc = new jsPDF();
        const monthName = statsDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
        
        doc.setFontSize(18);
        doc.text(`Reporte de Asesor - ${currentUser.name}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Mes: ${monthName}`, 14, 30);

        doc.setFontSize(12);
        doc.text(`Nuevos Clientes en ${monthName}: ${advisorStats.newCustomersCount}`, 14, 45);

        doc.autoTable({
            startY: 50,
            head: [['Nombre', 'Email', 'Teléfono', 'Fuente']],
            body: advisorStats.newCustomersList.map(c => [c.name, c.email, c.phone, c.source]),
        });
        
        doc.save(`Reporte_${currentUser.name}_${format(statsDate, 'yyyy-MM')}.pdf`);
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        }).format(value);
    };

  return (
    <>
    <div className="space-y-6">
      <div className="space-y-4">
        {expiringReservations.map(res => (
            <Alert key={`exp-${res.id}`} variant="destructive" className="relative">
             <Clock className="h-4 w-4" />
             <AlertTitle className="font-semibold">¡Reserva a Punto de Expirar!</AlertTitle>
             <AlertDescription>
                Tu reserva para **{res.quantity} unidades** de **{res.product}** ({res.quoteNumber}) fue validada hace más de 5 días. Por favor, gestiona el despacho pronto para no perder el material separado.
             </AlertDescription>
           </Alert>
        ))}
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

      {isAdvisor && (
          <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsStatsModalOpen(true)}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Mis Estadísticas
              </Button>
          </div>
      )}

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

    {isAdvisor && advisorStats && (
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Estadísticas de {currentUser.name}</DialogTitle>
                    <DialogDescription>
                        Revise su rendimiento de captación de clientes y el estado general de su cartera.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Rendimiento Mensual</CardTitle>
                                <div className="flex items-center justify-between">
                                 <p className="text-sm text-muted-foreground">Datos para el mes seleccionado.</p>
                                 <MonthPicker date={statsDate} onDateChange={setStatsDate} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nuevos Clientes</p>
                                        <p className="text-2xl font-bold">{advisorStats.newCustomersCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Ventas</p>
                                        <p className="text-2xl font-bold">{formatCurrency(advisorStats.monthlySales)}</p>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <h4 className="font-semibold mb-2">Clientes Captados este Mes:</h4>
                                {advisorStats.newCustomersList.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Fuente</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {advisorStats.newCustomersList.map(c => (
                                                <TableRow key={c.id}>
                                                    <TableCell>{c.name}</TableCell>
                                                    <TableCell>{c.source}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">No hay nuevos clientes este mes.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4">
                       <Card>
                         <CardHeader>
                            <CardTitle className="text-lg">Estado General de Clientes</CardTitle>
                             <CardDescription>Distribución de todos sus clientes por estado.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={advisorStats.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {advisorStats.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                         </CardContent>
                       </Card>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleDownloadStats}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Reporte del Mes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}

