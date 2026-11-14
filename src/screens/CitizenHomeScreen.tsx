import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import ThermoLogo from '../components/ThermoLogo';
import SupportPointCard from '../components/SupportPointCard';
import SupportPointModal from '../components/SupportPointModal';
import { BRAND_COLORS, HEAT_LEVELS, THEMES } from '../theme/thermoTheme';
import { UserProfile } from './Login';
import { SUPPORT_POINTS } from '../data/mockData';
import { PlaceFilter, SupportPoint } from '../interfaces/interfaces';
import { shadow } from '../theme/shadowTheme';
import { getPlaceBadgeConfig } from '../utils/placeUtils';

interface CitizenHomeScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

const USER_LOCATION = {
  latitude: -22.1256,
  longitude: -51.3889,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

const FILTERS: { key: PlaceFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'refugio', label: 'Refúgios' },
  { key: 'ubs', label: 'UBS Próximas' },
];

export default function CitizenHomeScreen({ user, onLogout }: CitizenHomeScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<PlaceFilter>('todos');
  const [selectedPoint, setSelectedPoint] = useState<SupportPoint | null>(null);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const currentAlert = HEAT_LEVELS.NC4;
  const cardShadow = shadow(isDarkMode);

  const visiblePoints = useMemo(() => {
    const list =
      filter === 'todos'
        ? SUPPORT_POINTS
        : SUPPORT_POINTS.filter((p) => p.type === filter);
    return [...list].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filter]);

  const openExternalMaps = (point: SupportPoint) => {
    const label = encodeURIComponent(point.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${point.latitude},${point.longitude}`,
      android: `geo:0,0?q=${point.latitude},${point.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.navHeader }]}>
      <StatusBar
        barStyle="light-content"
      />

      <ScrollView
        style={[styles.body, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ───────── HERO CLIMÁTICO ───────── */}
        <View style={[styles.hero, { backgroundColor: theme.navHeader }]}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <ThermoLogo variant="dark" showText={false} size={30} />
              <View style={styles.topBarTitleBox}>
                <Text style={styles.cityLabel}>Presidente Prudente</Text>
                <Text style={styles.userSubLabel} numberOfLines={1}>
                  Olá, {user?.name || 'Cidadão'}
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
              <Text style={styles.humidity}>Umidade 24% · UV Extremo</Text>
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
            Alerta oficial Defesa Civil e INMET · atualizado às 14:30
          </Text>
        </View>

        {/* ───────── CONTEÚDO PRINCIPAL ───────── */}
        <View style={styles.content}>
          {/* Card de Recomendação Preventiva */}
          <View
            style={[
              styles.alertCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View style={styles.alertAccent} />
            <View style={styles.alertBody}>
              <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>
                Alerta de calor intenso na sua região
              </Text>
              <Text style={[styles.alertDesc, { color: theme.textSecondary }]}>
                Beba água a cada 30 minutos e evite exposição direta ao sol até as 17h. Caso
                sinta tontura ou mal-estar, procure um refúgio ou UBS no mapa abaixo.
              </Text>
            </View>
          </View>

          {/* Cabeçalho da Seção do Mapa */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Pontos de apoio próximos
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Toque em um marcador para ver horários e traçar rota
            </Text>
          </View>

          {/* Filtros (Chips) */}
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

          {/* Card do Mapa Interativo */}
          <View
            style={[
              styles.mapCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={USER_LOCATION}
              showsUserLocation
              showsMyLocationButton
            >
              <Circle
                center={{
                  latitude: USER_LOCATION.latitude,
                  longitude: USER_LOCATION.longitude,
                }}
                radius={2000}
                strokeColor="rgba(255, 107, 53, 0.35)"
                fillColor="rgba(255, 107, 53, 0.08)"
              />

              {visiblePoints.map((point) => {
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
                    onPress={() => setSelectedPoint(point)}
                  />
                );
              })}
            </MapView>

            <View style={[styles.mapLegendBar, { borderTopColor: theme.cardBorder }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00A896' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  Refúgio Climatizado
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: BRAND_COLORS.laranjaSol }]}
                />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  Unidade Básica (UBS)
                </Text>
              </View>
            </View>
          </View>

          {/* Lista Rápida dos Pontos Ordenados por Distância */}
          {visiblePoints.map((point) => (
            <SupportPointCard
              key={point.id}
              point={point}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={setSelectedPoint}
            />
          ))}
        </View>
      </ScrollView>

      {/* ───────── BOTTOM SHEET DE DETALHES DO LOCAL ───────── */}
      <SupportPointModal
        point={selectedPoint}
        theme={theme}
        isDarkMode={isDarkMode}
        onClose={() => setSelectedPoint(null)}
        onOpenMaps={openExternalMaps}
      />
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
  userSubLabel: {
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
  alertCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 24,
  },
  alertAccent: {
    width: 5,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  alertBody: {
    flex: 1,
    padding: 16,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  alertDesc: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* Seção Mapa */
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
  mapCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 260,
  },
  mapLegendBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});