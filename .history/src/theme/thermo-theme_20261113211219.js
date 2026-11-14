// Tokens extraídos do Brandbook ThermoCity (Azul estrutural / Light Mode)

export const colors = {
  blue: '#1D2F36', // Azul Escuro: texto, estrutura, navegação
  orange: '#E16C42', // Laranja Sol: destaque, temperatura, chamadas
  offwhite: '#F5F0E6', // Fundo da assinatura e termômetro
  bg: '#EEF2F4', // Fundo principal (light)
  surface: '#FFFFFF', // Card / superfície elevada
  border: '#D5DDE1',
  textMuted: '#52636B',
  blueSoft: '#2C434D', // variação do azul para superfícies sobre a barra azul
  onBlueMuted: '#B9C6CC',
  error: '#A32D2D',
  success: '#2E7D5B',
};

// Escala visual proposta NC1–NC5 (derivações do Laranja Sol).
// Sempre exibir o código + legenda, nunca só a cor.
export const heatLevels = {
  1: { code: 'NC1', label: 'Muito baixo', bg: '#F0D8CA', fg: '#1D2F36' },
  2: { code: 'NC2', label: 'Baixo', bg: '#ECB49A', fg: '#1D2F36' },
  3: { code: 'NC3', label: 'Moderado', bg: '#E16C42', fg: '#1D2F36' },
  4: { code: 'NC4', label: 'Alto', bg: '#B85130', fg: '#FFFFFF' },
  5: { code: 'NC5', label: 'Muito alto', bg: '#853922', fg: '#FFFFFF' },
};

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Arial é a fonte de apoio da marca; no mobile usamos a fonte nativa do sistema
// (Helvetica/Roboto), visualmente equivalente. O lettering da marca vem do PNG.
export const type = {
  title: { fontSize: 26, fontWeight: '700', color: colors.blue, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.blue },
  body: { fontSize: 15, lineHeight: 22, color: colors.blue },
  small: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
};
