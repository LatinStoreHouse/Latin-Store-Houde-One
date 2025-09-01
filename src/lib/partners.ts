

export interface Partner {
  id: string;
  name: string;
  taxId: string;
  contactName: string;
  phone: string[];
  email: string[];
  address: string;
  city: string;
  country: string;
  status: 'Activo' | 'Inactivo';
  type: 'Partner' | 'Distribuidor';
  notes?: string;
  discountPercentage?: number;
  startDate?: string;
  contractNotes?: string;
}

export const initialPartnerData: Partner[] = [
  {
    id: 'PART-001',
    name: 'Constructora Capital',
    taxId: '800.111.222-3',
    contactName: 'Sofia Vergara',
    phone: ['3209876543'],
    email: ['sofia.v@constructoracapital.com'],
    address: 'Carrera 7 # 71 - 21',
    city: 'Bogotá',
    country: 'Colombia',
    status: 'Activo',
    type: 'Partner',
    notes: 'Partner estratégico para proyectos de gran escala.',
    discountPercentage: 5,
    startDate: '2023-01-15',
    contractNotes: 'Contrato estándar, renovación anual automática.'
  },
  {
    id: 'PART-002',
    name: 'Diseño Interior Pro',
    taxId: '800.333.444-5',
    contactName: 'Andres Morales',
    phone: ['3181239876'],
    email: ['andres.m@disenopro.co'],
    address: 'Calle 80 # 14 - 30',
    city: 'Medellín',
    country: 'Colombia',
    status: 'Activo',
    type: 'Partner',
    notes: 'Especializados en diseño residencial de lujo.',
    discountPercentage: 8,
    startDate: '2022-11-01',
  }
];
