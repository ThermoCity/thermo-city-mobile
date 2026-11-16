import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEMES } from '../theme/thermoTheme';
import { NCDescription } from '../interfaces/interfaces';
import { shadow } from '../theme/shadowTheme';

type AppTheme = typeof THEMES.light;

interface LevelItem {
  code: string;
  label: string;
  color: string;
  textColor: string;
}

interface HeatLevelCardProps {
  level: LevelItem;
  details?: NCDescription;
  isCurrent: boolean;
  theme: AppTheme;
  isDarkMode: boolean;
}

export default function HeatLevelCard({
  level,
  details,
  isCurrent,
  theme,
  isDarkMode,
}: HeatLevelCardProps) {
  const cardShadow = shadow(isDarkMode);
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';

  return (
    <View
      style={[
        styles.ncCard,
        {
          backgroundColor: theme.card,
          borderColor: isCurrent ? level.color : theme.cardBorder,
          borderWidth: isCurrent ? 1.5 : StyleSheet.hairlineWidth,
        },
        cardShadow,
      ]}
    >
      <View style={styles.ncCardHeader}>
        <View style={styles.ncHeaderLeft}>
          <View style={[styles.ncPill, { backgroundColor: level.color }]}>
            <Text style={[styles.ncPillText, { color: level.textColor }]}>
              {level.code} • {level.label}
            </Text>
          </View>
          {isCurrent && (
            <View style={[styles.activeTag, { backgroundColor: softSurface }]}>
              <Text style={[styles.activeTagText, { color: theme.textPrimary }]}>
                Atual
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.ncRangeText, { color: theme.textSecondary }]}>
          {details?.range}
        </Text>
      </View>

      <Text style={[styles.ncSummaryText, { color: theme.textPrimary }]}>
        {details?.summary}
      </Text>

      <View style={[styles.ncActionBox, { backgroundColor: softSurface }]}>
        <Text style={[styles.ncActionText, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
            Recomendação:{' '}
          </Text>
          {details?.recommendation}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ncCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  ncCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  ncHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ncPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ncPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ncRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ncSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 10,
  },
  ncActionBox: {
    padding: 12,
    borderRadius: 12,
  },
  ncActionText: {
    fontSize: 12,
    lineHeight: 18,
  },
});