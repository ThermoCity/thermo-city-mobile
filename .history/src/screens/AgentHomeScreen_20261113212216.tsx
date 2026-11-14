import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, heatLevels, radius, space, type } from '../theme';
import { Button } from '../components/ThermoLogo';

// ---------- Dados demonstrativos (substituir pela API do governo) ----------
const CITY = 'Presidente Prudente';
const CURRENT = { level: 3, temp: 34, feels: 37, humidity: 38, uv: 9 };

const FORECAST = [
  { day: 'Hoje', temp: 34, level: 3 },
  { day: 'Sáb', temp: 37, level: 4 },
  { day: 'Dom', temp: 39, level: 5 },
  { day: 'Seg', temp: 36, level: 4 },
  { day: 'Ter', temp: 33, level: 3 },
];

const SECTORS = [
  { name: 'Zona Leste', level: 4, people: 1 },
  { name: 'Centro', level: 3, people: 1 },
  { name: 'Zona Norte', level: 3, people: 0 },
  { name: 'Zona Sul', level: 2, people: 0 },
  { name: 'Zona Oeste', level: 1, people: 0 },
];

const INITIAL_CONTACTS = [
  { id: '001', sector: 'Zona Leste', reason: 'Calor + vulnerabilidade', done: null },
  { id: '002', sector: 'Centro', reason: 'Calor + vulnerabilidade', done: null },
];

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const pad = (n) => String(n).padStart(2, '0');
const formatNow = (d = new Date()) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const firstName = (name = '') => name.trim().split(' ')[0] || 'agente';

// ---------- Componentes ----------
function LevelBadge({ level, size = 'md' }) {
  const l = heatLevels[level];
  const big = size === 'lg';
  return (
    <View
      style={[styles.badge, { backgroundColor: l.bg }, big && styles.badgeLg]}
      accessibilityLabel={`${l.code}, ${l.label}`}
    >
      <Text style={[styles.badgeText, { color: l.fg }, big && styles.badgeTextLg]}>{l.code}</Text>
    </View>
  );
}

// Escala NC1–NC5 com marcador do nível atual
function HeatScale({ level }) {
  return (
    <View accessible accessibilityLabel={`Escala de calor. Nível atual ${heatLevels[level].code}, ${heatLevels[level].label}`}>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <View
            key={n}
            style={[
              styles.scaleSeg,
              { backgroundColor: heatLevels[n].bg },
              n === 1 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
              n === 5 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
            ]}
          >
            <Text style={[styles.scaleCode, { color: heatLevels[n].fg }]}>{heatLevels[n].code}</Text>
          </View>
        ))}
      </View>
      <View style={styles.markerTrack}>
        <View style={[styles.marker, { left: `${(level - 0.5) * 20}%` }]} />
      </View>
    </View>
  );
}

function Stat({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={colors.blue} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, action }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.h2}>{title}</Text>
      {action}
    </View>
  );
}

