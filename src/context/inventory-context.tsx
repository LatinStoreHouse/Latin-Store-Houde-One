

'use client';
import React, { createContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { initialInventoryData } from '@/lib/initial-inventory';
import { initialContainers as initialContainerData } from '@/lib/initial-containers';
import { initialReservations } from '@/lib/sales-history';
import { TransferItem } from '@/components/transfer-inventory-form';
import { productDimensions } from '@/lib/dimensions';
import { initialProductPrices } from '@/lib/prices';
import { useToast } from '@/hooks/use-toast';
import { inventoryMovementData } from '@/lib/inventory-movement';
import type { User, Role } from '@/lib/roles';
import { initialQuotes } from '@/lib/quotes-history';
import { initialAdhesiveYields, initialSealantYields } from '@/lib/supplies-data';


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

export type InventoryData = typeof initialInventoryData;

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
  inventoryData: InventoryData;
  setInventoryData: (updater: (data: InventoryData) => InventoryData, user: User | null) => void;
  inventoryHistory: InventoryHistoryEntry[];
  productPrices: { [key: string]: number };
  setProductPrices: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  productDimensions: { [key: string]: string };
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  dismissNotification: (id: number) => void;
  systemSuggestions: Suggestion[];
  seenSuggestionsCount: number;
  markSuggestionsAsSeen: () => void;
  transferFromFreeZone: (items: TransferItem[]) => void;
  receiveContainer: (containerId: string, reservations: Reservation[]) => void;
  revertContainerReception: (containerId: string) => void;
  dispatchReservation: (quoteNumber: string) => void;
  dispatchDirectFromInventory: (productsToDispatch: { name: string, quantity: number, origin: 'Bodega' | 'Zona Franca'}[]) => void;
  releaseReservationStock: (reservation: Reservation) => void;
  addProduct: (product: { name: string; brand: string; line: string; size?: string; price: number, stock: any }) => void;
  addContainer: (container: Container) => void;
  editContainer: (containerId: string, updatedContainer: Container) => void;
  updateProductName: (oldName: string, newName: string) => void;
  productSubscriptions: Record<string, string[]>;
  toggleProductSubscription: (productName: string, userName: string) => void;
  quotes: Quote[];
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  adhesiveYields: AdhesiveYield[];
  setAdhesiveYields: React.Dispatch<React.SetStateAction<AdhesiveYield[]>>;
  sealantYields: SealantYield[];
  setSealantYields: React.Dispatch<React.SetStateAction<SealantYield[]>>;
  starwoodYields: StarwoodYields;
  setStarwoodYields: React.Dispatch<React.SetStateAction<StarwoodYields>>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryData, setInventoryDataState] = useState<InventoryData>(initialInventoryData);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryEntry[]>([]);
  const [productPrices, setProductPrices] = useState(initialProductPrices);
  const [localProductDimensions, setLocalProductDimensions] = useState(productDimensions);
  const [containers, setContainers] = useState<Container[]>(initialContainerData);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [productSubscriptions, setProductSubscriptions] = useState<Record<string, string[]>>({});
  const [seenSuggestionsCount, setSeenSuggestionsCount] = useState(0);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [adhesiveYields, setAdhesiveYields] = useState<AdhesiveYield[]>(initialAdhesiveYields);
  const [sealantYields, setSealantYields] = useState<SealantYield[]>(initialSealantYields);
  const [starwoodYields, setStarwoodYields] = useState<StarwoodYields>({
    clipsPerSqM: 21,
    sleeperLinearMetersPerSqM: 3.5,
    listonsPerAdhesive: 8,
    listonsPerSealant: 30,
  });
  const { toast } = useToast();

    const addQuote = (quote: Omit<Quote, 'id'>) => {
        const newQuote: Quote = { ...quote, id: `QT-${Date.now()}` };
        setQuotes(prev => [newQuote, ...prev]);
        toast({
            title: 'Cotización Guardada',
            description: `La cotización #${quote.quoteNumber} ha sido guardada en el historial.`
        })
    }

  const findProductLocation = (productName: string, data: InventoryData) => {
    for (const brand in data) {
      for (const subCategory in data[brand as keyof typeof data]) {
        if (data[brand as keyof typeof data][subCategory][productName]) {
          return { brand, subCategory };
        }
      }
    }
    return null;
  };

  const setInventoryData = (updater: (data: InventoryData) => InventoryData, user: User | null) => {
    const oldData = inventoryData;
    const newData = updater(oldData);
    
    // Generate history
    const newHistoryEntries: InventoryHistoryEntry[] = [];
    const date = new Date().toISOString();

    for(const brand in newData) {
        for(const line in newData[brand as keyof typeof newData]) {
            for(const productName in newData[brand as keyof typeof newData][line]) {
                const oldProduct = oldData[brand as keyof typeof newData]?.[line]?.[productName];
                const newProduct = newData[brand as keyof typeof newData][line][productName];

                if (oldProduct) {
                    (Object.keys(newProduct) as Array<keyof typeof newProduct>).forEach(key => {
                        if (['bodega', 'zonaFranca', 'muestras'].includes(key) && oldProduct[key] !== newProduct[key]) {
                            newHistoryEntries.push({
                                id: `${date}-${productName}-${key}`,
                                productName,
                                location: key as 'bodega' | 'zonaFranca' | 'muestras',
                                oldValue: oldProduct[key],
                                newValue: newProduct[key],
                                changedBy: user?.name || 'Sistema',
                                date: date,
                            });
                        }
                    });
                }
            }
        }
    }
    
    if (newHistoryEntries.length > 0) {
        setInventoryHistory(prev => [...newHistoryEntries, ...prev]);
    }
    
    setInventoryDataState(newData);
  };
  
  const systemSuggestions: Suggestion[] = useMemo(() => {
    const suggestionList: Suggestion[] = [];
    const productSet = new Set<string>();

    const allMonthKeys = Object.keys(inventoryMovementData).sort().reverse();
    const lastMonthKey = allMonthKeys[0] || '';
    const last6MonthsKeys = allMonthKeys.slice(0, 6);

    const lastMonthMovers = inventoryMovementData[lastMonthKey]?.topMovers || [];
    const last6MonthsMovers = last6MonthsKeys.flatMap(key => inventoryMovementData[key]?.topMovers || []);

    for (const brand in inventoryData) {
      for (const line in inventoryData[brand]) {
        for (const name in inventoryData[brand][line]) {
          if (productSet.has(name)) continue;

          const product = inventoryData[brand][line][name];
          const availableStock = (product.bodega - product.separadasBodega) + (product.zonaFranca - product.separadasZonaFranca);
          const monthlyMovement = lastMonthMovers.find(m => m.name === name)?.moved || 0;
          const soldInLast6Months = last6MonthsMovers.some(m => m.name === name && m.moved > 0);
          
          if (availableStock <= 0) {
            if (soldInLast6Months) {
                suggestionList.push({
                    productName: name,
                    currentStock: availableStock,
                    monthlyMovement: monthlyMovement,
                    reason: 'Sin Existencias',
                });
                productSet.add(name);
            }
            continue; // Don't process other rules if out of stock
          }
          
          if (availableStock < 50 && monthlyMovement > 20) {
            suggestionList.push({
              productName: name,
              currentStock: availableStock,
              monthlyMovement: monthlyMovement,
              reason: 'Stock Bajo',
            });
            productSet.add(name);
          } else if (monthlyMovement > 100) {
             suggestionList.push({
              productName: name,
              currentStock: availableStock,
              monthlyMovement: monthlyMovement,
              reason: 'Alta Demanda',
            });
            productSet.add(name);
          }
        }
      }
    }
    return suggestionList;
  }, [inventoryData]);

  const addProduct = (product: { name: string; brand: string; line: string; size?: string; price: number, stock: any }) => {
    const { name, brand, line, size, price, stock } = product;

    // Update inventory data
    setInventoryData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        if (!newData[brand as keyof typeof newData]) {
            newData[brand as keyof typeof newData] = {};
        }
        if (!newData[brand as keyof typeof newData][line]) {
            newData[brand as keyof typeof newData][line] = {};
        }
        newData[brand as keyof typeof newData][line][name] = stock;
        return newData;
    }, null);

    // Update prices
    setProductPrices(prev => ({ ...prev, [name]: price }));

    // Update dimensions if provided
    if (size) {
        setLocalProductDimensions(prev => ({ ...prev, [name]: size }));
    }
  };


  const updateProductName = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    setInventoryData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        const location = findProductLocation(oldName, prev);
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
    }, null);

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
    const location = findProductLocation(reservation.product, inventoryData);
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
    }, null);
  };

  const transferFromFreeZone = (items: TransferItem[]) => {
    setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));

        for (const item of items) {
            const { productName, quantity, reservationsToTransfer } = item;
            const location = findProductLocation(productName, newData);
            if (!location) {
                throw new Error(`Producto ${productName} no encontrado en el inventario.`);
            }

            const { brand, subCategory } = location;
            const product = newData[brand as keyof typeof newData][subCategory][productName];
            
            if (quantity > product.zonaFranca) {
                throw new Error(`La cantidad a trasladar para ${productName} (${quantity}) excede el total en Zona Franca (${product.zonaFranca}).`);
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
    }, null);

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
                read: false,
                user: userName
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

        const location = findProductLocation(productInContainer.name, newInventory);
        
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
              read: false,
              role: 'Contador',
              href: '/pricing'
            });
            newNotifications.push({
              id: Date.now() + Math.random(),
              title: 'Precio Requerido para Nuevo Producto',
              message: `El nuevo producto "${name}" ha sido agregado al inventario pero no tiene un precio. Por favor, actualícelo en la página de Precios.`,
              date: new Date().toISOString(),
              read: false,
              role: 'Administrador',
              href: '/pricing'
            });
          }

        } else {
          console.warn(`Producto "${productInContainer.name}" del contenedor no fue encontrado y no tiene información de marca/línea para crearlo.`);
        }
      }
      return newInventory;
    }, null);
    
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
        c.id === containerId ? { ...c, status: 'Ya llego' } : c
      )
    );
    
    // Add general and price-specific notifications
     const generalNotification: Omit<AppNotification, 'id' | 'date' | 'read'> = {
        title: '¡Nuevo Material Disponible!',
        message: `El contenedor ${containerId} ha llegado y su contenido ha sido añadido al inventario de Zona Franca.`,
        role: 'Logística',
        href: '/transit'
    };
    addNotification(generalNotification);
    addNotification({...generalNotification, role: 'Contador'});
    addNotification({...generalNotification, role: 'Administrador'});
    
    newNotifications.forEach(addNotification);
  };

  const revertContainerReception = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || container.status !== 'Ya llego') {
        throw new Error("Solo se pueden revertir contenedores que ya han llegado.");
    }
    
    const reservationsFromThisContainer = reservations.filter(r => r.sourceId === containerId && r.status === 'Validada');

    setInventoryData(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory));
      
      for (const productInContainer of container.products) {
        const location = findProductLocation(productInContainer.name, newInventory);
        if (!location) continue; // Should not happen if it was received correctly

        const { brand, subCategory } = location;
        const invProduct = newInventory[brand as keyof typeof newInventory][subCategory][productInContainer.name];

        const reservedQuantity = reservationsFromThisContainer
            .filter(r => r.product === productInContainer.name)
            .reduce((sum, r) => sum + r.quantity, 0);

        if (invProduct.zonaFranca < productInContainer.quantity || invProduct.separadasZonaFranca < reservedQuantity) {
            throw new Error(`No se puede revertir ${productInContainer.name}: el stock en Zona Franca ya ha sido movido o despachado.`);
        }
        
        invProduct.zonaFranca -= productInContainer.quantity;
        invProduct.separadasZonaFranca -= reservedQuantity;
      }
      return newInventory;
    }, null);

    setReservations(prevReservations =>
      prevReservations.map(r => {
        if (r.sourceId === containerId && r.source === 'Zona Franca') {
          return { ...r, source: 'Contenedor', sourceId: containerId };
        }
        return r;
      })
    );

    setContainers(prevContainers =>
      prevContainers.map(c =>
        c.id === containerId ? { ...c, status: 'En puerto' } : c
      )
    );
  };
  
  const dispatchReservation = (quoteNumber: string) => {
    const reservationToDispatch = reservations.find(r => r.quoteNumber === quoteNumber && r.status === 'Validada');

    if (!reservationToDispatch) {
        throw new Error(`No se encontró una reserva validada para la cotización ${quoteNumber}.`);
    }

    const location = findProductLocation(reservationToDispatch.product, inventoryData);
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
    }, null);
    
    // Update the reservation status to 'Despachada'
    setReservations(prev => 
        prev.map(r => r.id === reservationToDispatch.id ? { ...r, status: 'Despachada' } : r)
    );
  };

  const dispatchDirectFromInventory = (productsToDispatch: { name: string, quantity: number, origin: 'Bodega' | 'Zona Franca' }[]) => {
     setInventoryData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        
        for (const productToDispatch of productsToDispatch) {
            const location = findProductLocation(productToDispatch.name, newData);
            if (!location) {
                throw new Error(`Producto ${productToDispatch.name} no encontrado en inventario.`);
            }
            const { brand, subCategory } = location;
            const product = newData[brand as keyof typeof prevData][subCategory][productToDispatch.name];
            
            if (productToDispatch.origin === 'Bodega') {
                const availableInBodega = product.bodega - product.separadasBodega;
                if (availableInBodega < productToDispatch.quantity) {
                     throw new Error(`Stock insuficiente en bodega para despachar ${productToDispatch.quantity} de ${productToDispatch.name}. Disponible: ${availableInBodega}`);
                }
                product.bodega -= productToDispatch.quantity;
            } else { // Zona Franca
                const availableInZF = product.zonaFranca - product.separadasZonaFranca;
                if (availableInZF < productToDispatch.quantity) {
                    throw new Error(`Stock insuficiente en Zona Franca para despachar ${productToDispatch.quantity} de ${productToDispatch.name}. Disponible: ${availableInZF}`);
                }
                product.zonaFranca -= productToDispatch.quantity;
            }
        }
        
        return newData;
    }, null);
  }
  
  const addContainer = (container: Container) => {
    setContainers(prev => [container, ...prev]);
  };

  const editContainer = (containerId: string, updatedContainer: Container) => {
     setContainers(prev => prev.map(c => c.id === containerId ? updatedContainer : c));
  };

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
  
  const markSuggestionsAsSeen = () => {
    setSeenSuggestionsCount(systemSuggestions.length);
  };

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
      inventoryHistory,
      productPrices,
      setProductPrices,
      productDimensions: localProductDimensions, 
      containers, 
      setContainers,
      reservations,
      setReservations,
      notifications,
      addNotification,
      dismissNotification,
      systemSuggestions,
      seenSuggestionsCount,
      markSuggestionsAsSeen,
      transferFromFreeZone,
      receiveContainer,
      revertContainerReception,
      dispatchReservation,
      dispatchDirectFromInventory,
      releaseReservationStock,
      addProduct,
      addContainer,
      editContainer,
      updateProductName,
      productSubscriptions,
      toggleProductSubscription,
      quotes,
      addQuote,
      adhesiveYields,
      setAdhesiveYields,
      sealantYields,
      setSealantYields,
      starwoodYields,
      setStarwoodYields,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
