
export const cityOptions = [
    { value: 'Bogotá', label: 'Bogotá' },
    { value: 'Medellín', label: 'Medellín' },
    { value: 'Cali', label: 'Cali' },
    { value: 'Barranquilla', label: 'Barranquilla' },
    { value: 'Cartagena', label: 'Cartagena' },
];

export const shippingRates: { [key: string]: { base: number; perKg: number } } = {
    'Bogotá': { base: 10000, perKg: 2000 },
    'Medellín': { base: 15000, perKg: 2500 },
    'Cali': { base: 12000, perKg: 2200 },
    'Barranquilla': { base: 20000, perKg: 3000 },
    'Cartagena': { base: 18000, perKg: 2800 },
};
