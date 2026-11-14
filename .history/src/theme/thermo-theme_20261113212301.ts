export const BRAND_COLORS = {
  azulEscuro: '#1D2F36',
  laranjaSol: '#E16C42',
  offWhite: '#F5F0E6',
  branco: '#FFFFFF',
} as const;

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

export interface ThemeTokens {
  mode: 'light' | 'dark';
  background: string;
  card: string;
  cardBorder: string;
  navHeader: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  inputBorder: string;
  primaryActionBg: string;
  primaryActionText: string;
  accentActionBg: string;
  accentActionText: string;
}

export const THEMES: Record<'light' | 'dark', ThemeTokens> = {
  light: {
    mode: 'light',
    background: '#EEF2F4',
    card: '#FFFFFF',
    cardBorder: '#D8E0E5',
    navHeader: '#1D2F36',
    textPrimary: '#1D2F36',
    textSecondary: '#52636B',
    inputBg: '#F8FAFB',
    inputBorder: '#CBD5DB',
    primaryActionBg: '#1D2F36',
    primaryActionText: '#FFFFFF',
    accentActionBg: '#E16C42',
    accentActionText: '#1D2F36', // Contraste definido no Brandbook[cite: 14]
  },
  dark: {
    mode: 'dark',
    background: '#242B30',
    card: '#303B42',
    cardBorder: '#3F4D56',
    navHeader: '#1D2F36',
    textPrimary: '#F7F9FA',
    textSecondary: '#B0BEC5',
    inputBg: '#242B30',
    inputBorder: '#45545E',
    primaryActionBg: '#E16C42',
    primaryActionText: '#1D2F36',
    accentActionBg: '#E16C42',
    accentActionText: '#1D2F36',
  },
};