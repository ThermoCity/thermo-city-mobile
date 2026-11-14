import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { SupportPoint } from '../interfaces/interfaces';
import { getPlaceBadgeConfig } from '../utils/placeUtils';

type AppTheme = typeof THEMES.light;

interface SupportPointModalProps {
  point: SupportPoint | null;
  theme: AppTheme;
  isDarkMode: boolean;
  onClose: () => void;
  onOpenMaps: (point: SupportPoint) => void;
}

export default function SupportPointModal({
  point,
  theme,
  isDarkMode,
  onClose,
  onOpenMaps,
}: SupportPointModalProps) {
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';
  const badge = point ? getPlaceBadgeConfig(point.type, isDarkMode) : null;

  return (
    <Modal
      visible={Boolean(point)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.cardBorder }]} />

          {point && badge && (
            <>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
                <Text style={[styles.modalStatus, { color: theme.textSecondary }]}>
                  {point.status} · {point.distanceKm.toFixed(1).replace('.', ',')} km
                </Text>
              </View>

              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {point.name}
              </Text>
              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                {point.address}
              </Text>

              <View style={[styles.modalInfoBox, { backgroundColor: softSurface }]}>
                <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                  Horário de funcionamento
                </Text>
                <Text style={[styles.modalInfoValue, { color: theme.textPrimary }]}>
                  {point.hours}
                </Text>

                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: theme.textSecondary, marginTop: 12 },
                  ]}
                >
                  Estrutura disponível
                </Text>
                <Text style={[styles.modalInfoValue, { color: theme.textPrimary }]}>
                  {point.features}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => onOpenMaps(point)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionText}>Traçar rota no mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                  Fechar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 26, 32, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  modalStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInfoBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  modalInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  primaryActionBtn: {
    backgroundColor: BRAND_COLORS.laranjaSol,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryActionText: {
    color: BRAND_COLORS.branco,
    fontSize: 15,
    fontWeight: '700',
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});