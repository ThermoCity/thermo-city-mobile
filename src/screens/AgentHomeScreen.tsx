import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThermoLogo from '../components/ThermoLogo';
import VulnerablePersonCard from '../components/VulnerablePersonCard';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { UserProfile } from './Login';
import { INITIAL_VULNERABLE_LIST } from '../data/mockData';
import { VulnerablePerson } from '../interfaces/interfaces';


interface AgentHomeScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

type Filter = 'todos' | 'pendente' | 'contatado';

const ACTION_OPTIONS = [
  'Ligação de monitoramento realizada',
  'Visita domiciliária agendada',
  'Encaminhado ao Refúgio Comunitário Leste',
  'Acionada equipa de remoção médica',
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'contatado', label: 'Concluídos' },
];

const shadow = (isDark: boolean) =>
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

export default function AgentHomeScreen({ user, onLogout }: AgentHomeScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [contacts, setContacts] = useState<VulnerablePerson[]>(INITIAL_VULNERABLE_LIST);
  const [selectedPerson, setSelectedPerson] = useState<VulnerablePerson | null>(null);
  const [filter, setFilter] = useState<Filter>('todos');

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const currentAlert = HEAT_LEVELS.NC4;
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';
  const cardShadow = shadow(isDarkMode);

  const handleConfirmAction = (actionLabel: string) => {
    if (!selectedPerson) return;
    setContacts((prev) =>
      prev.map((item) =>
        item.id === selectedPerson.id
          ? { ...item, status: 'contatado', lastAction: actionLabel }
          : item
      )
    );
    setSelectedPerson(null);
  };

  const pendingCount = useMemo(
    () => contacts.filter((c) => c.status === 'pendente').length,
    [contacts]
  );

  const visibleContacts = useMemo(() => {
    const list =
      filter === 'todos' ? contacts : contacts.filter((c) => c.status === filter);
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1;
      return b.heatLevel.localeCompare(a.heatLevel);
    });
  }, [contacts, filter]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.navHeader }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.navHeader} />

      <ScrollView
        style={[styles.body, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ───────── HERO ───────── */}
        <View style={[styles.hero, { backgroundColor: theme.navHeader }]}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <ThermoLogo variant="dark" showText={false} size={30} />
              <View style={styles.topBarTitleBox}>
                <Text style={styles.cityLabel}>Presidente Prudente</Text>
                <Text style={styles.agentSubLabel} numberOfLines={1}>
                  {user?.name || 'Agente de Saúde'}
                </Text>
              </View>
            </View>

            <View style={styles.topBarActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsDarkMode(!isDarkMode)}
                accessibilityLabel={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>{isDarkMode ? '☀' : '☾'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.logoutBtn]}
                onPress={onLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroMain}>
            <View style={styles.tempBlock}>
              <Text style={styles.tempValue}>38</Text>
              <Text style={styles.tempUnit}>°C</Text>
            </View>

            <View style={styles.heroRight}>
              <View style={[styles.ncBadge, { backgroundColor: currentAlert.color }]}>
                <Text style={[styles.ncBadgeText, { color: currentAlert.textColor }]}>
                  {currentAlert.code} • {currentAlert.label}
                </Text>
              </View>
              <Text style={styles.feelsLike}>Sensação de 41°C</Text>
              <Text style={styles.humidity}>Humidade 24%</Text>
            </View>
          </View>

          <View style={styles.scaleContainer}>
            {Object.values(HEAT_LEVELS).map((level) => {
              const isCurrent = level.code === currentAlert.code;
              return (
                <View
                  key={level.code}
                  style={[
                    styles.scaleStep,
                    { backgroundColor: level.color },
                    isCurrent ? styles.scaleStepActive : styles.scaleStepIdle,
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.scaleLegendRow}>
            <Text style={styles.scaleLegendText}>NC1 Muito baixo</Text>
            <Text style={styles.scaleLegendText}>NC3 Moderado</Text>
            <Text style={styles.scaleLegendText}>NC5 Muito alto</Text>
          </View>

          <Text style={styles.source}>
            Boletim oficial da Defesa Civil e INMET · atualizado às 14:30
          </Text>
        </View>

        {/* ───────── CONTEÚDO ───────── */}
        <View style={styles.content}>
          {/* Protocolo */}
          <View
            style={[
              styles.protocolCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View style={styles.protocolAccent} />
            <View style={styles.protocolBody}>
              <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>
                Protocolo ativo para a equipe local
              </Text>
              <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                Priorizar visita ou contato telefônico a idosos acamados e grávidas nos
                setores em NC4. Orientar hidratação e encaminhar para refúgios climatizados.
              </Text>
            </View>
          </View>

          {/* KPIs */}
          <View
            style={[
              styles.kpiCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: BRAND_COLORS.laranjaSol }]}>
                {pendingCount}
              </Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
                Contactos{'\n'}pendentes
              </Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>3</Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
                Setores{'\n'}em NC3+
              </Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>2</Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
                Refúgios{'\n'}abertos
              </Text>
            </View>
          </View>

          {/* Lista */}
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.textPrimary }]}>
              Contatos prioritários
            </Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
              Ordenados por zona de risco térmico e vulnerabilidade
            </Text>
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    active
                      ? { backgroundColor: BRAND_COLORS.azulEscuro, borderColor: BRAND_COLORS.azulEscuro }
                      : { backgroundColor: 'transparent', borderColor: theme.cardBorder },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? BRAND_COLORS.branco : theme.textSecondary },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {visibleContacts.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum contacto nesta lista.
              </Text>
            </View>
          ) : (
            visibleContacts.map((person) => (
              <VulnerablePersonCard
                key={person.id}
                person={person}
                theme={theme}
                isDarkMode={isDarkMode}
                onActionPress={setSelectedPerson}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ───────── BOTTOM SHEET ───────── */}
      <Modal
        visible={Boolean(selectedPerson)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPerson(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedPerson(null)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: theme.cardBorder }]} />

            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Registar ação de cuidado
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {selectedPerson?.name}
            </Text>

            {ACTION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, { backgroundColor: softSurface }]}
                onPress={() => handleConfirmAction(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                  {option}
                </Text>
                <Text style={[styles.modalChevron, { color: theme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSelectedPerson(null)}
            >
              <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 40,
  },

  /* Hero */
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topBarTitleBox: {
    marginLeft: 12,
    flex: 1,
  },
  cityLabel: {
    color: BRAND_COLORS.branco,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  agentSubLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    height: 36,
    minWidth: 36,
    borderRadius: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnText: {
    color: BRAND_COLORS.branco,
    fontSize: 16,
  },
  logoutBtn: {
    paddingHorizontal: 14,
  },
  logoutText: {
    color: BRAND_COLORS.branco,
    fontSize: 12,
    fontWeight: '600',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  tempBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempValue: {
    fontSize: 84,
    lineHeight: 88,
    fontWeight: '200',
    color: BRAND_COLORS.branco,
    letterSpacing: -3,
  },
  tempUnit: {
    fontSize: 26,
    fontWeight: '300',
    color: BRAND_COLORS.laranjaSol,
    marginTop: 12,
    marginLeft: 2,
  },
  heroRight: {
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  ncBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 10,
  },
  ncBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  feelsLike: {
    color: BRAND_COLORS.branco,
    fontSize: 14,
    fontWeight: '600',
  },
  humidity: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  scaleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 26,
  },
  scaleStep: {
    flex: 1,
    borderRadius: 999,
  },
  scaleStepIdle: {
    height: 6,
    opacity: 0.45,
  },
  scaleStepActive: {
    flex: 1.5,
    height: 12,
    borderWidth: 2,
    borderColor: BRAND_COLORS.branco,
  },
  scaleLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLegendText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
  },
  source: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 18,
  },

  /* Conteúdo */
  content: {
    paddingHorizontal: 16,
    marginTop: -34,
  },
  protocolCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 14,
  },
  protocolAccent: {
    width: 5,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  protocolBody: {
    flex: 1,
    padding: 16,
  },
  protocolTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  protocolDesc: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* KPIs */
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    marginBottom: 26,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  kpiLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },

  /* Lista */
  listHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },

  /* Bottom sheet */
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
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingRight: 8,
  },
  modalChevron: {
    fontSize: 22,
    lineHeight: 22,
  },
  modalCancel: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});