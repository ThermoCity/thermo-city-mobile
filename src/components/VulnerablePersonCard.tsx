import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { VulnerablePerson } from '../interfaces/interfaces';

type AppTheme = typeof THEMES.light;

interface VulnerablePersonCardProps {
  person: VulnerablePerson;
  theme: AppTheme;
  isDarkMode: boolean;
  onActionPress: (person: VulnerablePerson) => void;
}

const getInitials = (fullName: string) => {
  const base = fullName.split(/[,(]/)[0];
  const words = base
    .split(' ')
    .filter((w) => w && !['Dona', 'Sr.', 'Sra.', 'Dr.', 'Dra.'].includes(w));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const cardShadow = (isDark: boolean) =>
  Platform.select({
    ios: {
      shadowColor: '#0B1A20',
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: isDark ? 0 : 3 },
    default: {},
  });

export default function VulnerablePersonCard({
  person,
  theme,
  isDarkMode,
  onActionPress,
}: VulnerablePersonCardProps) {
  const levelInfo = HEAT_LEVELS[person.heatLevel];
  const isDone = person.status === 'contatado';
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';

  return (
    <View
      style={[
        styles.personCard,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        cardShadow(isDarkMode),
      ]}
    >
      <View style={[styles.personAccent, { backgroundColor: levelInfo.color }]} />

      <View style={styles.personInner}>
        <View style={styles.personTopRow}>
          <View style={[styles.avatar, { backgroundColor: softSurface }]}>
            <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
              {getInitials(person.name)}
            </Text>
          </View>

          <View style={styles.personMainInfo}>
            <Text style={[styles.personName, { color: theme.textPrimary }]}>
              {person.name}
            </Text>
            <Text style={[styles.personSector, { color: theme.textSecondary }]}>
              {person.sector}
            </Text>
          </View>

          <View style={[styles.miniNcTag, { backgroundColor: levelInfo.color }]}>
            <Text style={[styles.miniNcText, { color: levelInfo.textColor }]}>
              {levelInfo.code}
            </Text>
          </View>
        </View>

        <View style={[styles.reasonBox, { backgroundColor: softSurface }]}>
          <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
            {person.reason}
          </Text>
        </View>

        <View style={styles.personFooter}>
          <View style={styles.statusWrap}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isDone ? '#2E7D32' : BRAND_COLORS.laranjaSol },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isDone ? '#2E7D32' : BRAND_COLORS.laranjaSol },
              ]}
              numberOfLines={2}
            >
              {isDone
                ? person.lastAction || 'Contato registrado'
                : 'Aguardando ação'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isDone && [styles.actionBtnSecondary, { borderColor: theme.cardBorder }],
            ]}
            onPress={() => onActionPress(person)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.actionBtnText,
                isDone && { color: theme.textSecondary },
              ]}
            >
              {isDone ? 'Atualizar' : 'Registrar contato'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  personCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 14,
  },
  personAccent: {
    width: 5,
  },
  personInner: {
    flex: 1,
    padding: 16,
  },
  personTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  personMainInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  personSector: {
    fontSize: 12,
    marginTop: 3,
  },
  miniNcTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  miniNcText: {
    fontSize: 11,
    fontWeight: '800',
  },
  reasonBox: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  personFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  actionBtn: {
    backgroundColor: BRAND_COLORS.laranjaSol,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionBtnText: {
    color: BRAND_COLORS.azulEscuro,
    fontSize: 12,
    fontWeight: '800',
  },
});