import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Warehouse, Truck, PackageSearch } from 'lucide-react';

const overviewItems = [
  {
    title: 'In Warehouse',
    value: '12,504',
    icon: Warehouse,
    description: '+2.5% from last month',
  },
  {
    title: 'In Transit',
    value: '1,230',
    icon: Truck,
    description: '+15.1% from last month',
  },
  {
    title: 'In Free Zone',
    value: '3,456',
    icon: PackageSearch,
    description: '-3.2% from last month',
  },
];

const recentActivities = [
    { id: 'ORD-001', item: 'High-Performance Laptops', quantity: 50, status: 'Shipped', date: '2023-10-26' },
    { id: 'ORD-002', item: 'Ergonomic Office Chairs', quantity: 100, status: 'Processing', date: '2023-10-25' },
    { id: 'ORD-003', item: '4K Monitors', quantity: 75, status: 'Delivered', date: '2023-10-24' },
    { id: 'ORD-004', item: 'Mechanical Keyboards', quantity: 200, status: 'Awaiting Shipment', date: '2023-10-23' },
    { id: 'ORD-005', item: 'Webcams', quantity: 150, status: 'Shipped', date: '2023-10-22' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {overviewItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.id}</TableCell>
                  <TableCell>{activity.item}</TableCell>
                  <TableCell>{activity.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'Delivered' ? 'default' : activity.status === 'Shipped' ? 'secondary' : 'outline'}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell>{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
