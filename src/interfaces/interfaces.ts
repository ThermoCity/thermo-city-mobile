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