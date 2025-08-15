export const inventoryMovementData: {
  [key: string]: {
    topMovers: { name: string; moved: number; change: number }[];
    bottomMovers: { name: string; moved: number; change: number }[];
  };
} = {
  '2024-07': {
    topMovers: [
      { name: 'KUND MULTY 1.22 X 0.61', moved: 152, change: 12.5 },
      { name: 'CONCRETO GRIS 1.22 X 0.61', moved: 121, change: 8.2 },
      { name: 'TAN 1.22 X 0.61', moved: 98, change: 5.1 },
      { name: 'CARRARA 2.44 X 1.22', moved: 85, change: 15.3 },
      { name: 'SILVER SHINE GOLD 1.22 X 0.61', moved: 76, change: -2.1 },
    ],
    bottomMovers: [
      { name: 'MINT WHITE 1.22 X 0.61', moved: 2, change: 0 },
      { name: 'COPPER 2.44 X 1.22', moved: 1, change: 0 },
      { name: 'CONCRETO MEDIO 2.44 X 1.22', moved: 1, change: 0 },
      { name: 'PANEL 3D - TAN 1.22 X 0.61', moved: 0, change: 0 },
      { name: 'INDIAN AUTUMN TRANSLUCIDA 2.44 X 1.22', moved: 0, change: 0 },
    ],
  },
  '2024-06': {
    topMovers: [
      { name: 'JEERA GREEN 1.22 X 0.61', moved: 180, change: 10.1 },
      { name: 'STEEL GRAY 1.22 X 0.61', moved: 140, change: 4.5 },
      { name: '3D ADHESIVO - 0,90 M2 - BLACK', moved: 110, change: -1.2 },
      { name: 'CARRARA 1.22 X 0.61', moved: 95, change: 20.0 },
      { name: 'MADERA NOGAL 0.15 X 2.44 MTS', moved: 88, change: 7.8 },
    ],
    bottomMovers: [
      { name: 'CRYSTAL WHITE 2.44 X 1.22', moved: 5, change: 0 },
      { name: 'BURNING FOREST 2.44 X 1.22', moved: 3, change: 0 },
      { name: 'HIMALAYA GOLD 1.22X0.61 MTS', moved: 2, change: 0 },
      { name: 'PERGOLA 10x5 - 3 COFFEE', moved: 1, change: 0 },
      { name: 'COPPER 1.22 X 0.61', moved: 0, change: 0 },
    ],
  },
   '2024-05': {
    topMovers: [
      { name: 'LISTON 6.8x2.5 - 3 MTS CAMEL', moved: 250, change: 15.0 },
      { name: 'CONCRETO GRIS 1.22 X 0.61', moved: 210, change: 9.3 },
      { name: 'DECK CO-EXTRUSION 13.8 X 2.3 3 MTS COLOR CF - WN', moved: 180, change: 11.1 },
      { name: 'TAN 1.22 X 0.61', moved: 150, change: 4.3 },
      { name: 'PERGOLA 9x4 - 3 MTS CAMEL', moved: 120, change: 2.1 },
    ],
    bottomMovers: [
      { name: 'SELLANTE WPC 1 GALON', moved: 4, change: 0 },
      { name: 'REMATE WALL PANEL MAPLE', moved: 2, change: 0 },
      { name: 'PERGOLA 16X8 - 3 MTS CHOCOLATE', moved: 1, change: 0 },
      { name: 'kUND MULTY 2.44 X 1.22', moved: 0, change: 0 },
      { name: 'BLACK 2.44 X 1.22', moved: 0, change: 0 },
    ],
  },
};
