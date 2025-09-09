
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, Package, TrendingDown, BotMessageSquare, Loader2, ArrowUp, ArrowDown, Filter, DollarSign, Receipt } from 'lucide-react';
import { useState, useEffect, useMemo, useContext } from 'react';
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


// Utility function to safely get base64 from an image
const getImageBase64 = (src: string): Promise<{ base64: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve({ base64: dataURL, width: img.width, height: img.height });
            } catch (e) {
                console.error("Error converting canvas to data URL", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image for PDF conversion:", src, e);
            resolve(null); // Resolve with null if the image fails to load
        };
    });
};

const addPdfHeader = async (doc: any) => {
    const { jsPDF } = await import('jspdf');
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    if (latinLogoData) {
        const logoWidth = 20;
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        doc.addImage(latinLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Latin Store House S.A.S', pageWidth - 14, 15, { align: 'right' });
    doc.text('NIT: 900493221-0', pageWidth - 14, 19, { align: 'right' });
};


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

const MonthlyAnalysis = ({ date, user }: { date: Date, user: User | null }) => {
    const isAdvisor = user?.roles.includes('Asesor de Ventas');

    const { newCustomersCount, customersChangePercentage, salesFunnelData, funnelOutcomes, monthlySales } = useMemo(() => {
        if (!user) return { newCustomersCount: 0, customersChangePercentage: 0, salesFunnelData: [], funnelOutcomes: [], monthlySales: 0 };

        const selectedYear = date.getFullYear();
        const selectedMonth = date.getMonth();

        const getCustomersInMonth = (year: number, month: number) => {
            return initialCustomerData.filter(c => {
                const regDate = new Date(c.registrationDate);
                const isCorrectMonth = regDate.getFullYear() === year && regDate.getMonth() === month;
                const isAssignedToAdvisor = isAdvisor ? c.assignedTo === user.name : true;
                return isCorrectMonth && isAssignedToAdvisor;
            });
        };

        const currentMonthCustomers = getCustomersInMonth(selectedYear, selectedMonth);

        const prevMonthDate = new Date(date);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const previousMonthCustomers = getCustomersInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
        
        let changePercentage = 0;
        if (previousMonthCustomers.length > 0) {
            changePercentage = ((currentMonthCustomers.length - previousMonthCustomers.length) / previousMonthCustomers.length) * 100;
        } else if (currentMonthCustomers.length > 0) {
            changePercentage = 100;
        }

        const statusCounts = currentMonthCustomers.reduce((acc, customer) => {
            acc[customer.status] = (acc[customer.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const salesFunnelData = [
            { name: 'Contactado', value: statusCounts['Contactado'] || 0 },
            { name: 'Showroom', value: statusCounts['Showroom'] || 0 },
            { name: 'Cotizado', value: statusCounts['Cotizado'] || 0 },
            { name: 'Facturado', value: statusCounts['Facturado'] || 0 },
        ];

        const funnelOutcomes = [
            { name: 'Declinado', value: statusCounts['Declinado'] || 0 },
            { name: 'Sin respuesta', value: statusCounts['Sin respuesta'] || 0 },
            { name: 'Redireccionado', value: statusCounts['Redireccionado'] || 0 },
        ].filter(outcome => outcome.value > 0);

        const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const sales = isAdvisor ? (initialSalesData[user.name]?.[monthKey]?.sales || 0) : 0;

        return { 
            newCustomersCount: currentMonthCustomers.length,
            customersChangePercentage: changePercentage,
            salesFunnelData,
            funnelOutcomes,
            monthlySales: sales,
        };
    }, [date, user, isAdvisor]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <>
        <div className="grid gap-4 md:grid-cols-2">
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
            {isAdvisor ? (
                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(monthlySales)}</div>
                        <p className="text-xs text-muted-foreground">Total registrado para este mes.</p>
                    </CardContent>
                </Card>
            ) : (
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
            )}
        </div>
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Filter />Embudo de Clientes por Estado</CardTitle>
                <CardDescription>Visualización del flujo de clientes a través de las etapas de venta en el mes seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart layout="vertical" data={salesFunnelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                         <XAxis type="number" />
                         <YAxis type="category" dataKey="name" width={80} />
                         <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                         <Bar dataKey="value" fill="hsl(var(--primary))" barSize={30} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div>
                    <h4 className="font-semibold mb-2">Resultados del Embudo</h4>
                    <p className="text-sm text-muted-foreground mb-4">Clientes que salieron del embudo de ventas durante el mes.</p>
                    {funnelOutcomes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right"># Clientes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funnelOutcomes.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right font-bold">{item.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay clientes con estados de salida este mes.</p>
                    )}
                 </div>
            </CardContent>
        </Card>
        </>
    );
}

const QuotesReport = ({ quotes, date, user }: { quotes: Quote[], date: Date, user: User | null }) => {
    const { toast } = useToast();
    const isAdvisor = user?.roles.includes('Asesor de Ventas');
    const isAdmin = user?.roles.includes('Administrador');

    const [advisorFilter, setAdvisorFilter] = useState('');

    const advisorOptions = salesAdvisors.map(name => ({ value: name, label: name }));

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const quoteDate = new Date(quote.creationDate);
            const isSameMonth = quoteDate.getFullYear() === date.getFullYear() && quoteDate.getMonth() === date.getMonth();

            if (!isSameMonth) return false;

            if (isAdvisor && !isAdmin) {
                return quote.advisorName === user?.name;
            }
            if (isAdmin && advisorFilter) {
                return quote.advisorName === advisorFilter;
            }
            return true;
        });
    }, [quotes, date, user, isAdvisor, isAdmin, advisorFilter]);

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        }).format(value);
    };

    const handleDownloadQuotes = async () => {
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        const doc = new jsPDF({ format: 'letter' });
        const monthName = date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
        
        await addPdfHeader(doc);
        
        let startY = 45;
        doc.setFontSize(14);
        doc.text('Reporte de Cotizaciones', 14, startY);
        startY += 5;
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Mes: ${monthName}`, 14, startY);
        startY += 5;
        
        if (advisorFilter) {
            doc.text(`Asesor: ${advisorFilter}`, 14, startY);
            startY += 5;
        }

        (doc as any).autoTable({
            startY,
            head: [['# Cotización', 'Tipo', 'Cliente', 'Asesor', 'Fecha', 'Monto']],
            body: filteredQuotes.map(q => [
                q.quoteNumber,
                q.calculatorType,
                q.customerName,
                q.advisorName,
                new Date(q.creationDate).toLocaleDateString(),
                formatCurrency(q.total, q.currency)
            ]),
            headStyles: { fillColor: [41, 128, 185] },
        });
        
        doc.save(`Reporte_Cotizaciones_${date.getFullYear()}-${date.getMonth() + 1}.pdf`);
        toast({ title: 'Éxito', description: 'Reporte de cotizaciones PDF generado.' });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Receipt />Reporte de Cotizaciones</CardTitle>
                        <CardDescription>Análisis de las cotizaciones generadas en el mes seleccionado.</CardDescription>
                    </div>
                     <Button onClick={handleDownloadQuotes} disabled={filteredQuotes.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Cotizaciones
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 {isAdmin && (
                    <div className="mb-4 w-full sm:w-64">
                         <Combobox
                            options={advisorOptions}
                            value={advisorFilter}
                            onValueChange={setAdvisorFilter}
                            placeholder="Filtrar por asesor..."
                        />
                    </div>
                 )}
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead># Cotización</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Asesor</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotes.map(quote => (
                            <TableRow key={quote.id}>
                                <TableCell>{quote.quoteNumber}</TableCell>
                                <TableCell><Badge variant="outline">{quote.calculatorType}</Badge></TableCell>
                                <TableCell>{quote.customerName}</TableCell>
                                <TableCell>{quote.advisorName}</TableCell>
                                <TableCell>{new Date(quote.creationDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(quote.total, quote.currency)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredQuotes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay cotizaciones para los filtros seleccionados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    );
};

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
          <MonthlyAnalysis date={currentDate} user={currentUser} />
        </CardContent>
      </Card>
      
      <QuotesReport quotes={quotes} date={currentDate} user={currentUser} />

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
