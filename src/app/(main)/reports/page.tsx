'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, Package, TrendingDown, BotMessageSquare, Loader2, ArrowUp, ArrowDown, BarChart2, PieChart, MapPin } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { MonthPicker } from '@/components/month-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { getSalesForecast } from '@/app/actions';
import { ForecastSalesOutput } from '@/ai/flows/forecast-sales';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { initialCustomerData } from '@/lib/customers';
import { initialDispatchData } from '@/app/(main)/orders/page';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';


// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ForecastCard = ({ forecast, loading, error, selectedMonth }: { forecast: ForecastSalesOutput | null, loading: boolean, error: string | null, selectedMonth: string }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BotMessageSquare />
                    Pronóstico de Ventas con IA para {selectedMonth}
                </CardTitle>
                <CardDescription>
                    Predicción de unidades a mover basada en tendencias históricas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground h-40">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generando pronóstico...</span>
                    </div>
                )}
                {error && <p className="text-destructive text-center">{error}</p>}
                {!loading && !error && forecast && (
                    <div className="space-y-4">
                        <div>
                             <h3 className="font-semibold mb-2">Predicción de Unidades</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Unidades Predichas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecast.forecast.map(item => (
                                        <TableRow key={item.productName}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell className="text-right font-bold">{item.predictedUnits}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h3 className="font-semibold">Análisis de la IA</h3>
                            <p className="text-sm text-muted-foreground">{forecast.summary}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const MonthlyAnalysis = ({ date }: { date: Date }) => {
    const monthName = date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    const monthlyStats = useMemo(() => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const dispatchesInMonth = initialDispatchData.filter(d => {
            const dispatchDate = new Date(d.fechaSolicitud);
            return dispatchDate.getFullYear() === year && dispatchDate.getMonth() === month;
        });
        
        const customersInMonth = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return regDate.getFullYear() === year && regDate.getMonth() === month;
        });

        // Top advisors
        const advisorPerformance = dispatchesInMonth.reduce((acc, dispatch) => {
            acc[dispatch.vendedor] = (acc[dispatch.vendedor] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Customer sources
        const customerSources = customersInMonth.reduce((acc, customer) => {
            acc[customer.source] = (acc[customer.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Top cities
        const topCities = customersInMonth.reduce((acc, customer) => {
            if (customer.city) {
                acc[customer.city] = (acc[customer.city] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            advisorPerformance: Object.entries(advisorPerformance)
                .map(([name, dispatches]) => ({ name, despachos: dispatches }))
                .sort((a, b) => b.despachos - a.despachos),
            customerSources: Object.entries(customerSources)
                .map(([name, count]) => ({ name, value: count }))
                .sort((a, b) => b.value - a.value),
            topCities: Object.entries(topCities)
                .map(([name, count]) => ({ name, clientes: count }))
                .sort((a, b) => b.clientes - a.clientes).slice(0, 5),
        };
    }, [date]);

    const PIE_COLORS = ['#29ABE2', '#00BCD4', '#f44336', '#E2E229', '#E29ABE'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis de Rendimiento - {monthName}</CardTitle>
                <CardDescription>Métricas clave de rendimiento para el mes seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><BarChart2 className="h-5 w-5" />Desempeño de Asesores (por Despachos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyStats.advisorPerformance.length > 0 ? (
                             <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyStats.advisorPerformance} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        contentStyle={{
                                            background: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                        }}
                                    />
                                    <Bar dataKey="despachos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">No hay datos de despachos para este mes.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><PieChart className="h-5 w-5" />Origen de Nuevos Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {monthlyStats.customerSources.length > 0 ? (
                         <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={monthlyStats.customerSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {monthlyStats.customerSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                       ) : (
                           <p className="text-center text-muted-foreground py-16">No hay datos de clientes nuevos para este mes.</p>
                       )}
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-5 w-5" />Ciudades con Más Clientes Nuevos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                           <TableHeader>
                            <TableRow>
                                <TableHead>Ciudad</TableHead>
                                <TableHead className="text-right"># Clientes Nuevos</TableHead>
                            </TableRow>
                           </TableHeader>
                           <TableBody>
                             {monthlyStats.topCities.map(city => (
                                <TableRow key={city.name}>
                                    <TableCell>{city.name}</TableCell>
                                    <TableCell className="text-right">{city.clientes}</TableCell>
                                </TableRow>
                             ))}
                             {monthlyStats.topCities.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No hay datos de ciudades para este mes.</TableCell>
                                </TableRow>
                             )}
                           </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
    );
};


export default function ReportsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [forecast, setForecast] = useState<ForecastSalesOutput | null>(null);
    const [loadingForecast, setLoadingForecast] = useState(true);
    const [forecastError, setForecastError] = useState<string | null>(null);
    const { toast } = useToast();

    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyData = inventoryMovementData[formattedDate] || { topMovers: [], bottomMovers: [] };
    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    
    const isPastOrPresentMonth = useMemo(() => {
        const today = new Date();
        const startOfTodayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfSelectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return startOfSelectedMonth <= startOfTodayMonth;
    }, [currentDate]);

    const { newCustomersCount, customersChangePercentage } = useMemo(() => {
        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();

        const currentMonthCustomers = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return regDate.getFullYear() === selectedYear && regDate.getMonth() === selectedMonth;
        }).length;

        const prevMonthDate = new Date(currentDate);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthYear = prevMonthDate.getFullYear();
        const prevMonth = prevMonthDate.getMonth();

        const previousMonthCustomers = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return regDate.getFullYear() === prevMonthYear && regDate.getMonth() === prevMonth;
        }).length;
        
        let changePercentage = 0;
        if (previousMonthCustomers > 0) {
            changePercentage = ((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100;
        } else if (currentMonthCustomers > 0) {
            changePercentage = 100; // If previous was 0 and current is > 0, it's a 100% increase
        }

        return { 
            newCustomersCount: currentMonthCustomers,
            customersChangePercentage: changePercentage
        };
    }, [currentDate]);


    useEffect(() => {
        const fetchForecast = async () => {
            if (isPastOrPresentMonth) {
                setForecast(null);
                setLoadingForecast(false);
                return;
            };

            try {
                setLoadingForecast(true);
                setForecastError(null);
                const targetMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const result = await getSalesForecast(targetMonth);
                if (result.error) {
                    setForecastError(result.error);
                } else {
                    setForecast(result.result ?? null);
                }
            } catch (e) {
                setForecastError('No se pudo cargar el pronóstico.');
            } finally {
                setLoadingForecast(false);
            }
        };

        fetchForecast();
    }, [currentDate, isPastOrPresentMonth]);

    const handleDownloadReport = async () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Latin Store House', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Reporte Mensual - ${monthName}`, 14, 30);


        let startY = 35;

        if (forecast) {
            doc.setFontSize(14);
            doc.text(`Pronóstico de Ventas con IA para ${monthName}`, 14, startY);
            startY += 8;
            doc.autoTable({
                startY,
                head: [['Producto', 'Unidades Predichas']],
                body: forecast.forecast.map(item => [item.productName, item.predictedUnits]),
            });
            startY = (doc as any).autoTable.previous.finalY + 8;
            const forecastSummaryLines = doc.splitTextToSize(forecast.summary, 180);
            doc.setFontSize(10);
            doc.text(forecastSummaryLines, 14, startY);
            startY += forecastSummaryLines.length * 5 + 10;
        } else {
            doc.setFontSize(12);
            doc.text("Pronóstico no disponible.", 14, startY);
            startY += 10;
        }
        
        if (isPastOrPresentMonth) {
            doc.setFontSize(14);
            doc.text(`Movimiento de Productos - ${monthName}`, 14, startY );
            startY += 8;

            if(monthlyData.topMovers.length > 0) {
                doc.autoTable({
                    head: [['Top Movers', 'Unidades', 'Cambio (%)']],
                    body: monthlyData.topMovers.map(p => [p.name, p.moved, p.change]),
                    startY,
                });
                startY = (doc as any).autoTable.previous.finalY + 10;
            }
            
            if(monthlyData.bottomMovers.length > 0) {
                doc.autoTable({
                    head: [['Bottom Movers', 'Unidades']],
                    body: monthlyData.bottomMovers.map(p => [p.name, p.moved]),
                    startY: startY,
                });
            }
        }
        
        doc.save(`reporte-${formattedDate}.pdf`);
        toast({ title: 'Éxito', description: 'Reporte PDF generado.' });
    };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resumen Mensual</CardTitle>
            <CardDescription>Métricas clave para el período seleccionado.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <MonthPicker date={currentDate} onDateChange={setCurrentDate} />
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{newCustomersCount}</div>
               <p className={cn("text-xs text-muted-foreground flex items-center", customersChangePercentage >= 0 ? "text-green-600" : "text-red-600")}>
                {customersChangePercentage >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {customersChangePercentage.toFixed(1)}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+1,286</div>
              <p className="text-xs text-muted-foreground">+12.2% desde el mes pasado</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      {isPastOrPresentMonth ? (
          <MonthlyAnalysis date={currentDate} />
      ) : (
          <ForecastCard forecast={forecast} loading={loadingForecast} error={forecastError} selectedMonth={monthName} />
      )}
      
      {isPastOrPresentMonth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Productos con Mayor Movimiento</CardTitle>
                    <CardDescription>Los productos más vendidos en el período seleccionado.</CardDescription>
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
                            {monthlyData.topMovers.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.moved}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={item.change >= 0 ? 'default' : 'destructive'} className="flex w-fit items-center gap-1 ml-auto">
                                            {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {item.change}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {monthlyData.topMovers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No hay datos para este mes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Productos con Menor Movimiento</CardTitle>
                    <CardDescription>Los productos menos vendidos en el período seleccionado.</CardDescription>
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
                            {monthlyData.bottomMovers.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.moved}</TableCell>
                                </TableRow>
                            ))}
                            {monthlyData.bottomMovers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        No hay datos para este mes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
