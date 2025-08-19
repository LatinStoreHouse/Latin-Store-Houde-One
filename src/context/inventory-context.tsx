
'use client';
import React, { createContext, useState, ReactNode } from 'react';
import { initialInventoryData } from '@/lib/initial-inventory';
import { initialContainers as initialContainerData } from '@/lib/initial-containers';
import { initialReservations } from '@/lib/sales-history';

export interface Product {
  name: string;
  quantity: number;
  brand?: string;
  line?: string;
}

export interface Container {
  id: string;
  eta: string;
  carrier: string;
  products: Product[];
  status: 'En tránsito' | 'Atrasado' | 'Llegado';
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
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  date: string;
}

export type InventoryData = typeof initialInventoryData;

interface InventoryContextType {
  inventoryData: InventoryData;
  setInventoryData: React.Dispatch<React.SetStateAction<InventoryData>>;
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  notifications: AppNotification[];
  dismissNotification: (id: number) => void;
  transferFromFreeZone: (productName: string, quantity: number) => void;
  receiveContainer: (containerId: string, reservations: Reservation[]) => void;
  dispatchReservation: (quoteNumber: string) => void;
  addContainer: (container: Container) => void;
  editContainer: (containerId: string, updatedContainer: Container) => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryData, setInventoryData] = useState<InventoryData>(initialInventoryData);
  const [containers, setContainers] = useState<Container[]>(initialContainerData);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);


  const findProductLocation = (productName: string) => {
    for (const brand in inventoryData) {
      for (const subCategory in inventoryData[brand as keyof typeof inventoryData]) {
        if (inventoryData[brand as keyof typeof inventoryData][subCategory][productName]) {
          return { brand, subCategory };
        }
      }
    }
    return null;
  };

  const transferFromFreeZone = (productName: string, quantity: number) => {
    setInventoryData(prevData => {
      const location = findProductLocation(productName);
      if (!location) {
        throw new Error('Producto no encontrado en el inventario.');
      }
      
      const { brand, subCategory } = location;
      const product = prevData[brand as keyof typeof prevData][subCategory][productName];
      const availableInZF = product.zonaFranca - product.separadasZonaFranca;
      
      if (quantity > availableInZF) {
        throw new Error(`La cantidad a trasladar (${quantity}) excede la disponible en Zona Franca (${availableInZF}).`);
      }
      
      const reservedRatio = product.zonaFranca > 0 ? product.separadasZonaFranca / product.zonaFranca : 0;
      const separadasToTransfer = Math.round(quantity * reservedRatio);

      if (separadasToTransfer > product.separadasZonaFranca) {
        throw new Error(`El cálculo de separadas a mover excede las disponibles.`);
      }

      const newData = JSON.parse(JSON.stringify(prevData));
      const p = newData[brand as keyof typeof prevData][subCategory][productName];
      p.zonaFranca -= quantity;
      p.bodega += quantity;
      p.separadasZonaFranca -= separadasToTransfer;
      p.separadasBodega += separadasToTransfer;
      
      return newData;
    });
  };

  const receiveContainer = (containerId: string, reservations: Reservation[]) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    setInventoryData(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory));
      
      for (const productInContainer of container.products) {
        const location = findProductLocation(productInContainer.name);
        
        const reservedQuantity = reservations
            .filter(r => r.product === productInContainer.name && r.status === 'Validada')
            .reduce((sum, r) => sum + r.quantity, 0);

        if (location) {
          const { brand, subCategory } = location;
          const invProduct = newInventory[brand as keyof typeof newInventory][subCategory][productInContainer.name];
          invProduct.zonaFranca += productInContainer.quantity;
          invProduct.separadasZonaFranca += reservedQuantity;
        } else if (productInContainer.brand && productInContainer.line) {
          // If product is new, create it in the specified brand and line
          const { brand, line, name, quantity } = productInContainer;
          
          if (!newInventory[brand]) {
            newInventory[brand] = {};
          }
          if (!newInventory[brand][line]) {
            newInventory[brand][line] = {};
          }
          
          newInventory[brand][line][name] = {
            bodega: 0,
            zonaFranca: quantity,
            separadasBodega: 0,
            separadasZonaFranca: reservedQuantity,
            muestras: 0,
          };
          console.log(`Producto nuevo "${name}" creado en ${brand} > ${line}.`);

        } else {
          console.warn(`Producto "${productInContainer.name}" del contenedor no fue encontrado y no tiene información de marca/línea para crearlo.`);
        }
      }
      return newInventory;
    });

    setContainers(prevContainers =>
      prevContainers.map(c =>
        c.id === containerId ? { ...c, status: 'Llegado' } : c
      )
    );
    
    // Add notification
    const newNotification: AppNotification = {
        id: Date.now(),
        title: '¡Nuevo Material Disponible!',
        message: `El contenedor ${containerId} ha llegado y su contenido ha sido añadido al inventario de Zona Franca.`,
        date: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const dispatchReservation = (quoteNumber: string) => {
    const reservationToDispatch = reservations.find(r => r.quoteNumber === quoteNumber && r.status === 'Validada');

    if (!reservationToDispatch) {
        // It's not an error if a dispatch doesn't have a reservation
        console.log(`No se encontró una reserva validada para la cotización ${quoteNumber}. Se procederá con el despacho normal.`);
        return;
    }

    const location = findProductLocation(reservationToDispatch.product);
    if (!location) {
        throw new Error(`Producto ${reservationToDispatch.product} de la reserva no encontrado en inventario.`);
    }

    const { brand, subCategory } = location;
    
    setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const product = newData[brand as keyof typeof prevData][subCategory][reservationToDispatch.product];

        if (reservationToDispatch.source === 'Bodega') {
            if (product.bodega < reservationToDispatch.quantity || product.separadasBodega < reservationToDispatch.quantity) {
                throw new Error('Stock insuficiente en bodega para completar el despacho de la reserva.');
            }
            product.bodega -= reservationToDispatch.quantity;
            product.separadasBodega -= reservationToDispatch.quantity;
        } else { // Zona Franca or Container (which becomes Zona Franca)
             if (product.zonaFranca < reservationToDispatch.quantity || product.separadasZonaFranca < reservationToDispatch.quantity) {
                throw new Error('Stock insuficiente en zona franca para completar el despacho de la reserva.');
            }
            product.zonaFranca -= reservationToDispatch.quantity;
            product.separadasZonaFranca -= reservationToDispatch.quantity;
        }
        return newData;
    });
    
    // Update the reservation status to 'Despachada'
    setReservations(prev => 
        prev.map(r => r.id === reservationToDispatch.id ? { ...r, status: 'Despachada' } : r)
    );
  };
  
  const addContainer = (container: Container) => {
    setContainers(prev => [container, ...prev]);
  };

  const editContainer = (containerId: string, updatedContainer: Container) => {
     setContainers(prev => prev.map(c => c.id === containerId ? updatedContainer : c));
  };
  
  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }


  return (
    <InventoryContext.Provider value={{ 
      inventoryData, 
      setInventoryData, 
      containers, 
      setContainers,
      reservations,
      setReservations,
      notifications,
      dismissNotification,
      transferFromFreeZone,
      receiveContainer,
      dispatchReservation,
      addContainer,
      editContainer
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
