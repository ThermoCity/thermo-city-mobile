import { VulnerablePerson } from "../interfaces/interfaces";

export const INITIAL_VULNERABLE_LIST: VulnerablePerson[] = [
  {
    id: '1',
    name: 'Dona Helena Costa, 78 anos',
    sector: 'Setor Leste • Rua das Acácias, 142',
    heatLevel: 'NC4',
    reason: 'Idosa acamada + hipertensão + setor sem arborização',
    status: 'pendente',
  },
  {
    id: '2',
    name: 'Sr. António Ferreira, 82 anos',
    sector: 'Setor Leste • Av. Brasil, 890',
    heatLevel: 'NC4',
    reason: 'Mora sozinho + insuficiência cardíaca',
    status: 'pendente',
  },
  {
    id: '3',
    name: 'Júlia Mendes (Grávida)',
    sector: 'Setor Centro-Sul • Rua Rio Branco, 55',
    heatLevel: 'NC3',
    reason: 'Gravidez de risco + exposição térmica residencial',
    status: 'contatado',
  },
];