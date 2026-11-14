import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { SupportPoint } from '../interfaces/interfaces';
import { shadow } from '../theme/shadowTheme';
import { getPlaceBadgeConfig } from '../utils/placeUtils';

type AppTheme = typeof THEMES.light;

interface SupportPointCardProps {
  point: SupportPoint;
  theme: AppTheme;
  isDarkMode: boolean;
  onPress: (point: SupportPoint) => void;
}

export default function SupportPointCard({
  point,
  theme,
  isDarkMode,
  onPress,
}: SupportPointCardProps) {
  const badge = getPlaceBadgeConfig(point.type, isDarkMode);

  return (
    <TouchableOpacity
      style={[
        styles.placeCard,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        shadow(isDarkMode),
      ]}
      onPress={() => onPress(point)}
      activeOpacity={0.75}
    >
      <View style={styles.placeCardTop}>
        <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.typeBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
        <Text style={[styles.distanceText, { color: theme.textPrimary }]}>
          {point.distanceKm.toFixed(1).replace('.', ',')} km
        </Text>
      </View>

      <Text style={[styles.placeName, { color: theme.textPrimary }]}>
        {point.name}
      </Text>
      <Text style={[styles.placeAddress, { color: theme.textSecondary }]}>
        {point.address}
      </Text>

      <View style={[styles.placeFooter, { borderTopColor: theme.cardBorder }]}>
        <Text style={[styles.placeHours, { color: theme.textSecondary }]}>
          Hoje: {point.hours}
        </Text>
        <Text style={[styles.routeLink, { color: BRAND_COLORS.laranjaSol }]}>
          Ver detalhes ›
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  placeCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  placeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
    marginBottom: 12,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  placeHours: {
    fontSize: 12,
  },
  routeLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});