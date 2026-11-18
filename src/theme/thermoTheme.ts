export const BRAND_COLORS = {
  azulEscuro: '#1D2F36',
  laranjaSol: '#E16C42',
  offWhite: '#F5F0E6',
  branco: '#FFFFFF',
} as const;


export interface ThemeToggles {
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

export const THEMES: Record<'light' | 'dark', ThemeToggles> = {
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
    accentActionText: '#1D2F36',
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