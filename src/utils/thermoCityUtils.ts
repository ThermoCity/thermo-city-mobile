import { HeatTip, NCDescription, SupportPoint, VulnerablePerson } from "../interfaces/interfaces";

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

export const SUPPORT_POINTS: SupportPoint[] = [
  {
    id: '1',
    name: 'Refúgio Comunitário Leste',
    type: 'refugio',
    address: 'Av. Brasil, 1420 - Centro',
    distanceKm: 0.8,
    hours: '08:00 às 20:00',
    status: 'Aberto',
    features: 'Ambiente climatizado · Água gelada · Área de descanso',
    latitude: -22.1215,
    longitude: -51.3842,
  },
  {
    id: '2',
    name: 'UBS Cohab Central',
    type: 'ubs',
    address: 'Rua Rui Barbosa, 890 - Vila Nova',
    distanceKm: 1.2,
    hours: '07:00 às 19:00',
    status: 'Aberto',
    features: 'Atendimento médico · Reidratação oral · Triagem térmica',
    latitude: -22.1298,
    longitude: -51.3935,
  },
  {
    id: '3',
    name: 'Centro Cultural Matarazzo (Refúgio)',
    type: 'refugio',
    address: 'Rua Quintino Bocaiúva, 749 - Vila Marcondes',
    distanceKm: 1.9,
    hours: '09:00 às 21:00',
    status: 'Aberto',
    features: 'Salas climatizadas · Bebedouros · Acessibilidade total',
    latitude: -22.1182,
    longitude: -51.3951,
  },
  {
    id: '4',
    name: 'UBS Jardim Santana',
    type: 'ubs',
    address: 'Rua José Claro, 412 - Jardim Santana',
    distanceKm: 2.4,
    hours: '07:00 às 17:00',
    status: 'Lotação Alta',
    features: 'Pronto atendimento · Suporte para grupos de risco',
    latitude: -22.1331,
    longitude: -51.3818,
  },
];

export const NC_DETAILS: Record<string, NCDescription> = {
  NC1: {
    code: 'NC1',
    range: 'Abaixo de 32°C',
    summary: 'Condição térmica dentro da normalidade climática da região.',
    recommendation: 'Mantenha hábitos regulares de hidratação ao longo do dia.',
  },
  NC2: {
    code: 'NC2',
    range: '32°C a 34°C',
    summary: 'Elevação gradual de temperatura com desconforto leve no período da tarde.',
    recommendation: 'Reforce o consumo de água e use protetor solar ao ar livre.',
  },
  NC3: {
    code: 'NC3',
    range: '35°C a 37°C',
    summary: 'Calor intenso por horas consecutivas com risco moderado à saúde.',
    recommendation: 'Evite exercícios físicos entre 10h e 17h e redobre atenção com idosos.',
  },
  NC4: {
    code: 'NC4',
    range: '38°C a 40°C (ou +48h)',
    summary: 'Onda de calor severa com alto risco de desidratação e exaustão térmica.',
    recommendation:
      'Busque locais climatizados, hidrate-se a cada 30 min e utilize os Refúgios Comunitários.',
  },
  NC5: {
    code: 'NC5',
    range: 'Acima de 40°C extremo',
    summary: 'Emergência climática com risco crítico de insolação e agravamento clínico.',
    recommendation:
      'Suspenda atividades externas. Ao menor sintoma de mal-estar, procure imediatamente uma UBS.',
  },
};

export const HEAT_TIPS: HeatTip[] = [
  {
    id: '1',
    category: 'hidratacao',
    categoryLabel: 'HIDRATAÇÃO',
    tag: 'A cada 30 min',
    title: 'Beba água antes mesmo de sentir sede',
    description:
      'A sede já é um sinal inicial de desidratação. Priorize água fresca, água de coco e soro caseiro. Evite bebidas alcoólicas, muito açucaradas ou com excesso de cafeína.',
  },
  {
    id: '2',
    category: 'protecao',
    categoryLabel: 'PROTEÇÃO',
    tag: '10h às 17h',
    title: 'Evite exposição direta ao sol nos horários de pico',
    description:
      'Reduza atividades físicas intensas ao ar livre. Se precisar sair, procure rotas com sombra, use roupas leves de algodão, cores claras, boné e protetor solar.',
  },
  {
    id: '3',
    category: 'protecao',
    categoryLabel: 'AMBIENTE',
    tag: 'Em casa',
    title: 'Mantenha os ambientes ventilados e úmidos',
    description:
      'Feche cortinas e persianas nas janelas que recebem sol direto durante a tarde. Use toalhas úmidas ou bacias com água nos quartos para amenizar o ar seco.',
  },
  {
    id: '4',
    category: 'sintomas',
    categoryLabel: 'SINAL DE ALERTA',
    tag: 'Atenção redobrada',
    title: 'Reconheça os sinais de insolação e exaustão térmica',
    description:
      'Tontura, dor de cabeça forte, náuseas, pele muito quente e seca, confusão mental ou fraqueza exigem resfriamento imediato do corpo e busca por uma UBS ou Refúgio.',
  },
  {
    id: '5',
    category: 'hidratacao',
    categoryLabel: 'GRUPOS DE RISCO',
    tag: 'Cuidado ativo',
    title: 'Ofereça líquidos regularmente a idosos, crianças e pets',
    description:
      'Idosos e bebês têm menor percepção de sede e desidratam mais rápido. Nunca deixe crianças ou animais dentro de veículos estacionados, mesmo por poucos minutos.',
  },
];

export interface HeatLevelInfo {
  code: 'NC1' | 'NC2' | 'NC3' | 'NC4' | 'NC5';
  label: string;
  color: string;
  textColor: string;
}

export const HEAT_LEVELS: Record<'NC1' | 'NC2' | 'NC3' | 'NC4' | 'NC5', HeatLevelInfo> = {
  NC1: { code: 'NC1', label: 'Muito baixo', color: '#F0D8CA', textColor: '#1D2F36' },
  NC2: { code: 'NC2', label: 'Baixo', color: '#ECB49A', textColor: '#1D2F36' },
  NC3: { code: 'NC3', label: 'Moderado', color: '#E16C42', textColor: '#1D2F36' },
  NC4: { code: 'NC4', label: 'Alto', color: '#B85130', textColor: '#FFFFFF' },
  NC5: { code: 'NC5', label: 'Muito alto', color: '#853922', textColor: '#FFFFFF' },
};