

'use client';
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/roles';

export interface Product {
  name: string;
  quantity: number;
  brand?: string;
  line?: string;
  size?: string;
}

export type ContainerStatus = 'En producción' | 'En tránsito' | 'En puerto' | 'Atrasado' | 'Ya llego';

export interface Container {
  id: string;
  eta: string;
  carrier: string;
  products: Product[];
  status: ContainerStatus;
  creationDate: string;
}

export interface Reservation {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  sourceId: string; // Container ID or warehouse location ('Bodega' / 'Zona Franca')
  advisor: string;
  quoteNumber: string;
  status: 'En espera de validación' | 'Validada' | 'Rechazada' | 'Despachada';
  source: 'Contenedor' | 'Bodega' | 'Zona Franca';
  expirationDate?: string;
  isPaid?: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  date: string;
  read?: boolean;
  user?: string; // To target a notification to a specific user by name
  role?: Role; // To target a notification to a specific role
  href?: string; // Optional link for the notification
}

export interface Suggestion {
  productName: string;
  currentStock: number;
  monthlyMovement: number;
  reason: 'Stock Bajo' | 'Alta Demanda' | 'Sin Existencias';
}

export type InventoryData = import('@/lib/initial-inventory').initialInventoryData;

export interface InventoryHistoryEntry {
  id: string;
  productName: string;
  location: 'bodega' | 'zonaFranca' | 'muestras';
  oldValue: number;
  newValue: number;
  changedBy: string;
  date: string;
}

export interface Quote {
    id: string;
    quoteNumber: string;
    calculatorType: 'StoneFlex' | 'Starwood';
    customerName: string;
    advisorName: string;
    creationDate: string;
    total: number;
    currency: 'COP' | 'USD';
    items: {
        reference: string;
        quantity: number;
        price: number;
    }[];
    details: any; // To store the full quote object for later view
}

export interface AdhesiveYield {
    groupName?: string;
    productNames: string[];
    yield: number | null;
    isTranslucent: boolean;
}

export interface SealantYield {
    sealant: string;
    standardYield: number;
    clayYield: number;
}

export interface StarwoodYields {
    clipsPerSqM: number;
    sleeperLinearMetersPerSqM: number;
    listonsPerAdhesive: number;
    listonsPerSealant: number;
}

interface InventoryContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  dismissNotification: (id: number) => void;
  productSubscriptions: Record<string, string[]>;
  toggleProductSubscription: (productName: string, userName: string) => void;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [productSubscriptions, setProductSubscriptions] = useState<Record<string, string[]>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const newNotification: AppNotification = {
      id: Date.now() + Math.random(), // Add random number to avoid collision
      date: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const dismissNotification = (id: number) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  }

  const toggleProductSubscription = (productName: string, userName: string) => {
    setProductSubscriptions(prev => {
        const newSubs = {...prev};
        const currentSubscribers = newSubs[productName] || [];
        const isSubscribed = currentSubscribers.includes(userName);

        if (isSubscribed) {
            newSubs[productName] = currentSubscribers.filter(name => name !== userName);
        } else {
            newSubs[productName] = [...currentSubscribers, userName];
            toast({ title: '¡Te Notificaremos!', description: `Recibirás una alerta cuando "${productName}" esté disponible.` });
        }
        
        return newSubs;
    });
  }

  // Effect to show toast on unsubscribing, avoiding setState in render issue
  useEffect(() => {
    const handler = (e: any) => {
        const { productName, isSubscribed } = e.detail;
        if (!isSubscribed) {
            toast({ title: 'Suscripción Cancelada', description: `Ya no recibirás notificaciones para "${productName}".` });
        }
    };
    window.addEventListener('subscription-change', handler);
    return () => window.removeEventListener('subscription-change', handler);
  }, [toast]);


  return (
    <InventoryContext.Provider value={{ 
      notifications,
      addNotification,
      dismissNotification,
      productSubscriptions,
      toggleProductSubscription,
      reservations,
      setReservations,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
