
import type { Quote } from '@/context/inventory-context';

export const initialQuotes: Quote[] = [
    {
        id: 'QT-1722369000001',
        quoteNumber: 'V-100-1234',
        calculatorType: 'StoneFlex',
        customerName: 'Constructora Capital',
        advisorName: 'Jane Smith',
        creationDate: '2024-07-28T10:00:00.000Z',
        total: 5831000,
        currency: 'COP',
        items: [
            { reference: 'Black', quantity: 20, price: 131100 },
            { reference: 'Adhesivo', quantity: 10, price: 28039 },
        ],
        details: {}
    },
    {
        id: 'QT-1722369000002',
        quoteNumber: 'V-200-5678',
        calculatorType: 'Starwood',
        customerName: 'Diseño Interior Pro',
        advisorName: 'John Doe',
        creationDate: '2024-07-29T11:30:00.000Z',
        total: 1270000,
        currency: 'COP',
        items: [
            { reference: 'Deck (teak/coffee)', quantity: 10, price: 127000 },
        ],
        details: {}
    },
     {
        id: 'QT-1722369000003',
        quoteNumber: 'V-100-9101',
        calculatorType: 'StoneFlex',
        customerName: 'Hogar Futuro',
        advisorName: 'Jane Smith',
        creationDate: '2024-07-29T15:00:00.000Z',
        total: 1770430,
        currency: 'COP',
        items: [
            { reference: 'Carrara', quantity: 10, price: 177043 },
        ],
        details: {}
    }
];