// ---------- Tela ----------
export default function AgentHomeScreen({ user, onSignOut }) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [updatedAt] = useState(formatNow());
  const level = heatLevels[CURRENT.level];
  const maxTemp = Math.max(...FORECAST.map((f) => f.temp));
  const minTemp = Math.min(...FORECAST.map((f) => f.temp)) - 6;
  const hotSectors = SECTORS.filter((s) => s.level >= 3).length;
  const pending = contacts.filter((c) => !c.done).length;

  const registerContact = (c) => {
    const save = (kind) =>
      setContacts((list) =>
        list.map((x) => (x.id === c.id ? { ...x, done: { kind, time: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}` } } : x))
      );
    Alert.alert(`Registrar contato com Pessoa ${c.id}`, 'Como foi o contato?', [
      { text: 'Ligação', onPress: () => save('Ligação') },
      { text: 'Visita', onPress: () => save('Visita') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const confirmSignOut = () =>
    Alert.alert('Sair da conta', 'Deseja sair do ThermoCity?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onSignOut },
    ]);

  const soon = (name) => Alert.alert(name, 'Esta área será liberada nas próximas telas do app.');

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho azul compacto */}
        <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
          <View style={styles.headerTop}>
            <View style={styles.iconTile}>
              <Image source={require('../../assets/symbol.png')} style={styles.symbol} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>Olá, {firstName(user?.name)}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location" size={13} color={colors.onBlueMuted} />
                <Text style={styles.headerSub}>{CITY} · Central Operacional</Text>
              </View>
            </View>
            <Pressable
              onPress={confirmSignOut}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <Ionicons name="log-out-outline" size={22} color={colors.offwhite} />
            </Pressable>
          </View>
          <Text style={styles.updated}>Última atualização: {updatedAt} · Dados demonstrativos</Text>
        </View>

        {/* Painel principal: nível atual */}
        <View style={[styles.card, styles.hero]}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={type.small}>Nível de calor atual</Text>
              <View style={styles.levelRow}>
                <LevelBadge level={CURRENT.level} size="lg" />
                <Text style={styles.levelLabel}>{level.label}</Text>
              </View>
            </View>
            <View style={styles.tempBox}>
              <Text style={styles.temp}>{CURRENT.temp}°</Text>
              <Text style={type.small}>Sensação {CURRENT.feels}°</Text>
            </View>
          </View>

          <HeatScale level={CURRENT.level} />

          <View style={styles.guidance}>
            <Ionicons name="information-circle-outline" size={20} color={colors.blue} />
            <Text style={styles.guidanceText}>
              Priorize a busca ativa na Zona Leste e no Centro entre 10h e 16h, quando o calor é mais intenso.
            </Text>
          </View>
        </View>

        {/* Indicadores */}
        <View style={styles.statsRow}>
          <Stat icon="people-outline" value={String(pending)} label="Contatos pendentes" />
          <Stat icon="location-outline" value={String(hotSectors)} label="Setores em NC3+" />
          <Stat icon="water-outline" value={`${CURRENT.humidity}%`} label="Umidade do ar" />
        </View>

        {/* Alerta do governo */}
        <View style={styles.alert}>
          <Ionicons name="notifications-outline" size={22} color={colors.blue} style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Previsão de calor mais intenso no fim de semana</Text>
            <Text style={styles.alertText}>
              O boletim do governo indica NC4 no sábado e NC5 no domingo. Reveja a lista de contatos antes de sexta.
            </Text>
          </View>
        </View>

        {/* Previsão */}
        <SectionHeader title="Próximos dias" />
        <View style={[styles.card, styles.forecast]}>
          {FORECAST.map((f) => {
            const l = heatLevels[f.level];
            const h = 36 + ((f.temp - minTemp) / (maxTemp - minTemp)) * 70;
            return (
              <View key={f.day} style={styles.fcCol} accessible accessibilityLabel={`${f.day}, ${f.temp} graus, ${l.code} ${l.label}`}>
                <Text style={styles.fcTemp}>{f.temp}°</Text>
                <View style={[styles.fcBar, { height: h, backgroundColor: l.bg }]}>
                  <Text style={[styles.fcCode, { color: l.fg }]}>{l.code}</Text>
                </View>
                <Text style={styles.fcDay}>{f.day}</Text>
              </View>
            );
          })}
        </View>

        {/* Setores */}
        <SectionHeader
          title="Calor por setor"
          action={
            <Pressable onPress={() => soon('Mapa de risco')} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>Ver mapa</Text>
            </Pressable>
          }
        />
        <View style={styles.card}>
          {SECTORS.map((s, i) => (
            <View key={s.name} style={[styles.sectorRow, i > 0 && styles.sectorDivider]}>
              <LevelBadge level={s.level} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorName}>{s.name}</Text>
                <Text style={type.small}>{heatLevels[s.level].label}</Text>
              </View>
              {s.people > 0 ? (
                <View style={styles.peoplePill}>
                  <Ionicons name="people-outline" size={14} color={colors.blue} />
                  <Text style={styles.peopleText}>{s.people}</Text>
                </View>
              ) : null}
            </View>
          ))}
          <Text style={styles.note}>
            Nível de calor, risco territorial e prioridade de contato são informações distintas.
          </Text>
        </View>

        {/* Contatos prioritários */}
        <SectionHeader
          title="Contatos prioritários"
          action={
            <Pressable onPress={() => soon('Contatos prioritários')} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>Ver todos</Text>
            </Pressable>
          }
        />
        <View style={styles.card}>
          {contacts.map((c, i) => (
            <View key={c.id} style={[styles.contactRow, i > 0 && styles.sectorDivider]}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorName}>Pessoa {c.id}</Text>
                <Text style={type.small}>{c.reason}</Text>
                <Text style={type.small}>{c.sector}</Text>
              </View>
              {c.done ? (
                <View style={styles.doneBox} accessibilityLabel={`Contato registrado: ${c.done.kind} às ${c.done.time}`}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <View>
                    <Text style={styles.doneTitle}>Contato registrado</Text>
                    <Text style={styles.doneSub}>{c.done.kind} · {c.done.time}</Text>
                  </View>
                </View>
              ) : (
                <Button title="Registrar contato" variant="accent" onPress={() => registerContact(c)} style={styles.contactBtn} />
              )}
            </View>
          ))}
          <Text style={styles.note}>Dados pessoais completos ficam na área restrita da equipe de saúde.</Text>
        </View>
      </ScrollView>

      {/* Navegação inferior */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
        {[
          ['home', 'Início', true],
          ['map-outline', 'Mapa', false],
          ['people-outline', 'Contatos', false],
          ['person-outline', 'Perfil', false],
        ].map(([icon, label, active]) => (
          <Pressable
            key={label}
            style={styles.tabItem}
            onPress={() => (active ? null : soon(label))}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Ionicons name={icon} size={23} color={active ? colors.orange : colors.onBlueMuted} />
            <Text style={[styles.tabLabel, active && { color: colors.orange }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: '#1D2F36',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Cabeçalho
  header: {
    backgroundColor: colors.blue,
    paddingHorizontal: space.lg,
    paddingBottom: 64,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.offwhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { width: 30, height: 36 },
  hello: { fontSize: 20, fontWeight: '700', color: colors.offwhite },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerSub: { fontSize: 13, color: colors.onBlueMuted },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updated: { fontSize: 12, color: colors.onBlueMuted, marginTop: space.lg },

  // Cards
  card: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    ...shadow,
  },
  hero: { marginTop: -44, marginBottom: space.lg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.lg },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: 6 },
  levelLabel: { fontSize: 20, fontWeight: '700', color: colors.blue },
  tempBox: { alignItems: 'flex-end' },
  temp: { fontSize: 52, fontWeight: '300', color: colors.blue, letterSpacing: -2, lineHeight: 56 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, minWidth: 48, alignItems: 'center' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeLg: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md },
  badgeTextLg: { fontSize: 24 },

  // Escala
  scaleRow: { flexDirection: 'row' },
  scaleSeg: { flex: 1, height: 30, alignItems: 'center', justifyContent: 'center' },
  scaleCode: { fontSize: 11, fontWeight: '700' },
  markerTrack: { height: 12, position: 'relative' },
  marker: {
    position: 'absolute',
    top: 3,
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.blue,
  },
  guidance: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  guidanceText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.blue },

  // Indicadores
  statsRow: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, marginBottom: space.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.blue },
  statLabel: { fontSize: 12, lineHeight: 16, color: colors.textMuted, marginTop: 2 },

  // Alerta
  alert: {
    flexDirection: 'row',
    gap: space.md,
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: '#FBE6DC',
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
    marginBottom: space.xl,
  },
  alertTitle: { fontSize: 15, fontWeight: '700', color: colors.blue, marginBottom: 4 },
  alertText: { fontSize: 14, lineHeight: 20, color: colors.blue },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg + 2,
    marginBottom: space.md,
  },
  link: { fontSize: 14, fontWeight: '700', color: colors.blue, textDecorationLine: 'underline' },

  // Previsão
  forecast: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: space.xl },
  fcCol: { flex: 1, alignItems: 'center', gap: 6 },
  fcTemp: { fontSize: 15, fontWeight: '700', color: colors.blue },
  fcBar: { width: '72%', borderRadius: radius.sm, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 6 },
  fcCode: { fontSize: 11, fontWeight: '700' },
  fcDay: { fontSize: 13, color: colors.textMuted },

  // Setores e contatos
  sectorRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  sectorDivider: { borderTopWidth: 1, borderTopColor: colors.bg },
  sectorName: { fontSize: 15, fontWeight: '700', color: colors.blue },
  peoplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  peopleText: { fontSize: 13, fontWeight: '700', color: colors.blue },
  note: { fontSize: 12, lineHeight: 17, color: colors.textMuted, marginTop: space.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtn: { minHeight: 40, paddingHorizontal: space.md, borderRadius: radius.sm },
  doneBox: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 130 },
  doneTitle: { fontSize: 12, fontWeight: '700', color: colors.success },
  doneSub: { fontSize: 12, color: colors.textMuted },

  // Navegação inferior
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.blue,
    paddingTop: space.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: colors.onBlueMuted },
});
