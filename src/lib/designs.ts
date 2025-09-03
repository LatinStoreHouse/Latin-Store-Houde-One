
export type DesignStatus = 'Pendiente' | 'En Proceso' | 'Completado' | 'Rechazado';

export interface DesignRequest {
  id: string;
  customerName: string;
  advisor: string;
  requestDate: string;
  status: DesignStatus;
  description: string;
  mediaLink: string;
  deliveryDate?: string;
  designFile?: string;
}

export const initialDesignRequests: DesignRequest[] = [
  {
    id: 'DREQ-001',
    customerName: 'Constructora Capital',
    advisor: 'Jane Smith',
    requestDate: '2024-07-28',
    status: 'Completado',
    description: 'Render para la fachada del nuevo proyecto residencial "Altos de la Montaña". Se requiere una vista diurna y una nocturna.',
    mediaLink: 'https://www.dropbox.com/scl/fo/abc123def456/h?rlkey=xyz789&dl=0',
    deliveryDate: '2024-08-05',
    designFile: '/files/propuesta-altos.pdf'
  },
  {
    id: 'DREQ-002',
    customerName: 'Diseño Interior Pro',
    advisor: 'John Doe',
    requestDate: '2024-08-01',
    status: 'En Proceso',
    description: 'Diseño para el lobby del Hotel Central. El cliente quiere ver opciones con la referencia "Black XL" y "Madera nogal".',
    mediaLink: 'https://www.dropbox.com/scl/fo/ghi456jkl789/h?rlkey=pqr123&dl=0',
    deliveryDate: '2024-08-10',
  },
  {
    id: 'DREQ-003',
    customerName: 'Hogar Futuro',
    advisor: 'Peter Jones',
    requestDate: '2024-08-02',
    status: 'Pendiente',
    description: 'Solicitud de diseño para una cocina con isla. El cliente está indeciso entre "Carrara" y "Crystal white".',
    mediaLink: 'https://www.dropbox.com/scl/fo/mno123pqr456/h?rlkey=abc789&dl=0',
  }
];

export const designStatuses: DesignStatus[] = ['Pendiente', 'En Proceso', 'Completado', 'Rechazado'];
