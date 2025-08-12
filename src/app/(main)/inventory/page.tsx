import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { FileDown } from 'lucide-react';

const inventoryData = [
  { id: 'SKU001', name: 'Laptop Pro 15"', category: 'Electrónicos', location: 'Almacén', quantity: 150, status: 'En Stock' },
  { id: 'SKU002', name: 'Mouse Inalámbrico', category: 'Accesorios', location: 'Almacén', quantity: 400, status: 'En Stock' },
  { id: 'SKU003', name: 'Silla de Oficina V2', category: 'Muebles', location: 'Zona Franca', quantity: 50, status: 'En Stock' },
  { id: 'SKU004', name: 'Monitor 27" 4K', category: 'Electrónicos', location: 'En Tránsito', quantity: 75, status: 'ETA: 3 días' },
  { id: 'SKU005', name: 'Teclado Mecánico', category: 'Accesorios', location: 'Almacén', quantity: 0, status: 'Pedido pendiente' },
  { id: 'SKU006', name: 'Estación de Acoplamiento', category: 'Accesorios', location: 'Zona Franca', quantity: 120, status: 'En Stock' },
  { id: 'SKU007', name: 'Escritorio de Pie', category: 'Muebles', location: 'En Tránsito', quantity: 30, status: 'ETA: 5 días' },
  { id: 'SKU008', name: 'Laptop Pro 13"', category: 'Electrónicos', location: 'Almacén', quantity: 80, status: 'Poco Stock' },
];

const locations = ['Todos', 'Almacén', 'Zona Franca', 'En Tránsito'];

const InventoryTable = ({ location }: { location: string }) => {
  const filteredData =
    location === 'Todos'
      ? inventoryData
      : inventoryData.filter((item) => item.location === location);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Nombre del Producto</TableHead>
          <TableHead>Categoría</TableHead>
          {location === 'Todos' && <TableHead>Ubicación</TableHead>}
          <TableHead>Cantidad</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
             {location === 'Todos' && <TableCell><Badge variant="outline">{item.location}</Badge></TableCell>}
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === 'En Stock'
                    ? 'default'
                    : item.status === 'Poco Stock'
                    ? 'secondary'
                    : item.status === 'Pedido pendiente'
                    ? 'destructive'
                    : 'outline'
                }
                className="bg-opacity-20"
              >
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Productos</CardTitle>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Datos
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Todos">
          <TabsList>
            {locations.map((loc) => (
              <TabsTrigger key={loc} value={loc}>
                {loc}
              </TabsTrigger>
            ))}
          </TabsList>
          {locations.map((loc) => (
            <TabsContent key={loc} value={loc} className="mt-4">
              <InventoryTable location={loc} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
