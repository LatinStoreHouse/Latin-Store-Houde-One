
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
import { FileDown, CheckCircle2 } from 'lucide-react';

const inventoryData = [
  { category: 'CLAY', name: 'CUT STONE 120 X 60', bodega: 15, zonaFranca: 352, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'CLAY', name: 'TRAVERTINO', bodega: 14, zonaFranca: 304, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'CLAY', name: 'CONCRETO ENCOFRADO', bodega: 1, zonaFranca: 77, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'CLAY', name: 'TAPIA NEGRA', bodega: 2, zonaFranca: 23, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX', name: 'ADHESIVO TRASLUCIDO', bodega: 87, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX', name: 'POLIURETANO STONEFLEX', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX', name: 'SELLANTE SEMI - BRIGHT GALON', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX', name: 'SELLANTE SEMI - BRIGTH 1/ 4 GALON', bodega: 9, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX', name: 'SELLANTE SHYNY 1/4 GALON', bodega: 2, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'BLACK 1.22 X 0.61', bodega: 217, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'KUND MULTY 1.22 X 0.61', bodega: 310, zonaFranca: 180, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'TAN 1.22 X 0.61', bodega: 233, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'INDIAN AUTUMN 1.22 X 0.61', bodega: 189, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'INDIAN AUTUMN TRANSLUCIDO 1.22 X 0.61', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'BURNING FOREST 1.22 X 0.61', bodega: 227, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'COPPER 1.22 X 0.61', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'JEERA GREEN 1.22 X 0.61', bodega: 689, zonaFranca: 270, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'SILVER SHINE 1.22 X 0.61', bodega: 752, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'SILVER SHINE GOLD 1.22 X 0.61', bodega: 661, zonaFranca: 340, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'STEEL GRAY 1.22 X 0.61', bodega: 875, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'CARRARA 1.22 X 0.61', bodega: 738, zonaFranca: 300, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'CRYSTAL WHITE 1.22 X 0.61', bodega: 14, zonaFranca: 0, separadasBodega: 10, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'HIMALAYA GOLD 1.22X0.61 MTS', bodega: 4, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'MINT WHITE 1.22 X 0.61', bodega: 15, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'CONCRETO BLANCO 1.22 X 0.61', bodega: 393, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'CONCRETO GRIS 1.22 X 0.61', bodega: 592, zonaFranca: 380, separadasBodega: 0, separadasZonaFranca: 56, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'CONCRETE WITH HOLES 1.22 X 0.61', bodega: 62, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'CONCRETO GRIS MEDIUM 1.22 X 0.61', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'CORTEN STELL - 2.44 X 0.61', bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'MURAL BLUE PATINA WITH COPPER - 2.44 X 0.61', bodega: 77, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'MURAL WHITE WITH COPPER GOLD - 2.44 X 0.61', bodega: 35, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'GATE TURQUOISE PATINA COPPER - 2.44 X 0.61', bodega: 61, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'MADERA NOGAL 0.15 X 2.44 MTS', bodega: 540, zonaFranca: 460, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'MADERA TEKA 0.15 X 2.44 MTS', bodega: 137, zonaFranca: 600, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: '3D ADHESIVO - 0,90 M2 - BLACK', bodega: 206, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: '3D ADHESIVO - 0,90 M2 - INDIAN RUSTIC', bodega: 277, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: '3D ADHESIVO - 0,90 M2 - TAN', bodega: 177, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'STONEFLEX ESTANDAR', name: 'PANEL 3D - INDIAN AUTUMN 1.22 X 0.61', bodega: 13, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: 'PANEL 3D - TAN 1.22 X 0.61', bodega: 5, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX ESTANDAR', name: '', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'BLACK 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'TAN 2.44 X 1.22', bodega: 47, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'kUND MULTY 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'INDIAN AUTUMN 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'COPPER 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'BURNING FOREST 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'JEERA GREEN 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'SILVER SHINE 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'SILVER SHINE GOLD 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'STEEL GREY 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CONCRETO BLANCO 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CONCRETO GRIS 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CONCRETO MEDIO 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CONCRETO WITH HOLES 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CARRARA 2.44 X 1.22', bodega: 60, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CRYSTAL WHITE 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'HIMALAYA GOLD 2.44 X 1.22', bodega: 47, zonaFranca: 0, separadasBodega: 8, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: 'CORTEN STEEL 2.44 X 1.22', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'STONEFLEX XL', name: '', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'TERRANOVA', name: 'CUERO 150 X 60', bodega: 144, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
  { category: 'TERRANOVA', name: 'MADERA EBANO 0.15 X 2.44 MTS', bodega: 713, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: true },
  { category: 'TERRANOVA', name: 'PEGO TERRANOVA CUÑETE 25 KG', bodega: 0, zonaFranca: 0, separadasBodega: 0, separadasZonaFranca: 0, muestras: false },
].filter(item => item.name);


const locations = ['Todos', 'Bodega', 'Zona Franca'];

const InventoryTable = ({ category }: { category: string }) => {
  const filteredData =
    category === 'Todos'
      ? inventoryData
      : inventoryData.filter((item) => item.category === category);
  
  const getAvailabilityStatus = (disponible: number) => {
    if (disponible > 100) return 'En Stock';
    if (disponible > 0) return 'Poco Stock';
    return 'Agotado';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'En Stock':
        return 'default';
      case 'Poco Stock':
        return 'secondary';
      case 'Agotado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre del Producto</TableHead>
          {category === 'Todos' && <TableHead>Categoría</TableHead>}
          <TableHead className="text-right">Disp. Bodega</TableHead>
          <TableHead className="text-right">Disp. Zona Franca</TableHead>
          <TableHead className="text-center">Muestras</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item, index) => {
          const disponibleBodega = item.bodega - item.separadasBodega;
          const disponibleZonaFranca = item.zonaFranca - item.separadasZonaFranca;
          const statusBodega = getAvailabilityStatus(disponibleBodega);
          const statusZonaFranca = getAvailabilityStatus(disponibleZonaFranca);

          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.name}</TableCell>
              {category === 'Todos' && <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>}
              <TableCell className="text-right">{disponibleBodega}</TableCell>
              <TableCell className="text-right">{disponibleZonaFranca}</TableCell>
              <TableCell className="text-center">
                {item.muestras && <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />}
              </TableCell>
              <TableCell>
                 <div className="flex flex-col gap-1">
                   {disponibleBodega > 0 && <Badge variant={getStatusVariant(statusBodega)}>Bodega: {statusBodega}</Badge>}
                   {disponibleZonaFranca > 0 && <Badge variant={getStatusVariant(statusZonaFranca)}>Zona Franca: {statusZonaFranca}</Badge>}
                   {disponibleBodega <= 0 && disponibleZonaFranca <= 0 && <Badge variant="destructive">Agotado</Badge>}
                 </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default function InventoryPage() {
  const categories = ['Todos', ...Array.from(new Set(inventoryData.map(item => item.category)))];

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
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <InventoryTable category={cat} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
