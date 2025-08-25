
'use client';
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { initialInventoryData } from '@/lib/initial-inventory';
import { initialContainers as initialContainerData } from '@/lib/initial-containers';
import { initialReservations } from '@/lib/sales-history';
import { TransferItem } from '@/components/transfer-inventory-form';
import { productDimensions } from '@/lib/dimensions';
import { initialProductPrices } from '@/lib/prices';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  name: string;
  quantity: number;
  brand?: string;
  line?: string;
  size?: string;
}

export type ContainerStatus = 'En producción' | 'En tránsito' | 'En puerto' | 'Atrasado' | 'Llegado';

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
  productPrices: { [key: string]: number };
  productDimensions: { [key: string]: string };
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  notifications: AppNotification[];
  dismissNotification: (id: number) => void;
  transferFromFreeZone: (items: TransferItem[]) => void;
  receiveContainer: (containerId: string, reservations: Reservation[]) => void;
  dispatchReservation: (quoteNumber: string) => void;
  dispatchDirectFromInventory: (productsToDispatch: { name: string, quantity: number }[]) => void;
  releaseReservationStock: (reservation: Reservation) => void;
  addContainer: (container: Container) => void;
  editContainer: (containerId: string, updatedContainer: Container) => void;
  updateProductName: (oldName: string, newName: string) => void;
  productSubscriptions: Record<string, string[]>;
  toggleProductSubscription: (productName: string, userName: string) => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryData, setInventoryData] = useState<InventoryData>(initialInventoryData);
  const [productPrices, setProductPrices] = useState(initialProductPrices);
  const [localProductDimensions, setLocalProductDimensions] = useState(productDimensions);
  const [containers, setContainers] = useState<Container[]>(initialContainerData);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [productSubscriptions, setProductSubscriptions] = useState<Record<string, string[]>>({});
  const { toast } = useToast();


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

  const updateProductName = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    setInventoryData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        const location = findProductLocation(oldName);
        if (location) {
            const { brand, subCategory } = location;
            if (newData[brand][subCategory][newName]) {
                toast({ variant: 'destructive', title: 'Error', description: `El nombre de producto "${newName}" ya existe.`});
                return prev;
            }
            const productData = newData[brand][subCategory][oldName];
            delete newData[brand][subCategory][oldName];
            newData[brand][subCategory][newName] = productData;
        }
        return newData;
    });

    setProductPrices(prev => {
        const newPrices = {...prev};
        if (newPrices.hasOwnProperty(oldName)) {
            newPrices[newName] = newPrices[oldName];
            delete newPrices[oldName];
        }
        return newPrices;
    });

    setLocalProductDimensions(prev => {
         const newDimensions = {...prev};
        if (newDimensions.hasOwnProperty(oldName)) {
            newDimensions[newName] = newDimensions[oldName];
            delete newDimensions[oldName];
        }
        return newDimensions;
    });

    setContainers(prev => prev.map(container => ({
        ...container,
        products: container.products.map(p => p.name === oldName ? { ...p, name: newName } : p)
    })));

    setReservations(prev => prev.map(r => r.product === oldName ? { ...r, product: newName } : r));
    
    toast({ title: 'Nombre Actualizado', description: `"${oldName}" ha sido renombrado a "${newName}" en todo el sistema.`});
  };

  const releaseReservationStock = (reservation: Reservation) => {
    const location = findProductLocation(reservation.product);
    if (!location) return;

    const { brand, subCategory } = location;
    setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const product = newData[brand as keyof typeof prevData][subCategory][reservation.product];
        
        if (reservation.source === 'Bodega') {
            product.separadasBodega -= reservation.quantity;
        } else if (reservation.source === 'Zona Franca') {
            product.separadasZonaFranca -= reservation.quantity;
        }
        return newData;
    });
  };

  const transferFromFreeZone = (items: TransferItem[]) => {
    setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));

        for (const item of items) {
            const { productName, quantity, reservationsToTransfer } = item;
            const location = findProductLocation(productName);
            if (!location) {
                throw new Error(`Producto ${productName} no encontrado en el inventario.`);
            }

            const { brand, subCategory } = location;
            const product = newData[brand as keyof typeof newData][subCategory][productName];
            
            if (quantity > product.zonaFranca) {
                throw new Error(`La cantidad a trasladar para ${productName} (${quantity}) excede el stock total en Zona Franca (${product.zonaFranca}).`);
            }

            // Move total stock
            product.zonaFranca -= quantity;
            product.bodega += quantity;

            // Move selected reservations
            const totalReservedToTransfer = reservationsToTransfer.reduce((acc, r) => acc + r.quantity, 0);

            if (totalReservedToTransfer > product.separadasZonaFranca) {
                throw new Error(`Las separaciones a mover para ${productName} (${totalReservedToTransfer}) exceden las disponibles en Zona Franca (${product.separadasZonaFranca}).`);
            }
            
            product.separadasZonaFranca -= totalReservedToTransfer;
            product.separadasBodega += totalReservedToTransfer;
        }

        return newData;
    });

    // Update the source of all transferred reservations from all items
    const allReservationsToTransfer = items.flatMap(item => item.reservationsToTransfer);
    const idsToTransfer = new Set(allReservationsToTransfer.map(r => r.id));
    
    setReservations(prevRes => 
        prevRes.map(r => {
            if (idsToTransfer.has(r.id)) {
                return { ...r, source: 'Bodega', sourceId: 'Bodega' };
            }
            return r;
        })
    );
  };

  const receiveContainer = (containerId: string, validatedReservations: Reservation[]) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    const newNotifications: AppNotification[] = [];

    setInventoryData(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory));
      
      for (const productInContainer of container.products) {
        // Notify subscribed users
        const subscribers = productSubscriptions[productInContainer.name] || [];
        for (const userName of subscribers) {
            newNotifications.push({
                id: Date.now() + Math.random(),
                title: '¡Stock Disponible!',
                message: `El producto "${productInContainer.name}" por el que te suscribiste ya está disponible en Zona Franca.`,
                date: new Date().toISOString(),
                // We can add a 'user' property if notifications become user-specific
            });
        }
         // Clear subscriptions for this product
        setProductSubscriptions(prev => {
            const newSubs = {...prev};
            delete newSubs[productInContainer.name];
            return newSubs;
        });


        // Find the quantity reserved for this specific product in this container
        const reservedQuantity = validatedReservations
            .filter(r => r.product === productInContainer.name)
            .reduce((sum, r) => sum + r.quantity, 0);

        const location = findProductLocation(productInContainer.name);
        
        if (location) {
          const { brand, subCategory } = location;
          const invProduct = newInventory[brand as keyof typeof newInventory][subCategory][productInContainer.name];
          invProduct.zonaFranca += productInContainer.quantity;
          invProduct.separadasZonaFranca += reservedQuantity;
        } else if (productInContainer.brand && productInContainer.line) {
          // If product is new, create it in the specified brand and line
          const { brand, line, name, quantity, size } = productInContainer;
          
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
          
          // Check if the new product has a price
          if (!initialProductPrices.hasOwnProperty(name)) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              title: 'Precio Requerido para Nuevo Producto',
              message: `El nuevo producto "${name}" ha sido agregado al inventario pero no tiene un precio. Por favor, actualícelo en la página de Precios.`,
              date: new Date().toISOString(),
            });
          }

        } else {
          console.warn(`Producto "${productInContainer.name}" del contenedor no fue encontrado y no tiene información de marca/línea para crearlo.`);
        }
      }
      return newInventory;
    });
    
    // Change reservation source from 'Container' to 'Zona Franca'
    setReservations(prevReservations =>
      prevReservations.map(r => {
        if (r.sourceId === containerId && r.status === 'Validada') {
          return { ...r, source: 'Zona Franca', sourceId: 'Zona Franca' };
        }
        return r;
      })
    );

    setContainers(prevContainers =>
      prevContainers.map(c =>
        c.id === containerId ? { ...c, status: 'Llegado' } : c
      )
    );
    
    // Add general and price-specific notifications
     const generalNotification: AppNotification = {
        id: Date.now(),
        title: '¡Nuevo Material Disponible!',
        message: `El contenedor ${containerId} ha llegado y su contenido ha sido añadido al inventario de Zona Franca.`,
        date: new Date().toISOString(),
    };
    setNotifications(prev => [generalNotification, ...newNotifications, ...prev]);
  };
  
  const dispatchReservation = (quoteNumber: string) => {
    const reservationToDispatch = reservations.find(r => r.quoteNumber === quoteNumber && r.status === 'Validada');

    if (!reservationToDispatch) {
        throw new Error(`No se encontró una reserva validada para la cotización ${quoteNumber}.`);
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

  const dispatchDirectFromInventory = (productsToDispatch: { name: string, quantity: number }[]) => {
     setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        
        for (const productToDispatch of productsToDispatch) {
            const location = findProductLocation(productToDispatch.name);
            if (!location) {
                throw new Error(`Producto ${productToDispatch.name} no encontrado en inventario.`);
            }
            const { brand, subCategory } = location;
            const product = newData[brand as keyof typeof prevData][subCategory][productToDispatch.name];
            
            const availableInBodega = product.bodega - product.separadasBodega;
            if (availableInBodega < productToDispatch.quantity) {
                 throw new Error(`Stock insuficiente en bodega para despachar ${productToDispatch.quantity} de ${productToDispatch.name}. Disponible: ${availableInBodega}`);
            }
            
            product.bodega -= productToDispatch.quantity;
        }
        
        return newData;
    });
  }
  
  const addContainer = (container: Container) => {
    setContainers(prev => [container, ...prev]);
  };

  const editContainer = (containerId: string, updatedContainer: Container) => {
     setContainers(prev => prev.map(c => c.id === containerId ? updatedContainer : c));
  };
  
  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      inventoryData, 
      setInventoryData,
      productPrices,
      productDimensions: localProductDimensions, 
      containers, 
      setContainers,
      reservations,
      setReservations,
      notifications,
      dismissNotification,
      transferFromFreeZone,
      receiveContainer,
      dispatchReservation,
      dispatchDirectFromInventory,
      releaseReservationStock,
      addContainer,
      editContainer,
      updateProductName,
      productSubscriptions,
      toggleProductSubscription
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
