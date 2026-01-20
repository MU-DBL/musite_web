export const IonEnum = {
  ZINC: "Zinc",
  COPPER: "Copper",
  FERROUS: "Ferrous"
};

export interface ModelOption {
  label: string;
  value: PTMType;
}


export interface MLOption {
  label: string;
  value: string;
}

export interface PTMColorConfig {
  label: string;
  abbreviation: string;
  color: string;
}

// constants.ts - Configuration constants
export enum PTMType {
  // Phosphorylation
  PHOSPHOSERINE_PHOSPHOTHREONINE = "Phosphoserine_Phosphothreonine",
  PHOSPHOTYROSINE = "Phosphotyrosine",

  // Glycosylation
  N_LINKED_GLYCOSYLATION = "N-linked_glycosylation",
  O_LINKED_GLYCOSYLATION = "O-linked_glycosylation",

  // Ubiquitination
  UBIQUITINATION = "Ubiquitination",

  // SUMOylation
  SUMOYLATION = "SUMOylation",

  // Acetylation
  N6_ACETYLLYSINE = "N6-acetyllysine",

  // Methylation
  METHYLARGININE = "Methylarginine",
  METHYLLYSINE = "Methyllysine",

  // Other modifications
  PYRROLIDONE_CARBOXYLIC_ACID = "Pyrrolidone_carboxylic_acid",
  S_PALMITOYL_CYSTEINE = "S-palmitoyl_cysteine",

  // Hydroxylation
  HYDROXYPROLINE = "Hydroxyproline",
  HYDROXYLYSINE = "Hydroxylysine",

  // Ion binding
  ZINC = "Zinc",
  COPPER = "Copper",
  FERROUS = "Ferrous",
  FERRIC = "Ferric"
}

export const ionOptions: PTMType[] = [
  PTMType.ZINC,
  PTMType.COPPER,
  PTMType.FERROUS
];

export const getIonUrl = (): string => {
  if (typeof document !== 'undefined') {
    return `${document.location.protocol}//${document.location.hostname}:5004/ionpred_api`;
  }
  return 'http://localhost:5004/ionpred_api'; // fallback for SSR
};

export const predictMLSelectOptions: ReadonlyArray<MLOption> = [
  {
    label: 'Wang, D., et al. (2020)',
    value: 'Wang, D., et al. (2020)'
  },
  {
    label: 'Essien, C., et al. (2025)',
    value: 'Essien, C., et al. (2025)'
  }
]

export const predictPTMSelectOptions: ReadonlyArray<ModelOption> = [
  {
    label: 'Phosphorylation (S,T)',
    value: PTMType.PHOSPHOSERINE_PHOSPHOTHREONINE
  },
  {
    label: 'Phosphorylation (Y)',
    value: PTMType.PHOSPHOTYROSINE
  },
  {
    label: 'N-linked glycosylation (N)',
    value: PTMType.N_LINKED_GLYCOSYLATION
  },
  {
    label: 'O-linked glycosylation (S,T)',
    value: PTMType.O_LINKED_GLYCOSYLATION
  },
  {
    label: 'Ubiquitination (K)',
    value: PTMType.UBIQUITINATION
  },
  {
    label: 'SUMOylation (K)',
    value: PTMType.SUMOYLATION
  },
  {
    label: 'N6-acetyllysine (K)',
    value: PTMType.N6_ACETYLLYSINE
  },
  {
    label: 'Methylarginine (R)',
    value: PTMType.METHYLARGININE
  },
  {
    label: 'Methyllysine (K)',
    value: PTMType.METHYLLYSINE
  },
  {
    label: 'Pyrrolidone carboxylic acid (Q)',
    value: PTMType.PYRROLIDONE_CARBOXYLIC_ACID
  },
  {
    label: 'S-Palmitoylation (C)',
    value: PTMType.S_PALMITOYL_CYSTEINE
  },
  {
    label: 'Hydroxyproline (P)',
    value: PTMType.HYDROXYPROLINE
  },
  {
    label: 'Hydroxylysine (K)',
    value: PTMType.HYDROXYLYSINE
  },
  {
    label: 'Zinc (C, H, E, D)',
    value: PTMType.ZINC
  },
  {
    label: 'Copper (C, H)',
    value: PTMType.COPPER
  },
  {
    label: 'Ferrous (D, E, H)',
    value: PTMType.FERROUS
  },
] as const;


export const ptmColorConfigs: ReadonlyArray<PTMColorConfig> = [
  { label: 'Phosphorylation', abbreviation: 'P', color: 'Blue' },
  { label: 'Glycosylation', abbreviation: 'gl', color: 'Red' },
  { label: 'Ubiquitination', abbreviation: 'ub', color: 'Gray' },
  { label: 'SUMOylation', abbreviation: 'su', color: 'Olive' },
  { label: 'Acetylation', abbreviation: 'ac', color: 'Orange' },
  { label: 'Methylation', abbreviation: 'me', color: 'Black' },
  { label: 'Pyrrolidone carboxylic acid', abbreviation: 'pc', color: 'Purple' },
  { label: 'Palmitoylation', abbreviation: 'pa', color: 'Maroon' },
  { label: 'Hydroxylation', abbreviation: 'Hy', color: 'Green' },
  { label: 'Zinc', abbreviation: 'z', color: 'Teal' },
  { label: 'Copper', abbreviation: 'c', color: 'Fuchsia' },
  { label: 'Ferrous', abbreviation: 'fe', color: 'Indianred' },
] as const;
