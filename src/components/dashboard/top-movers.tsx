
'use client';
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
import { TrendingUp, TrendingDown } from 'lucide-react';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { useMemo } from 'react';

export function TopMovers() {
  const lastMonthKey = Object.keys(inventoryMovementData).sort().reverse()[0] || '';
  const data = useMemo(() => inventoryMovementData[lastMonthKey]?.topMovers || [], [lastMonthKey]);
  const monthName = useMemo(() => {
    if (!lastMonthKey) return '';
    const [year, month] = lastMonthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
  }, [lastMonthKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp />
            Productos con Mayor Movimiento
        </CardTitle>
        <CardDescription>Los productos más vendidos en {monthName}.</CardDescription>
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
            {data.map((item) => (
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
            {data.length === 0 && (
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
  );
}
