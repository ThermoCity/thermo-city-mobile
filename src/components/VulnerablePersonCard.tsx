import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Linking } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { shadow } from '../theme/shadowTheme';

type AppTheme = typeof THEMES.light;

interface VulnerablePersonCardProps {
  person: any;
  theme: AppTheme;
  isDarkMode: boolean;
  onActionPress: (person: any) => void;
  onPressCard?: (person: any) => void;
}

const SUCCESS = '#2E9E6B';

const getInitials = (fullName: string) => {
  const base = (fullName || '').split(/[,(]/)[0];
  const words = base
    .split(' ')
    .filter((w) => w && !['Dona', 'Sr.', 'Sra.', 'Dr.', 'Dra.'].includes(w));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const getFirstName = (fullName?: string) =>
  (fullName || '').split(/[,(]/)[0].trim().split(' ')[0];

export default function VulnerablePersonCard({
  person,
  theme,
  isDarkMode,
  onActionPress,
  onPressCard,
}: VulnerablePersonCardProps) {
  const levelInfo =
    HEAT_LEVELS[person.heatLevel as keyof typeof HEAT_LEVELS] || HEAT_LEVELS.NC3;
  const isDone = person.status === 'contatado';
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';

  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`);
  };

  const hasReference = !!(person.referenceName || person.referencePhone);

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        shadow(isDarkMode),
      ]}
      onPress={() => onPressCard && onPressCard(person)}
    >
      <View style={[styles.accent, { backgroundColor: levelInfo.color }]} />

      <View style={styles.inner}>
        {/* ───────── Cabeçalho ───────── */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: `${levelInfo.color}33` }]}>
            <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
              {getInitials(person.name)}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            {person.posicao ? (
              <Text style={[styles.rank, { color: theme.textSecondary }]}>
                Prioridade #{person.posicao}
              </Text>
            ) : null}
            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
              {person.name}
            </Text>
          </View>

          <View style={[styles.levelChip, { backgroundColor: levelInfo.color }]}>
            <Text style={[styles.levelCode, { color: levelInfo.textColor }]}>{levelInfo.code}</Text>
            <Text style={[styles.levelLabel, { color: levelInfo.textColor }]}>{levelInfo.label}</Text>
          </View>
        </View>

        {/* ───────── Motivo + refúgio ───────── */}
        {person.reason ? (
          <Text style={[styles.reason, { color: theme.textSecondary }]} numberOfLines={3}>
            {person.reason}
          </Text>
        ) : null}

        {person.nearestShelter ? (
          <View style={[styles.shelterPill, { backgroundColor: softSurface }]}>
            <FontAwesome6 name="person-shelter" size={13} color={BRAND_COLORS.laranjaSol} />
            <Text style={[styles.shelterText, { color: theme.textPrimary }]} numberOfLines={1}>
              {person.nearestShelter}
            </Text>
          </View>
        ) : null}

        {/* ───────── Contatos ───────── */}
        {(person.phone || hasReference) && (
          <View style={styles.contactsRow}>
            {person.phone ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCall(person.phone);
                }}
                accessibilityLabel={`Ligar para o cidadão ${person.phone}`}
                style={[styles.contactBtn, { borderColor: theme.cardBorder }]}
              >
                <FontAwesome6 name="phone" size={15} color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.contactText, { color: theme.textPrimary }]} numberOfLines={1}>
                  Contato
                </Text>
              </TouchableOpacity>
            ) : null}

            {hasReference ? (
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={!person.referencePhone}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCall(person.referencePhone);
                }}
                accessibilityLabel={`Ligar para ${person.referenceName || 'contato de referência'}`}
                style={[
                  styles.contactBtn,
                  { borderColor: theme.cardBorder },
                  !person.referencePhone && { opacity: 0.5 },
                ]}
              >
                <FontAwesome6 name="person-circle-check" size={15} color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.contactText, { color: theme.textPrimary }]} numberOfLines={1}>
                  {getFirstName(person.referenceName) || 'Referência'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* ───────── Rodapé ───────── */}
        <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
          <View style={styles.statusWrap}>
            <FontAwesome6
              name={isDone ? 'check-circle' : 'clock'}
              size={16}
              color={isDone ? SUCCESS : BRAND_COLORS.laranjaSol}
            />
            <Text
              style={[styles.statusText, { color: isDone ? SUCCESS : BRAND_COLORS.laranjaSol }]}
              numberOfLines={1}
            >
              {isDone ? person.lastAction || 'Contato registrado' : 'Aguardando ação'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isDone && { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.cardBorder },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onActionPress(person);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionBtnText, isDone && { color: theme.textSecondary }]}>
              {isDone ? 'Atualizar' : 'Registrar contato'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 14,
  },
  accent: { width: 4 },
  inner: { flex: 1, padding: 16 },

  /* Cabeçalho */
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  rank: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  levelChip: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 62,
  },
  levelCode: { fontSize: 12, fontWeight: '800' },
  levelLabel: { fontSize: 9, fontWeight: '700', marginTop: 1 },

  /* Motivo + refúgio */
  reason: { fontSize: 13, lineHeight: 19, marginTop: 14 },
  shelterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '100%',
  },
  shelterText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },

  /* Contatos */
  contactsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  contactText: { fontSize: 12, fontWeight: '700', flexShrink: 1 },

  /* Rodapé */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 10 },
  statusText: { flexShrink: 1, fontSize: 12, fontWeight: '700' },
  actionBtn: {
    backgroundColor: BRAND_COLORS.laranjaSol,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionBtnText: { color: BRAND_COLORS.azulEscuro, fontSize: 12, fontWeight: '800' },
});