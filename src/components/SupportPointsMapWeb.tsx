import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BRAND_COLORS } from '../theme/thermoTheme';
import { SupportPoint } from '../interfaces/interfaces';

interface SupportPointsMapWebProps {
  userLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  points: SupportPoint[];
  theme: any;
  isDarkMode: boolean;
  cardShadow: any;
  onSelectPoint: (point: SupportPoint) => void;
}

export default function SupportPointsMapWeb({
  userLocation,
  points,
  theme,
  cardShadow,
  onSelectPoint,
}: SupportPointsMapWebProps) {
  const [focusedPoint, setFocusedPoint] = useState<SupportPoint | null>(null);

  const activeLat = focusedPoint ? focusedPoint.latitude : userLocation.latitude;
  const activeLng = focusedPoint ? focusedPoint.longitude : userLocation.longitude;
  const zoom = focusedPoint ? 16 : 14;

  const mapUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&z=${zoom}&output=embed`;

  return (
    <View
      style={[
        styles.mapCard,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        cardShadow,
      ]}
    >
      <View style={styles.iframeContainer}>
        <iframe
          title="Mapa de Pontos de Apoio"
          src={mapUrl}
          style={{
            width: '100%',
            height: 260,
            border: 0,
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </View>

      {points.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.webPinBar}
          style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.cardBorder }}
        >
          {points.map((point) => {
            const isRefugio = point.type === 'refugio';
            const dotColor = isRefugio ? '#00A896' : BRAND_COLORS.laranjaSol;
            return (
              <TouchableOpacity
                key={point.id}
                style={[styles.webPinChip, { borderColor: theme.cardBorder }]}
                onPress={() => {
                  setFocusedPoint(point);
                  onSelectPoint(point);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.legendDot, { backgroundColor: dotColor }]} />
                <Text style={[styles.webPinText, { color: theme.textPrimary }]} numberOfLines={1}>
                  {point.name} ({point.distanceKm} km)
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.mapLegendBar, { borderTopColor: theme.cardBorder }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00A896' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Refúgio Climatizado
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND_COLORS.laranjaSol }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Unidade Básica (UBS)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 16,
  },
  iframeContainer: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
  },
  webPinBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  webPinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  webPinText: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 190,
  },
  mapLegendBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});