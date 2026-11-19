import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { BRAND_COLORS } from '../theme/thermoTheme';
import { SupportPoint } from '../interfaces/interfaces';
import { getPlaceBadgeConfig } from '../utils/placeUtils';

interface SupportPointsMapMobileProps {
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

export default function SupportPointsMapMobile({
  userLocation,
  points,
  theme,
  isDarkMode,
  cardShadow,
  onSelectPoint,
}: SupportPointsMapMobileProps) {
  return (
    <View
      style={[
        styles.mapCard,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        cardShadow,
      ]}
    >
      <MapView
        style={styles.map}
        initialRegion={userLocation}
        showsUserLocation
        showsMyLocationButton
      >
        <Circle
          center={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          radius={2000}
          strokeColor="rgba(255, 107, 53, 0.35)"
          fillColor="rgba(255, 107, 53, 0.08)"
        />

        {points.map((point) => {
          const badge = getPlaceBadgeConfig(point.type, isDarkMode);
          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.name}
              description={`${point.distanceKm} km · ${point.address}`}
              pinColor={badge.pin}
              onPress={() => onSelectPoint(point)}
            />
          );
        })}
      </MapView>

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
  map: {
    width: '100%',
    height: 260,
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