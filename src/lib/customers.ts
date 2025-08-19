export type CustomerStatus = 'Contactado' | 'Cotizado' | 'Facturado' | 'Redireccionado' | 'Declinado' | 'Sin respuesta' | 'Showroom';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  source: 'Instagram' | 'WhatsApp' | 'Email' | 'Sitio Web' | 'Referido';
  assignedTo: string;
  status: CustomerStatus;
  registrationDate: string;
  notes?: string;
}

export const initialCustomerData: Customer[] = [
  { id: 1, name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', address: 'Av Falsa 123', city: 'Cali', source: 'Instagram', assignedTo: 'John Doe', status: 'Contactado', registrationDate: '2024-07-15' },
  { id: 2, name: 'Bob Williams', phone: '555-0102', email: 'bob@example.com', address: 'Cr 45 # 67 - 89', city: 'Bogotá', source: 'WhatsApp', assignedTo: 'Jane Smith', status: 'Cotizado', registrationDate: '2024-07-20', notes: 'Cliente muy interesado en la línea Starwood, solicitó catálogo completo.' },
  { id: 3, name: 'Charlie Brown', phone: '555-0103', email: 'charlie@example.com', address: '', city: 'Medellín', source: 'Email', assignedTo: 'John Doe', status: 'Facturado', registrationDate: '2024-06-10' },
  { id: 4, name: 'Diana Miller', phone: '555-0104', email: 'diana@example.com', address: '', city: 'Cali', source: 'Instagram', assignedTo: 'Peter Jones', status: 'Declinado', registrationDate: '2024-06-25', notes: 'El cliente encontró una opción más económica con la competencia.' },
  { id: 5, name: 'Ethan Davis', phone: '555-0105', email: 'ethan@example.com', address: 'Transversal 5 # 10-1', city: 'Medellín', source: 'Email', assignedTo: 'Jane Smith', status: 'Sin respuesta', registrationDate: '2024-05-05' },
  { id: 6, name: 'Fiona Garcia', phone: '555-0106', email: 'fiona@example.com', address: '', city: 'Barranquilla', source: 'Sitio Web', assignedTo: 'John Doe', status: 'Showroom', registrationDate: '2024-05-12' },
  { id: 7, name: 'George Harris', phone: '555-0107', email: 'george@example.com', address: '', city: 'Bogotá', source: 'Referido', assignedTo: 'Peter Jones', status: 'Cotizado', registrationDate: '2024-04-30' },
  { id: 8, name: 'International Corp', phone: '555-0108', email: 'contact@inter.co', address: '123 Global Way', city: 'Miami', source: 'Referido', assignedTo: 'Jane Smith', status: 'Contactado', registrationDate: '2024-07-22' },
];


export const customerSources: Customer['source'][] = ['Instagram', 'WhatsApp', 'Email', 'Sitio Web', 'Referido'];
export const customerStatuses: CustomerStatus[] = ['Contactado', 'Cotizado', 'Facturado', 'Redireccionado', 'Declinado', 'Sin respuesta', 'Showroom'];

export const statusColors: { [key in CustomerStatus]: string } = {
  'Contactado': 'bg-yellow-200/50 text-yellow-800 border-yellow-300/50',
  'Cotizado': 'bg-blue-200/50 text-blue-800 border-blue-300/50',
  'Facturado': 'bg-green-200/50 text-green-800 border-green-300/50',
  'Redireccionado': 'bg-gray-200/50 text-gray-800 border-gray-300/50',
  'Declinado': 'bg-red-200/50 text-red-800 border-red-300/50',
  'Sin respuesta': 'bg-orange-200/50 text-orange-800 border-orange-300/50',
  'Showroom': 'bg-purple-200/50 text-purple-800 border-purple-300/50',
};
