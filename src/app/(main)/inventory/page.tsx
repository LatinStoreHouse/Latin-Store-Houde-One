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
  { id: 'SKU001', name: 'Laptop Pro 15"', category: 'Electronics', location: 'Warehouse', quantity: 150, status: 'In Stock' },
  { id: 'SKU002', name: 'Wireless Mouse', category: 'Accessories', location: 'Warehouse', quantity: 400, status: 'In Stock' },
  { id: 'SKU003', name: 'Office Chair V2', category: 'Furniture', location: 'Free Zone', quantity: 50, status: 'In Stock' },
  { id: 'SKU004', name: 'Monitor 27" 4K', category: 'Electronics', location: 'In Transit', quantity: 75, status: 'ETA: 3 days' },
  { id: 'SKU005', name: 'Mechanical Keyboard', category: 'Accessories', location: 'Warehouse', quantity: 0, status: 'Backordered' },
  { id: 'SKU006', name: 'Docking Station', category: 'Accessories', location: 'Free Zone', quantity: 120, status: 'In Stock' },
  { id: 'SKU007', name: 'Standing Desk', category: 'Furniture', location: 'In Transit', quantity: 30, status: 'ETA: 5 days' },
  { id: 'SKU008', name: 'Laptop Pro 13"', category: 'Electronics', location: 'Warehouse', quantity: 80, status: 'Low Stock' },
];

const locations = ['All', 'Warehouse', 'Free Zone', 'In Transit'];

const InventoryTable = ({ location }: { location: string }) => {
  const filteredData =
    location === 'All'
      ? inventoryData
      : inventoryData.filter((item) => item.location === location);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          {location === 'All' && <TableHead>Location</TableHead>}
          <TableHead>Quantity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
             {location === 'All' && <TableCell><Badge variant="outline">{item.location}</Badge></TableCell>}
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === 'In Stock'
                    ? 'default'
                    : item.status === 'Low Stock'
                    ? 'secondary'
                    : item.status === 'Backordered'
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
        <CardTitle>Product Inventory</CardTitle>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="All">
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
