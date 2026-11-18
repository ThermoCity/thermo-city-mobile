import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThermoLogo from '../components/ThermoLogo';
import VulnerablePersonCard from '../components/VulnerablePersonCard';
import VulnerabilityGuidanceScreen from './AgentCitizenGuidanceScreen';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { HEAT_LEVELS } from '../utils/thermoCityUtils';
import { HeatAlertResponse } from '../interfaces/interfaces';
import { shadow } from '../theme/shadowTheme';
import { useAuth } from '../context/AuthProvider';
import {
  logoutService,
  getAgentPriorityListService,
  registerAgentContactStatusService,
  getAgentContactStatusListService,
} from '../services/javaThermoCityService';
import { getHeatAlertsService } from '../services/.netThermoCityService';
import ChangeThemeBtn from '../components/ThemeToggleButton';

type Filter = 'todos' | 'pendente' | 'contatado';

interface ActionOption {
  label: string;
  resultado: 'CONTATADO_BEM' | 'PRECISA_AJUDA';
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'contatado', label: 'Concluídos' },
];

const getHeatLevelConfig = (nivel?: number) => {
  const key = `NC${nivel || 1}` as keyof typeof HEAT_LEVELS;
  return HEAT_LEVELS[key] || HEAT_LEVELS.NC1;
};

const formatUpdateTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function AgentHomeScreen() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [selectedGuidancePerson, setSelectedGuidancePerson] = useState<any | null>(null);
  const [filter, setFilter] = useState<Filter>('todos');

  const [alertData, setAlertData] = useState<HeatAlertResponse | null>(null);
  const [isLoadingAlert, setIsLoadingAlert] = useState<boolean>(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(true);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';
  const cardShadow = shadow(isDarkMode);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    let isMounted = true;

    async function loadAgentDashboard() {
      const [alertsResult, priorityListResult, contactHistoryResult] = await Promise.allSettled([
        getHeatAlertsService(),
        getAgentPriorityListService(),
        getAgentContactStatusListService(0, 100),
      ]);

      if (!isMounted) return;

      if (alertsResult.status === 'fulfilled') {
        setAlertData(alertsResult.value);
      } else {
        console.error('Falha ao carregar boletim climático (Agente):', alertsResult.reason);
      }
      setIsLoadingAlert(false);

      if (priorityListResult.status === 'fulfilled') {
        const baseContacts = priorityListResult.value.contacts || [];
        const historyItems =
          contactHistoryResult.status === 'fulfilled' &&
          Array.isArray(contactHistoryResult.value?.conteudo)
            ? contactHistoryResult.value.conteudo
            : [];

        const latestByPessoaId = new Map<number, any>();
        historyItems.forEach((registro: any) => {
          if (registro.pessoaId && !latestByPessoaId.has(Number(registro.pessoaId))) {
            latestByPessoaId.set(Number(registro.pessoaId), registro);
          }
        });

        const mergedContacts = baseContacts.map((person: any) => {
          const registro = latestByPessoaId.get(Number(person.pessoaId));
          if (registro) {
            return {
              ...person,
              status: 'contatado',
              lastAction: registro.observacao || registro.resultadoDescricao || person.lastAction,
              resultado: registro.resultado,
            };
          }
          return person;
        });

        setContacts(mergedContacts);
      } else {
        console.error('Falha ao carregar lista prioritária:', priorityListResult.reason);
      }
      setIsLoadingContacts(false);
    }

    loadAgentDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentAlert = useMemo(
    () => getHeatLevelConfig(alertData?.hoje?.nivel),
    [alertData?.hoje?.nivel]
  );

  const displayTemp = useMemo(() => {
    if (alertData?.hoje?.icMaxC === undefined || alertData?.hoje?.icMaxC === null) {
      return '--';
    }
    return Math.round(alertData.hoje.icMaxC);
  }, [alertData?.hoje?.icMaxC]);

  const handleLogout = async () => {
    Alert.alert('Sair da conta', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutService();
            if (logout) {
              await logout();
            }
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
          }
        },
      },
    ]);
  };

  const handleConfirmAction = async (option: ActionOption) => {
    if (!selectedPerson || isSubmittingAction) return;

    if (!selectedPerson.pessoaId) {
      Alert.alert('Erro', 'Identificador do cidadão (pessoaId) não encontrado.');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const savedRecord = await registerAgentContactStatusService({
        pessoaId: selectedPerson.pessoaId,
        resultado: option.resultado,
        observacao: option.label,
      });

      setContacts((prev) =>
        prev.map((item) =>
          item.id === selectedPerson.id
            ? {
                ...item,
                status: 'contatado',
                lastAction: savedRecord?.observacao || option.label,
                resultado: savedRecord?.resultado || option.resultado,
              }
            : item
        )
      );
      setSelectedPerson(null);
    } catch (error: any) {
      Alert.alert(
        'Erro ao registrar contato',
        error?.message || 'Não foi possível salvar o status do atendimento.'
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const pendingCount = useMemo(
    () => contacts.filter((c) => c.status === 'pendente').length,
    [contacts]
  );

  const doneCount = useMemo(
    () => contacts.filter((c) => c.status === 'contatado').length,
    [contacts]
  );

  const visibleContacts = useMemo(() => {
    const list =
      filter === 'todos' ? contacts : contacts.filter((c) => c.status === filter);
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1;
      return (a.posicao || 999) - (b.posicao || 999);
    });
  }, [contacts, filter]);

  const dynamicActionOptions: ActionOption[] = useMemo(() => {
    const shelterLabel = selectedPerson?.nearestShelter
      ? `Encaminhado para ${selectedPerson.nearestShelter}`
      : 'Encaminhado ao refúgio climatizado mais próximo';

    return [
      {
        label: 'Ligação de monitoramento realizada - cidadão bem e hidratado',
        resultado: 'CONTATADO_BEM',
      },
      {
        label: 'Visita domiciliária já agendada',
        resultado: 'CONTATADO_BEM',
      },
      {
        label: shelterLabel,
        resultado: 'PRECISA_AJUDA',
      },
      {
        label: 'Acionada equipe de remoção médica / UBS',
        resultado: 'PRECISA_AJUDA',
      },
    ];
  }, [selectedPerson]);

  if (selectedGuidancePerson) {
    return (
      <VulnerabilityGuidanceScreen
        person={selectedGuidancePerson}
        isDarkMode={isDarkMode}
        onBack={() => setSelectedGuidancePerson(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.navHeader }]}>
      <StatusBar barStyle="light-content" />

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
              <ChangeThemeBtn isDarkMode={isDarkMode} onPress={toggleTheme} />
              <TouchableOpacity
                style={[styles.iconBtn, styles.logoutBtn]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingAlert ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator size="large" color={BRAND_COLORS.laranjaSol} />
              <Text style={styles.heroLoadingText}>Atualizando boletim térmico...</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroMain}>
                <View style={styles.tempBlock}>
                  <Text style={styles.tempValue}>{displayTemp}</Text>
                  <Text style={styles.tempUnit}>°C</Text>
                </View>

                <View style={styles.heroRight}>
                  <View style={[styles.ncBadge, { backgroundColor: currentAlert.color }]}>
                    <Text style={[styles.ncBadgeText, { color: currentAlert.textColor }]}>
                      {currentAlert.code} • {alertData?.hoje?.nome || currentAlert.label}
                    </Text>
                  </View>
                  <Text style={styles.feelsLike}>
                    {alertData?.criterio || 'Monitoramento ativo'}
                  </Text>
                  <Text style={styles.humidity}>
                    Índice de Calor ({alertData?.hoje?.icMaxC?.toFixed(1) ?? '--'}°C)
                  </Text>
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
                Boletim oficial INMET · atualizado às {formatUpdateTime(alertData?.atualizadoEm)}
                {alertData?.desatualizado ? ' (dados em atualização)' : ''}
              </Text>
            </>
          )}
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
            <View style={[styles.protocolAccent, { backgroundColor: currentAlert.color }]} />
            <View style={styles.protocolBody}>
              <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>
                Protocolo ativo ({currentAlert.code} · {alertData?.hoje?.nome || currentAlert.label})
              </Text>
              <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                {alertData?.acaoEsperada ||
                  'Priorizar visita ou contato telefônico a idosos acamados e grávidas nos setores em alerta. Orientar hidratação e encaminhar para refúgios climatizados.'}
              </Text>
            </View>
          </View>

          {/* KPIs Dinâmicos */}
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
                Contatos{'\n'}pendentes
              </Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: '#2E7D32' }]}>{doneCount}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
                Contatos{'\n'}concluídos
              </Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
                {contacts.length}
              </Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
                Total na{'\n'}lista UBS
              </Text>
            </View>
          </View>

          {/* Lista */}
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.textPrimary }]}>
              Contatos prioritários
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

          {isLoadingContacts ? (
            <View style={styles.contactsLoader}>
              <ActivityIndicator size="small" color={BRAND_COLORS.laranjaSol} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Carregando lista prioritária da unidade...
              </Text>
            </View>
          ) : visibleContacts.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum contato nesta lista.
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
                onPressCard={setSelectedGuidancePerson}
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
        onRequestClose={() => {
          if (!isSubmittingAction) setSelectedPerson(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !isSubmittingAction && setSelectedPerson(null)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: theme.cardBorder }]} />

            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Registrar ação de cuidado
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {selectedPerson?.name}
            </Text>

            {isSubmittingAction ? (
              <View style={styles.submittingBox}>
                <ActivityIndicator size="small" color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.modalSub, { color: theme.textSecondary, marginBottom: 0 }]}>
                  Registrando atendimento...
                </Text>
              </View>
            ) : (
              dynamicActionOptions.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.modalOption, { backgroundColor: softSurface }]}
                  onPress={() => handleConfirmAction(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.modalChevron, { color: theme.textSecondary }]}>›</Text>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              disabled={isSubmittingAction}
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
  heroLoading: {
    paddingVertical: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heroLoadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
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
    flex: 1,
    paddingLeft: 12,
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
    textAlign: 'right',
  },
  humidity: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
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
  contactsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
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
  submittingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 32,
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