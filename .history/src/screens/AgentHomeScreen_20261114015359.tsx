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
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { UserProfile } from './AuthScreen';

interface VulnerablePerson {
  id: string;
  name: string;
  sector: string;
  heatLevel: 'NC1' | 'NC2' | 'NC3' | 'NC4' | 'NC5';
  reason: string;
  status: 'pendente' | 'contatado';
  lastAction?: string;
}

interface AgentHomeScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

type Filter = 'todos' | 'pendente' | 'contatado';

const INITIAL_VULNERABLE_LIST: VulnerablePerson[] = [
  {
    id: '1',
    name: 'Dona Helena Costa, 78 anos',
    sector: 'Setor Leste • Rua das Acácias, 142',
    heatLevel: 'NC4',
    reason: 'Idosa acamada + hipertensão + setor sem arborização',
    status: 'pendente',
  },
  {
    id: '2',
    name: 'Sr. António Ferreira, 82 anos',
    sector: 'Setor Leste • Av. Brasil, 890',
    heatLevel: 'NC4',
    reason: 'Mora sozinho + insuficiência cardíaca',
    status: 'pendente',
  },
  {
    id: '3',
    name: 'Júlia Mendes (Grávida)',
    sector: 'Setor Centro-Sul • Rua Rio Branco, 55',
    heatLevel: 'NC3',
    reason: 'Gravidez de risco + exposição térmica residencial',
    status: 'contatado',
  },
];

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

  const pendingCount = contacts.filter((c) => c.status === 'pendente').length;

  const visibleContacts = useMemo(() => {
    const list =
      filter === 'todos' ? contacts : contacts.filter((c) => c.status === filter);
    // Pendentes primeiro, depois maior nível de calor
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
          {/* Protocolo (sobrepõe o hero) */}
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
                Protocolo ativo para a equipa local
              </Text>
              <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                Priorizar visita ou contacto telefónico a idosos acamados e grávidas nos
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
              Contactos prioritários
            </Text>
            <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
              Ordenados por risco térmico e vulnerabilidade
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

          {visibleContacts.length === 0 && (
            <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum contacto nesta lista.
              </Text>
            </View>
          )}

          {visibleContacts.map((person) => {
            const levelInfo = HEAT_LEVELS[person.heatLevel];
            const isDone = person.status === 'contatado';

            return (
              <View
                key={person.id}
                style={[
                  styles.personCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  cardShadow,
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
                          ? person.lastAction || 'Contacto registado'
                          : 'Aguardando ação'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        isDone && [styles.actionBtnSecondary, { borderColor: theme.cardBorder }],
                      ]}
                      onPress={() => setSelectedPerson(person)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          isDone && { color: theme.textSecondary },
                        ]}
                      >
                        {isDone ? 'Atualizar' : 'Registar contacto'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
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

  /* Cartão de pessoa */
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