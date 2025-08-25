
export type Permission = 
  // Dashboard
  'dashboard:view' |
  // Inventory
  'inventory:view' |
  'inventory:transit' |
  // Sales
  'invoices:view' |
  // Orders
  'orders:view' |
  'orders:create' |
  'orders:validate' |
  // Validation
  'validation:view' |
  // Customers
  'customers:view' |
  'customers:create' |
  'customers:edit' |
  // Calculators
  'calculators:use' |
  // Pricing
  'pricing:view' |
  'pricing:edit' |
  // Users
  'users:view' |
  'users:manage' |
  // Roles
  'roles:view' |
  'roles:manage' |
  // Reports
  'reports:view' |
  // AI Advisor
  'advisor:use' |
  // Reservations
  'reservations:view' |
  'reservations:create' |
  'reservations:validate' |
  // Marketing
  'marketing:view' |
  'marketing:create';

export type Role = 'Administrador' | 'Asesor de Ventas' | 'Contador' | 'Logística' | 'Marketing' | 'Partners';

export interface RoleConfig {
    id: string;
    name: Role;
    permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  avatar: string;
  active: boolean;
}


export const roles: RoleConfig[] = [
    {
        id: 'admin',
        name: 'Administrador',
        permissions: [
            'dashboard:view',
            'inventory:view',
            'inventory:transit',
            'invoices:view',
            'orders:view',
            'orders:create',
            'orders:validate',
            'validation:view',
            'customers:view',
            'customers:create',
            'customers:edit',
            'calculators:use',
            'pricing:view',
            'pricing:edit',
            'users:view',
            'users:manage',
            'roles:view',
            'roles:manage',
            'reports:view',
            'advisor:use',
            'reservations:view',
            'reservations:create',
            'reservations:validate',
            'marketing:view',
            'marketing:create'
        ]
    },
    {
        id: 'sales_advisor',
        name: 'Asesor de Ventas',
        permissions: [
            'dashboard:view',
            'inventory:view',
            'inventory:transit',
            'invoices:view',
            'orders:view',
            'orders:create',
            'customers:view',
            'customers:create',
            'customers:edit',
            'calculators:use',
            'pricing:view',
            'advisor:use',
            'reservations:view',
            'reservations:create'
        ]
    },
    {
        id: 'accountant',
        name: 'Contador',
        permissions: [
            'dashboard:view',
            'inventory:view',
            'inventory:transit',
            'orders:view',
            'invoices:view',
            'orders:validate',
            'validation:view',
            'pricing:view',
            'pricing:edit',
            'reports:view',
            'reservations:view',
            'reservations:validate'
        ]
    },
    {
        id: 'logistics',
        name: 'Logística',
        permissions: [
            'dashboard:view',
            'inventory:view',
            'inventory:transit',
            'orders:view',
            'reservations:view',
        ]
    },
    {
        id: 'marketing',
        name: 'Marketing',
        permissions: [
            'dashboard:view',
            'customers:view',
            'customers:create',
            'customers:edit',
            'reports:view',
            'advisor:use',
            'marketing:view',
            'marketing:create',
            'pricing:view'
        ]
    },
    {
        id: 'partners',
        name: 'Partners',
        permissions: [
            'dashboard:view',
            'inventory:view',
            'calculators:use',
            'invoices:view',
            'pricing:view'
        ]
    }
];

