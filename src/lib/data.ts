// Interfaz para un solo producto dentro de un despacho
export interface DispatchProduct {
  name: string;
  quantity: number;
  origin: 'Bodega' | 'Zona Franca';
}

export type DispatchData = {
    id: number;
    vendedor: string;
    fechaSolicitud: string;
    cotizacion: string;
    cliente: string;
    ciudad: string;
    direccion: string;
    remision: string;
    observacion: string;
    rutero: string;
    fechaDespacho: string;
    guia: string;
    convencion: string;
    products: DispatchProduct[];
}


export const initialDispatchData: DispatchData[] = [
  {
    id: 1,
    vendedor: 'John Doe',
    fechaSolicitud: '2024-07-28',
    cotizacion: 'COT-001',
    cliente: 'ConstruCali',
    ciudad: 'Cali',
    direccion: 'Calle Falsa 123',
    remision: 'REM-001',
    observacion: '',
    rutero: 'Transportadora',
    fechaDespacho: '',
    guia: '',
    convencion: 'Prealistamiento de pedido',
    products: [{ name: 'Cut stone', quantity: 10, origin: 'Bodega' }, { name: 'Adhesivo', quantity: 5, origin: 'Bodega' }]
  },
  {
    id: 2,
    vendedor: 'Jane Smith',
    fechaSolicitud: '2024-07-29',
    cotizacion: 'COT-002',
    cliente: 'Diseños Modernos SAS',
    ciudad: 'Bogotá',
    direccion: 'Av. Siempre Viva 45',
    remision: 'REM-002',
    observacion: 'Entrega urgente',
    rutero: 'R-BOG-01',
    fechaDespacho: '2024-07-30',
    guia: 'TCC-98765',
    convencion: 'Despachado',
    products: [{ name: 'Black', quantity: 20, origin: 'Bodega' }]
  },
  {
    id: 3,
    vendedor: 'John Doe',
    fechaSolicitud: '2023-06-15',
    cotizacion: 'COT-003',
    cliente: 'Arquitectos Unidos',
    ciudad: 'Medellín',
    direccion: 'Carrera 10 # 20-30',
    remision: 'REM-003',
    observacion: '',
    rutero: 'R-MED-05',
    fechaDespacho: '2024-06-18',
    guia: 'ENV-12345',
    convencion: 'Entrega parcial',
    products: [{ name: 'Concreto gris', quantity: 15, origin: 'Zona Franca' }],
  },
];