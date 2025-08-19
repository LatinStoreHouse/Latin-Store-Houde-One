'use client';
import React, { createContext, useState, ReactNode } from 'react';
import { initialInventoryData } from '@/lib/initial-inventory';
import { initialContainers as initialContainerData } from '@/lib/initial-containers';

export interface Product {
  name: string;
  quantity: number;
}

export interface Container {
  id: string;
  eta: string;
  carrier: string;
  products: Product[];
  status: 'En tránsito' | 'Atrasado' | 'Llegado';
  creationDate: string;
}

export type InventoryData = typeof initialInventoryData;

interface InventoryContextType {
  inventoryData: InventoryData;
  setInventoryData: React.Dispatch<React.SetStateAction<InventoryData>>;
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  transferFromFreeZone: (productName: string, quantity: number) => void;
  receiveContainer: (containerId: string) => void;
  addContainer: (container: Container) => void;
  editContainer: (containerId: string, updatedContainer: Container) => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryData, setInventoryData] = useState<InventoryData>(initialInventoryData);
  const [containers, setContainers] = useState<Container[]>(initialContainerData);

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

  const receiveContainer = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    setInventoryData(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory));
      
      for (const productInContainer of container.products) {
        const location = findProductLocation(productInContainer.name);
        if (location) {
          const { brand, subCategory } = location;
          newInventory[brand as keyof typeof newInventory][subCategory][productInContainer.name].zonaFranca += productInContainer.quantity;
        } else {
          // Handle new product not in inventory yet - for now, we log it.
          // A more robust solution might add it to a default category.
          console.warn(`Producto "${productInContainer.name}" del contenedor no fue encontrado en el inventario.`);
        }
      }
      return newInventory;
    });

    setContainers(prevContainers =>
      prevContainers.map(c =>
        c.id === containerId ? { ...c, status: 'Llegado' } : c
      )
    );
  };
  
  const addContainer = (container: Container) => {
    setContainers(prev => [container, ...prev]);
  };

  const editContainer = (containerId: string, updatedContainer: Container) => {
     setContainers(prev => prev.map(c => c.id === containerId ? updatedContainer : c));
  };


  return (
    <InventoryContext.Provider value={{ 
      inventoryData, 
      setInventoryData, 
      containers, 
      setContainers,
      transferFromFreeZone,
      receiveContainer,
      addContainer,
      editContainer
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
