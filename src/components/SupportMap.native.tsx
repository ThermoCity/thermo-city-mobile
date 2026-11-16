import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { SupportPoint } from '../interfaces/interfaces';
import { getPlaceBadgeConfig } from '../utils/placeUtils';

interface SupportMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  points: SupportPoint[];
  isDarkMode: boolean;
  onSelectPoint: (point: SupportPoint) => void;
}

export default function SupportMap({
  userLocation,
  points,
  isDarkMode,
  onSelectPoint,
}: SupportMapProps) {
  return (
    <MapView
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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
            description={`${point.distanceKm} km · ${point.status}`}
            pinColor={badge.pin}
            onPress={() => onSelectPoint(point)}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 260,
  },
});