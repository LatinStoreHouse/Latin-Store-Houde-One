'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, Users, Package, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { MonthPicker } from '@/components/month-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryMovementData } from '@/lib/inventory-movement';

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
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
