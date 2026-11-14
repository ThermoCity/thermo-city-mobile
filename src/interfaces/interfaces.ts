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