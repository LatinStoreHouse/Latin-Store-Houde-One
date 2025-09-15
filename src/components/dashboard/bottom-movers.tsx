
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
import { TrendingDown } from 'lucide-react';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { useMemo } from 'react';

export function BottomMovers() {
  const lastMonthKey = Object.keys(inventoryMovementData).sort().reverse()[0] || '';
  const data = useMemo(() => inventoryMovementData[lastMonthKey]?.bottomMovers || [], [lastMonthKey]);
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
            <TrendingDown />
            Productos con Menor Movimiento
        </CardTitle>
        <CardDescription>Los productos menos vendidos en {monthName}.</CardDescription>
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
            {data.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{item.moved}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
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
  );
}
