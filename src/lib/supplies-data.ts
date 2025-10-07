

export const initialAdhesiveYields = [
    { groupName: 'Pizarras, Cuarcitas, Mármoles y Maderas Estándar', productNames: ['Cut stone', 'Travertino', 'Concreto encofrado', 'Tapia negra', 'Black', 'Kund multy', 'Tan', 'Indian autumn', 'Burning forest', 'Copper', 'Jeera green', 'Silver shine', 'Silver shine gold', 'Steel grey', 'Carrara', 'Crystal white', 'Mint white', 'Madera nogal', 'Madera teka', 'Madera ébano'], yield: 0.5, isTranslucent: false },
    { groupName: 'Pizarras, Cuarcitas y Mármoles XL', productNames: ['Black XL', 'Kund multy XL', 'Tan XL', 'Indian autumn XL', 'Burning forest XL', 'Copper XL', 'Jeera green XL', 'Silver shine XL', 'Silver shine gold XL', 'Steel grey XL', 'Carrara XL', 'Crystal white XL'], yield: 2, isTranslucent: false },
    { groupName: 'Mármol Himalaya', productNames: ['Himalaya gold'], yield: 1.5, isTranslucent: false },
    { groupName: 'Mármol Himalaya XL', productNames: ['Himalaya gold XL'], yield: 3.5, isTranslucent: false },
    { groupName: 'Concretos Estándar', productNames: ['Concreto blanco', 'Concreto gris', 'Concrete with holes', 'Concreto gris medium'], yield: 1.8, isTranslucent: false },
    { groupName: 'Concretos XL', productNames: ['Concreto blanco XL', 'Concreto gris XL', 'Concrete with holes XL', 'Concreto medio'], yield: 3, isTranslucent: false },
    { groupName: 'Translúcidas Estándar', productNames: ['Indian autumn translucido'], yield: 0.5, isTranslucent: true },
    { groupName: 'Translúcidas XL', productNames: ['Indian autumn translucido XL'], yield: 2, isTranslucent: true },
    { groupName: 'Metálicos', productNames: ['Corten Steel', 'Mural blue patina with copper', 'Mural white with copper gold', 'Gate turquoise patina copper'], yield: 1.5, isTranslucent: false },
    { groupName: 'Metálicos XL', productNames: ['Corten Steel XL'], yield: 3, isTranslucent: false },
];

export const initialSealantYields = [
    { sealant: 'Sellante semi - brigth 1/ 4 galon', standardYield: 18, clayYield: 10 },
    { sealant: 'Sellante shyny 1/4 galon', standardYield: 18, clayYield: 10 },
];

export const initialStarwoodYields = {
    clipsPerSqM: 17,
    sleeperLinearMetersPerSqM: 3.3,
    listonsPerAdhesive: 4,
    listonsPerSealant: 12,
};
