import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { shadow } from '../theme/shadowTheme';
import { getVulnerablePersonGuidanceService } from '../services/javaThermoCityService';

interface VulnerabilityGuidanceScreenProps {
  person: {
    id: string | number;
    pessoaId: string | number;
    name: string;
    age?: number;
    phone?: string;
    sector?: string;
    heatLevel: string;
    reason?: string;
    nearestShelter?: string;
  };
  onBack: () => void;
  isDarkMode?: boolean;
}

export default function VulnerabilityGuidanceScreen({
  person,
  onBack,
  isDarkMode = false,
}: VulnerabilityGuidanceScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [guidanceData, setGuidanceData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const softSurface = isDarkMode ? '#242B30' : '#F3F6F8';
  const levelInfo = HEAT_LEVELS[person.heatLevel as keyof typeof HEAT_LEVELS] || HEAT_LEVELS.NC3;
  const cardShadow = shadow(isDarkMode);

  useEffect(() => {
    let isMounted = true;

    async function fetchGuidance() {
      const targetId = person.pessoaId || person.id;
      if (!targetId) {
        setErrorMessage('ID do cidadão não identificado.');
        setLoading(false);
        return;
      }

      try {
        const data = await getVulnerablePersonGuidanceService(targetId);
        if (isMounted) {
          setGuidanceData(data);
        }
      } catch (error: any) {
        if (isMounted) {
          setErrorMessage(error?.message || 'Não foi possível carregar as orientações.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGuidance();
    return () => {
      isMounted = false;
    };
  }, [person]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.navHeader }]}>
      <StatusBar barStyle="light-content" />

      {/* ───────── Cabeçalho ───────── */}
      <View style={[styles.headerContainer, { backgroundColor: theme.navHeader }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Voltar"
          >
            <FontAwesome6 name="arrow-left" size={18} color={BRAND_COLORS.branco} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Roteiro de Atendimento (IA)
          </Text>
        </View>

        <View style={styles.personSummaryCard}>
          <View style={styles.personSummaryInfo}>
            <Text style={styles.personSummaryName} numberOfLines={1}>
              {person.name} {person.age ? `(${person.age}a)` : ''}
            </Text>
            <Text style={styles.personSummarySector} numberOfLines={1}>
              {person.sector || 'Setor prioritário'}
            </Text>
          </View>
          <View style={[styles.ncBadge, { backgroundColor: levelInfo.color }]}>
            <Text style={[styles.ncBadgeText, { color: levelInfo.textColor }]}>
              {levelInfo.code}
            </Text>
          </View>
        </View>
      </View>

      {/* ───────── Conteúdo ───────── */}
      <ScrollView
        style={[styles.body, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.laranjaSol} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Gerando roteiro personalizado com IA e diretrizes RAG...
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={[styles.cardBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }, cardShadow]}>
            <FontAwesome6 name="triangle-exclamation" size={24} color={BRAND_COLORS.laranjaSol} style={styles.errorIcon} />
            <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Aviso</Text>
            <Text style={[styles.errorText, { color: theme.textSecondary }]}>{errorMessage}</Text>
          </View>
        ) : (
          <>
            {/* Aviso de Segurança / Médico */}
            {guidanceData?.aviso ? (
              <View style={[styles.avisoBanner, { backgroundColor: softSurface, borderColor: BRAND_COLORS.laranjaSol }]}>
                <FontAwesome6 name="circle-exclamation" size={16} color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.avisoText, { color: theme.textPrimary }]}>
                  {guidanceData.aviso}
                </Text>
              </View>
            ) : null}

            {/* Roteiro de Abordagem */}
            <View
              style={[
                styles.cardBox,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                cardShadow,
              ]}
            >
              <View style={styles.cardBoxHeader}>
                <FontAwesome6 name="comments" size={16} color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.cardBoxTitle, { color: theme.textPrimary }]}>
                  Roteiro Sugerido para o Agente
                </Text>
              </View>

              {Array.isArray(guidanceData?.roteiro) && guidanceData.roteiro.length > 0 ? (
                guidanceData.roteiro.map((passo: string, index: number) => (
                  <View key={index} style={styles.roteiroStepRow}>
                    <View style={[styles.stepNumberBadge, { backgroundColor: softSurface }]}>
                      <Text style={[styles.stepNumberText, { color: BRAND_COLORS.azulEscuro }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.roteiroText, { color: theme.textPrimary }]}>
                      {passo}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.guidanceText, { color: theme.textSecondary }]}>
                  Nenhum roteiro detalhado disponível.
                </Text>
              )}
            </View>

            {/* Sinais de Alerta */}
            {Array.isArray(guidanceData?.sinaisAlerta) && guidanceData.sinaisAlerta.length > 0 ? (
              <View
                style={[
                  styles.cardBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  cardShadow,
                ]}
              >
                <View style={styles.cardBoxHeader}>
                  <FontAwesome6 name="heart-pulse" size={16} color="#D9534F" />
                  <Text style={[styles.cardBoxTitle, { color: theme.textPrimary }]}>
                    Sinais de Alerta a Observar
                  </Text>
                </View>
                {guidanceData.sinaisAlerta.map((alerta: string, idx: number) => (
                  <View key={idx} style={styles.alertaRow}>
                    <FontAwesome6 name="triangle-exclamation" size={13} color="#D9534F" style={{ marginTop: 3 }} />
                    <Text style={[styles.alertaText, { color: theme.textSecondary }]}>{alerta}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Refúgio Sugerido */}
            {guidanceData?.refugio?.nome ? (
              <View
                style={[
                  styles.cardBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  cardShadow,
                ]}
              >
                <View style={styles.cardBoxHeader}>
                  <FontAwesome6 name="person-shelter" size={16} color={BRAND_COLORS.laranjaSol} />
                  <Text style={[styles.cardBoxTitle, { color: theme.textPrimary }]}>
                    Refúgio Térmico Mais Próximo
                  </Text>
                </View>
                <View style={[styles.shelterBox, { backgroundColor: softSurface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shelterName, { color: theme.textPrimary }]}>
                      {guidanceData.refugio.nome}
                    </Text>
                    <Text style={[styles.shelterDist, { color: theme.textSecondary }]}>
                      Distância aproximada: {guidanceData.refugio.distanciaMetros} metros
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Fontes Oficiais do RAG */}
            {Array.isArray(guidanceData?.fontes) && guidanceData.fontes.length > 0 ? (
              <View
                style={[
                  styles.cardBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  cardShadow,
                ]}
              >
                <View style={styles.cardBoxHeader}>
                  <FontAwesome6 name="book-medical" size={16} color="#2E9E6B" />
                  <Text style={[styles.cardBoxTitle, { color: theme.textPrimary }]}>
                    Bases e Manuais Oficiais Consultados
                  </Text>
                </View>
                {guidanceData.fontes.map((fonte: string, idx: number) => (
                  <View key={idx} style={styles.fonteRow}>
                    <FontAwesome6 name="check" size={11} color="#2E9E6B" style={{ marginTop: 2 }} />
                    <Text style={[styles.fonteText, { color: theme.textSecondary }]}>{fonte}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: BRAND_COLORS.branco,
    flex: 1,
  },
  personSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 14,
  },
  personSummaryInfo: { flex: 1, marginRight: 12 },
  personSummaryName: { fontSize: 15, fontWeight: '700', color: BRAND_COLORS.branco },
  personSummarySector: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ncBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  ncBadgeText: { fontSize: 12, fontWeight: '800' },

  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 40 },

  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, textAlign: 'center' },

  avisoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avisoText: { fontSize: 12.5, lineHeight: 18, flex: 1, fontWeight: '600' },

  cardBox: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 16,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardBoxTitle: { fontSize: 14, fontWeight: '800' },
  guidanceText: { fontSize: 14, lineHeight: 21 },

  roteiroStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: { fontSize: 11, fontWeight: '800' },
  roteiroText: { fontSize: 14, lineHeight: 20, flex: 1 },

  alertaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  alertaText: { fontSize: 13, lineHeight: 19, flex: 1 },

  shelterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  shelterName: { fontSize: 14, fontWeight: '700' },
  shelterDist: { fontSize: 12, marginTop: 3 },

  fonteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  fonteText: { fontSize: 12, lineHeight: 17, flex: 1 },

  errorIcon: { alignSelf: 'center', marginBottom: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  errorText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});