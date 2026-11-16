import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { HeatTip } from '../interfaces/interfaces';
import { shadow } from '../theme/shadowTheme';

type AppTheme = typeof THEMES.light;

interface HeatTipCardProps {
  tip: HeatTip;
  theme: AppTheme;
  isDarkMode: boolean;
}

export default function HeatTipCard({ tip, theme, isDarkMode }: HeatTipCardProps) {
  const isWarning = tip.category === 'sintomas';
  
  const badgeBg = isWarning
    ? isDarkMode
      ? 'rgba(255, 107, 53, 0.2)'
      : '#FFF0E8'
    : isDarkMode
    ? 'rgba(0, 168, 150, 0.2)'
    : '#E0F5F2';

  const badgeText = isWarning
    ? BRAND_COLORS.laranjaSol
    : isDarkMode
    ? '#4FD1C5'
    : '#007A6E';

  return (
    <View
      style={[
        styles.tipCard,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        shadow(isDarkMode),
      ]}
    >
      <View style={styles.tipCardTop}>
        <View style={[styles.categoryBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.categoryBadgeText, { color: badgeText }]}>
            {tip.categoryLabel}
          </Text>
        </View>
        <Text style={[styles.tipTagText, { color: theme.textSecondary }]}>
          {tip.tag}
        </Text>
      </View>

      <Text style={[styles.tipTitle, { color: theme.textPrimary }]}>
        {tip.title}
      </Text>
      <Text style={[styles.tipDescription, { color: theme.textSecondary }]}>
        {tip.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  tipCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tipTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
});