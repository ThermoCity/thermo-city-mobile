// DADOS MOCKADOS PARA DESENVOLVIMENTO

export interface VulnerablePerson {
  id: string;
  name: string;
  sector: string;
  heatLevel: 'NC1' | 'NC2' | 'NC3' | 'NC4' | 'NC5';
  reason: string;
  status: 'pendente' | 'contatado';
  lastAction?: string;
}


export type PlaceType = 'refugio' | 'ubs';
export type PlaceFilter = 'todos' | PlaceType;
export interface SupportPoint {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  distanceKm: number;
  hours: string;
  status: 'Aberto' | 'Lotação Alta' | 'Fechado';
  features: string;
  latitude: number;
  longitude: number;
}

export type TipCategory = 'todas' | 'hidratacao' | 'protecao' | 'sintomas';

export interface HeatTip {
  id: string;
  category: Exclude<TipCategory, 'todas'>;
  categoryLabel: string;
  tag: string;
  title: string;
  description: string;
}

export interface NCDescription {
  code: string;
  range: string;
  summary: string;
  recommendation: string;
}