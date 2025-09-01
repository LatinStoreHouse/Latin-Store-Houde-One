
export interface Distributor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  status: 'Activo' | 'Inactivo';
  notes?: string;
}

export const initialDistributorData: Distributor[] = [
  {
    id: 'DIST-001',
    name: 'Distribuidor Bogotá SAS',
    contactName: 'Carlos Hernandez',
    phone: '3101234567',
    email: 'carlos.h@distribogota.com',
    address: 'Calle 100 # 10 - 20',
    city: 'Bogotá',
    country: 'Colombia',
    status: 'Activo',
    notes: 'Distribuidor principal en la zona centro.'
  },
  {
    id: 'DIST-002',
    name: 'Distribuciones Cali',
    contactName: 'Ana Perez',
    phone: '3117654321',
    email: 'ana.p@districali.com',
    address: 'Av. Roosevelt # 25 - 50',
    city: 'Cali',
    country: 'Colombia',
    status: 'Activo',
  },
  {
    id: 'DIST-003',
    name: 'Materiales Medellín',
    contactName: 'Luis Rodriguez',
    phone: '3159876543',
    email: 'luis.r@matmedellin.co',
    address: 'Carrera 43A # 1 - 50',
    city: 'Medellín',
    country: 'Colombia',
    status: 'Inactivo',
    notes: 'Contrato finalizado el mes pasado.'
  }
];
