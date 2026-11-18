import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS } from '../theme/thermoTheme';

interface ThemeToggleButtonProps {
  isDarkMode: boolean;
  onPress: () => void;
  
}

export default function ThemeToggleButton({ isDarkMode, onPress }: ThemeToggleButtonProps) {
  return (
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={onPress}
      accessibilityLabel={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      activeOpacity={0.7}
    >
      <Text style={styles.iconBtnText}>{isDarkMode ? '☀' : '☾'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    height: 36,
    minWidth: 36,
    borderRadius: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnText: {
    color: BRAND_COLORS.branco,
    fontSize: 18,
    fontWeight: '600',
  },
});