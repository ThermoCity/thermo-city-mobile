import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SupportPoint } from '../interfaces/interfaces';

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

export default function SupportMap({ isDarkMode }: SupportMapProps) {
  return (
    <View
      style={[
        styles.webPlaceholder,
        { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>
        Mapa interativo disponível no App Mobile
      </Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
        Utilize a lista de pontos de apoio abaixo para ver detalhes e traçar rotas no Google Maps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webPlaceholder: {
    width: '100%',
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});