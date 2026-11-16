import { BRAND_COLORS } from '../theme/thermoTheme';
import { PlaceType } from '../interfaces/interfaces';

// UTILITARIO PARA ALTERAR A COR DOS CARDS DE UBS E REFUGIO DE ACORDO COM O TEMA SELECIONADO 

export const getPlaceBadgeConfig = (type: PlaceType, isDarkMode: boolean) => {
  if (type === 'refugio') {
    return {
      bg: isDarkMode ? 'rgba(0, 168, 150, 0.2)' : '#E0F5F2',
      text: isDarkMode ? '#4FD1C5' : '#007A6E',
      pin: '#00A896',
      label: 'REFÚGIO',
    };
  }

  return {
    bg: isDarkMode ? 'rgba(255, 107, 53, 0.2)' : '#FFF0E8',
    text: BRAND_COLORS.laranjaSol,
    pin: BRAND_COLORS.laranjaSol,
    label: 'UBS',
  };
};