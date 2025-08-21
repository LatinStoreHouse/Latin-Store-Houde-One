export const inventoryMovementData: {
  [key: string]: {
    topMovers: { name: string; moved: number; change: number }[];
    bottomMovers: { name: string; moved: number; change: number }[];
  };
} = {
  '2024-07': {
    topMovers: [
      { name: 'Kund multy 1.22 x 0.61', moved: 152, change: 12.5 },
      { name: 'Concreto gris 1.22 x 0.61', moved: 121, change: 8.2 },
      { name: 'Tan 1.22 x 0.61', moved: 98, change: 5.1 },
      { name: 'Carrara 2.44 x 1.22', moved: 85, change: 15.3 },
      { name: 'Silver shine gold 1.22 x 0.61', moved: 76, change: -2.1 },
    ],
    bottomMovers: [
      { name: 'Mint white 1.22 x 0.61', moved: 2, change: 0 },
      { name: 'Copper 2.44 x 1.22', moved: 1, change: 0 },
      { name: 'Concreto medio 2.44 x 1.22', moved: 1, change: 0 },
      { name: 'Panel 3d - tan 1.22 x 0.61', moved: 0, change: 0 },
      { name: 'Indian autumn translucida 2.44 x 1.22', moved: 0, change: 0 },
    ],
  },
  '2024-06': {
    topMovers: [
      { name: 'Jeera green 1.22 x 0.61', moved: 180, change: 10.1 },
      { name: 'Steel gray 1.22 x 0.61', moved: 140, change: 4.5 },
      { name: '3d adhesivo - 0,90 m2 - black', moved: 110, change: -1.2 },
      { name: 'Carrara 1.22 x 0.61', moved: 95, change: 20.0 },
      { name: 'Madera nogal 0.15 x 2.44 mts', moved: 88, change: 7.8 },
    ],
    bottomMovers: [
      { name: 'Crystal white 2.44 x 1.22', moved: 5, change: 0 },
      { name: 'Burning forest 2.44 x 1.22', moved: 3, change: 0 },
      { name: 'Himalaya gold 1.22x0.61 mts', moved: 2, change: 0 },
      { name: 'Pergola 10x5 - 3 coffee', moved: 1, change: 0 },
      { name: 'Copper 1.22 x 0.61', moved: 0, change: 0 },
    ],
  },
   '2024-05': {
    topMovers: [
      { name: 'Liston 6.8x2.5 - 3 mts camel', moved: 250, change: 15.0 },
      { name: 'Concreto gris 1.22 x 0.61', moved: 210, change: 9.3 },
      { name: 'Deck co-extrusion 13.8 x 2.3 3 mts color cf - wn', moved: 180, change: 11.1 },
      { name: 'Tan 1.22 x 0.61', moved: 150, change: 4.3 },
      { name: 'Pergola 9x4 - 3 mts camel', moved: 120, change: 2.1 },
    ],
    bottomMovers: [
      { name: 'Sellante wpc 1 galon', moved: 4, change: 0 },
      { name: 'Remate wall panel maple', moved: 2, change: 0 },
      { name: 'Pergola 16x8 - 3 mts chocolate', moved: 1, change: 0 },
      { name: 'Kund multy 2.44 x 1.22', moved: 0, change: 0 },
      { name: 'Black 2.44 x 1.22', moved: 0, change: 0 },
    ],
  },
};
