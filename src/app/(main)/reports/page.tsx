'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, Package, TrendingDown, BotMessageSquare, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MonthPicker } from '@/components/month-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { getSalesForecast } from '@/app/actions';
import { ForecastSalesOutput } from '@/ai/flows/forecast-sales';


const ForecastCard = () => {
    const [forecast, setForecast] = useState<ForecastSalesOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                const result = await getSalesForecast();
                if (result.error) {
                    setError(result.error);
                } else {
                    setForecast(result.result ?? null);
                }
            } catch (e) {
                setError('No se pudo cargar el pronóstico.');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BotMessageSquare />
                    Pronóstico de Ventas con IA para el Próximo Mes
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
    const [currentDate, setCurrentDate] = useState(new Date());

    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyData = inventoryMovementData[formattedDate] || { topMovers: [], bottomMovers: [] };


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
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+235</div>
              <p className="text-xs text-muted-foreground">+18.1% desde el mes pasado</p>
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
      
      <ForecastCard />

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
                                    <Badge variant={item.change > 0 ? 'default' : 'destructive'} className="flex w-fit items-center gap-1 ml-auto">
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
    </div>
  );
}
