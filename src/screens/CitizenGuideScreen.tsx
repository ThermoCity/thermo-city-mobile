import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThermoLogo from '../components/ThermoLogo';
import HeatTipCard from '../components/HeatTipCard';
import HeatLevelCard from '../components/HeatLevelCard';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { HEAT_LEVELS } from '../utils/thermoCityUtils';
import { shadow } from '../theme/shadowTheme';
import { TipCategory, HeatTip, HeatAlertResponse } from '../interfaces/interfaces';
import { HEAT_TIPS, NC_DETAILS } from '../utils/thermoCityUtils';
import { getHeatAlertsService } from '../services/.netThermoCityService';

interface CitizenGuideScreenProps {
  onBack?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const TIP_FILTERS: { key: TipCategory; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'hidratacao', label: 'Hidratação' },
  { key: 'protecao', label: 'Proteção' },
  { key: 'sintomas', label: 'Sinais de Alerta' },
];

// Mapeia o número do nível (1..5) da API .NET para o objeto visual de HEAT_LEVELS
const getHeatLevelConfig = (nivel?: number) => {
  const key = `NC${nivel || 1}` as keyof typeof HEAT_LEVELS;
  return HEAT_LEVELS[key] || HEAT_LEVELS.NC1;
};

export default function CitizenGuideScreen({
  onBack,
  isDarkMode: externalDarkMode,
  onToggleDarkMode,
}: CitizenGuideScreenProps) {
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<TipCategory>('todas');
  const [alertData, setAlertData] = useState<HeatAlertResponse | null>(null);
  const [isLoadingAlert, setIsLoadingAlert] = useState<boolean>(true);

  const isDarkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;
  const toggleTheme = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      setInternalDarkMode((prev) => !prev);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadHeatAlerts() {
      try {
        const data = await getHeatAlertsService();
        if (isMounted) {
          setAlertData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar cenário térmico no Guia:', error);
      } finally {
        if (isMounted) {
          setIsLoadingAlert(false);
        }
      }
    }

    loadHeatAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const currentAlert = useMemo(
    () => getHeatLevelConfig(alertData?.hoje?.nivel),
    [alertData?.hoje?.nivel]
  );
  const cardShadow = shadow(isDarkMode);

  const visibleTips = useMemo(() => {
    if (selectedCategory === 'todas') return HEAT_TIPS;
    return HEAT_TIPS.filter((tip) => tip.category === selectedCategory);
  }, [selectedCategory]);

  const handleEmergencyCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const formattedTemp =
    alertData?.hoje?.icMaxC !== undefined && alertData?.hoje?.icMaxC !== null
      ? `${alertData.hoje.icMaxC.toFixed(1).replace('.', ',')}°C`
      : null;

  return (
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
              {onBack ? (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={onBack}
                  accessibilityLabel="Voltar para tela inicial"
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconBtnText}>‹</Text>
                </TouchableOpacity>
              ) : (
                <ThermoLogo variant="dark" showText={false} size={30} />
              )}

              <View style={styles.topBarTitleBox}>
                <Text style={styles.screenLabel}>Guia do Cidadão</Text>
                <Text style={styles.screenSubLabel} numberOfLines={1}>
                  Prevenção, hidratação e níveis de alerta
                </Text>
              </View>
            </View>

            <View style={styles.topBarActions}>
              {/* Uso do Componente Reutilizável */}
              <ThemeToggleButton isDarkMode={isDarkMode} onPress={toggleTheme} />
            </View>
          </View>

          <View style={styles.heroIntro}>
            {isLoadingAlert ? (
              <View style={styles.badgeLoadingRow}>
                <ActivityIndicator size="small" color={BRAND_COLORS.laranjaSol} />
                <Text style={styles.badgeLoadingText}>Consultando cenário térmico...</Text>
              </View>
            ) : (
              <View style={[styles.ncBadge, { backgroundColor: currentAlert.color }]}>
                <Text style={[styles.ncBadgeText, { color: currentAlert.textColor }]}>
                  Cenário atual: {currentAlert.code} •{' '}
                  {alertData?.hoje?.nome || currentAlert.label}
                  {formattedTemp ? ` (${formattedTemp})` : ''}
                </Text>
              </View>
            )}

            <Text style={styles.heroTitle}>Como se proteger durante ondas de calor</Text>
            <Text style={styles.heroSubtitle}>
              Orientações oficiais de saúde pública e entenda como funciona a escala de
              monitoramento térmico da sua cidade.
            </Text>
          </View>
        </View>

        {/* ───────── CONTEÚDO PRINCIPAL ───────── */}
        <View style={styles.content}>
          {/* Card Destaque: Orientação baseada no nível real da API */}
          <View
            style={[
              styles.highlightCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View
              style={[
                styles.highlightAccent,
                { backgroundColor: isLoadingAlert ? '#00A896' : currentAlert.color },
              ]}
            />
            <View style={styles.highlightBody}>
              <Text style={[styles.highlightTitle, { color: theme.textPrimary }]}>
                Recomendação para o cenário {currentAlert.code}
                {formattedTemp ? ` · IC Máx. ${formattedTemp}` : ''}
              </Text>
              <Text style={[styles.highlightDesc, { color: theme.textSecondary }]}>
                {alertData?.acaoEsperada
                  ? `${alertData.acaoEsperada} Mantenha a hidratação regular ao longo do dia.`
                  : 'Consuma no mínimo 2,5 a 3 litros de água ao longo do dia (cerca de 1 copo a cada 30 minutos em períodos mais quentes).'}
              </Text>
            </View>
          </View>

          {/* ───────── SEÇÃO 1: DICAS DE HIDRATAÇÃO E SEGURANÇA ───────── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Dicas de hidratação e segurança
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Medidas práticas para reduzir os impactos do calor extremo
            </Text>
          </View>

          {/* Filtros (Chips) */}
          <View style={styles.filterRow}>
            {TIP_FILTERS.map((f) => {
              const active = selectedCategory === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setSelectedCategory(f.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    active
                      ? {
                          backgroundColor: BRAND_COLORS.azulEscuro,
                          borderColor: BRAND_COLORS.azulEscuro,
                        }
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

          {/* Lista de Cards de Dicas */}
          {visibleTips.map((tip) => (
            <HeatTipCard
              key={tip.id}
              tip={tip}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}

          {/* ───────── SEÇÃO 2: O QUE SÃO OS NCs (NÍVEIS DE CALOR) ───────── */}
          <View style={[styles.sectionHeader, { marginTop: 22 }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              O que são os Níveis de Calor (NC)?
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Escala oficial de 5 estágios baseada nos boletins do INMET e Defesa Civil para
              classificar o risco térmico
            </Text>
          </View>

          {Object.values(HEAT_LEVELS).map((level) => (
            <HeatLevelCard
              key={level.code}
              level={level}
              details={NC_DETAILS[level.code]}
              isCurrent={!isLoadingAlert && level.code === currentAlert.code}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}

          {/* ───────── CARD DE EMERGÊNCIA ───────── */}
          <View
            style={[
              styles.emergencyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <Text style={[styles.emergencyTitle, { color: theme.textPrimary }]}>
              Precisa de atendimento urgente?
            </Text>
            <Text style={[styles.emergencyDesc, { color: theme.textSecondary }]}>
              Em caso de desmaio, febre alta sem suor ou falta de ar, acione o socorro
              imediatamente.
            </Text>

            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={[
                  styles.emergencyBtn,
                  { backgroundColor: BRAND_COLORS.laranjaSol },
                ]}
                onPress={() => handleEmergencyCall('192')}
                activeOpacity={0.85}
              >
                <Text style={styles.emergencyBtnText}>Ligar SAMU · 192</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.emergencyBtn,
                  { backgroundColor: BRAND_COLORS.azulEscuro },
                ]}
                onPress={() => handleEmergencyCall('199')}
                activeOpacity={0.85}
              >
                <Text style={styles.emergencyBtnText}>Defesa Civil · 199</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  screenLabel: {
    color: BRAND_COLORS.branco,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  screenSubLabel: {
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
    fontSize: 18,
    fontWeight: '600',
  },
  heroIntro: {
    marginTop: 24,
  },
  badgeLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badgeLoadingText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  ncBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  ncBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: BRAND_COLORS.branco,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  /* Conteúdo */
  content: {
    paddingHorizontal: 16,
    marginTop: -34,
  },
  highlightCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 24,
  },
  highlightAccent: {
    width: 5,
    backgroundColor: '#00A896',
  },
  highlightBody: {
    flex: 1,
    padding: 16,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  highlightDesc: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* Cabeçalhos de Seção */
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  /* Filtros */
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

  /* Card de Emergência */
  emergencyCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginTop: 14,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emergencyDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  emergencyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  emergencyBtnText: {
    color: BRAND_COLORS.branco,
    fontSize: 13,
    fontWeight: '700',
  },
});