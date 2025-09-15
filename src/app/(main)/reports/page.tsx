

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, Package, TrendingDown, BotMessageSquare, Loader2, ArrowUp, ArrowDown, Filter, DollarSign, Receipt } from 'lucide-react';
import React, { useState, useEffect, useMemo, useContext, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MonthPicker } from '@/components/month-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { getSalesForecast } from '@/app/actions';
import { ForecastSalesOutput } from '@/ai/flows/forecast-sales';
import { useToast } from '@/hooks/use-toast';
import { initialCustomerData } from '@/lib/customers';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { useUser } from '@/context/user-context';
import type { User, Role } from '@/lib/roles';
import { initialSalesData } from '@/lib/sales-data';
import { InventoryContext, Quote } from '@/context/inventory-context';
import { Combobox } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';


const DynamicMonthlyAnalysis = dynamic(() => import('@/components/reports/monthly-analysis').then(mod => mod.MonthlyAnalysis), {
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false
});

const DynamicQuotesReport = dynamic(() => import('@/components/reports/quotes-report').then(mod => mod.QuotesReport), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});

const salesAdvisors = ['John Doe', 'Jane Smith', 'Peter Jones', 'Admin Latin', 'Laura Diaz'];

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

export default function ReportsPage() {
    const { currentUser } = useUser();
    const { quotes } = useContext(InventoryContext)!;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [forecast, setForecast] = useState<ForecastSalesOutput | null>(null);
    const [loadingForecast, setLoadingForecast] = useState(true);
    const [forecastError, setForecastError] = useState<string | null>(null);
    const { toast } = useToast();

    const isAdvisor = currentUser.roles.includes('Asesor de Ventas');

    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyData = inventoryMovementData[formattedDate] || { topMovers: [], bottomMovers: [] };
    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    
    const isPastOrPresentMonth = useMemo(() => {
        const today = new Date();
        const startOfTodayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfSelectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return startOfSelectedMonth <= startOfTodayMonth;
    }, [currentDate]);

    useEffect(() => {
        const fetchForecast = async () => {
            if (isPastOrPresentMonth || isAdvisor) {
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
    }, [currentDate, isPastOrPresentMonth, isAdvisor]);

    const handleDownloadGeneralReport = async () => {
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        const doc = new jsPDF({ format: 'letter' });
        
        // Dynamic import for header function
        const { addPdfHeader } = await import('@/components/reports/pdf-utils');
        
        await addPdfHeader(doc);

        let startY = 45;
        doc.setFontSize(14);
        doc.text(`Reporte Mensual - ${monthName}`, 14, startY);
        startY += 10;

        if (isAdvisor) {
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Asesor: ${currentUser.name}`, 14, startY);
            startY += 10;
        }

        if (forecast && !isAdvisor) {
            doc.setFontSize(12);
            doc.text(`Pronóstico de Ventas con IA para ${monthName}`, 14, startY);
            startY += 8;
            (doc as any).autoTable({
                startY,
                head: [['Producto', 'Unidades Predichas']],
                body: forecast.forecast.map(item => [item.productName, item.predictedUnits]),
                headStyles: { fillColor: [41, 128, 185] },
            });
            startY = (doc as any).autoTable.previous.finalY + 8;
            const forecastSummaryLines = doc.splitTextToSize(forecast.summary, 180);
            doc.setFontSize(10);
            doc.text(forecastSummaryLines, 14, startY);
            startY += forecastSummaryLines.length * 5 + 10;
        }
        
        if (isPastOrPresentMonth && !isAdvisor) {
            doc.setFontSize(12);
            doc.text(`Movimiento de Productos - ${monthName}`, 14, startY );
            startY += 8;

            if(monthlyData.topMovers.length > 0) {
                (doc as any).autoTable({
                    head: [['Top Movers', 'Unidades', 'Cambio (%)']],
                    body: monthlyData.topMovers.map(p => [p.name, p.moved, p.change]),
                    startY,
                    headStyles: { fillColor: [41, 128, 185] },
                });
                startY = (doc as any).autoTable.previous.finalY + 10;
            }
            
            if(monthlyData.bottomMovers.length > 0) {
                (doc as any).autoTable({
                    head: [['Bottom Movers', 'Unidades']],
                    body: monthlyData.bottomMovers.map(p => [p.name, p.moved]),
                    startY: startY,
                    headStyles: { fillColor: [41, 128, 185] },
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
            <Button onClick={handleDownloadGeneralReport}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Resumen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <DynamicMonthlyAnalysis date={currentDate} user={currentUser} />
          </Suspense>
        </CardContent>
      </Card>
      
      <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
        <DynamicQuotesReport quotes={quotes} date={currentDate} user={currentUser} />
      </Suspense>

      {!isPastOrPresentMonth && !isAdvisor && (
        <ForecastCard forecast={forecast} loading={loadingForecast} error={forecastError} selectedMonth={monthName} />
      )}
      
      {isPastOrPresentMonth && !isAdvisor && (
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
