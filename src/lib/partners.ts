
export interface Partner {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  status: 'Activo' | 'Inactivo';
  type: 'Partner' | 'Distribuidor';
  notes?: string;
}

export const initialPartnerData: Partner[] = [
  {
    id: 'PART-001',
    name: 'Constructora Capital',
    contactName: 'Sofia Vergara',
    phone: '3209876543',
    email: 'sofia.v@constructoracapital.com',
    address: 'Carrera 7 # 71 - 21',
    city: 'Bogotá',
    country: 'Colombia',
    status: 'Activo',
    type: 'Partner',
    notes: 'Partner estratégico para proyectos de gran escala.'
  },
  {
    id: 'PART-002',
    name: 'Diseño Interior Pro',
    contactName: 'Andres Morales',
    phone: '3181239876',
    email: 'andres.m@disenopro.co',
    address: 'Calle 80 # 14 - 30',
    city: 'Medellín',
    country: 'Colombia',
    status: 'Activo',
    type: 'Partner',
    notes: 'Especializados en diseño residencial de lujo.'
  }
];
