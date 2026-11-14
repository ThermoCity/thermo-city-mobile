import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function AgentHomeScreen({ user, onLogout }: AgentHomeScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [contacts, setContacts] = useState<VulnerablePerson[]>(INITIAL_VULNERABLE_LIST);
  const [selectedPerson, setSelectedPerson] = useState<VulnerablePerson | null>(null);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const currentAlert = HEAT_LEVELS.NC4;

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.navHeader }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.navHeader} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThermoLogo variant="dark" showText={false} size={28} />
          <View style={styles.headerTitleBox}>
            <Text style={styles.cityLabel}>Presidente Prudente • SP</Text>
            <Text style={styles.agentSubLabel} numberOfLines={1}>
              {user?.name || 'Agente de Saúde'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.themeToggleText}>
              {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[styles.body, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionOverline, { color: theme.textSecondary }]}>
              BOLETIM OFICIAL • DEFESA CIVIL / INMET
            </Text>
            <Text style={[styles.updateTime, { color: theme.textSecondary }]}>
              Atualizado 14:30
            </Text>
          </View>

          <View style={styles.weatherHeroRow}>
            <View>
              <View style={styles.tempRow}>
                <Text style={styles.tempValue}>38°C</Text>
                <View
                  style={[
                    styles.ncBadge,
                    { backgroundColor: currentAlert.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.ncBadgeText,
                      { color: currentAlert.textColor },
                    ]}
                  >
                    {currentAlert.code} • {currentAlert.label}
                  </Text>
                </View>
              </View>
              <Text style={[styles.feelsLike, { color: theme.textPrimary }]}>
                Sensação térmica de 41°C • Humidade 24%
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.protocolBox,
              { backgroundColor: isDarkMode ? '#242B30' : '#F8FAFB' },
            ]}
          >
            <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>
              Protocolo ativo para a equipa local[cite: 2]:
            </Text>
            <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
              Priorizar visita ou contacto telefónico a idosos acamados e grávidas nos
              setores em NC4. Orientar hidratação e encaminhar para refúgios climatizados[cite: 10].
            </Text>
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
                    isCurrent && styles.scaleStepActive,
                  ]}
                >
                  <Text
                    style={[styles.scaleStepCode, { color: level.textColor }]}
                  >
                    {level.code}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.scaleLegendRow}>
            <Text style={[styles.scaleLegendText, { color: theme.textSecondary }]}>
              NC1 Muito baixo
            </Text>
            <Text style={[styles.scaleLegendText, { color: theme.textSecondary }]}>
              NC3 Moderado
            </Text>
            <Text style={[styles.scaleLegendText, { color: theme.textSecondary }]}>
              NC5 Muito alto
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View
            style={[
              styles.kpiCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={styles.kpiHighlight}>{pendingCount}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              Contactos pendentes
            </Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
              03
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              Setores em NC3+
            </Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
              02
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              Refúgios abertos[cite: 10]
            </Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.textPrimary }]}>
            Contactos prioritários[cite: 9]
          </Text>
          <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
            Ordenado por risco térmico + vulnerabilidade[cite: 2, 9]
          </Text>
        </View>

        {contacts.map((person) => {
          const levelInfo = HEAT_LEVELS[person.heatLevel];
          const isDone = person.status === 'contatado';

          return (
            <View
              key={person.id}
              style={[
                styles.personCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.personTopRow}>
                <View style={styles.personMainInfo}>
                  <Text
                    style={[styles.personName, { color: theme.textPrimary }]}
                  >
                    {person.name}
                  </Text>
                  <Text
                    style={[
                      styles.personSector,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {person.sector}
                  </Text>
                </View>

                <View
                  style={[
                    styles.miniNcTag,
                    { backgroundColor: levelInfo.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniNcText,
                      { color: levelInfo.textColor },
                    ]}
                  >
                    {levelInfo.code}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.reasonBox,
                  { backgroundColor: isDarkMode ? '#242B30' : '#F3F6F8' },
                ]}
              >
                <Text
                  style={[styles.reasonText, { color: theme.textSecondary }]}
                >
                  Motivo: {person.reason}
                </Text>
              </View>

              <View style={styles.personFooter}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isDone ? '#2E7D32' : BRAND_COLORS.laranjaSol,
                    },
                  ]}
                >
                  {isDone
                    ? `✓ Concluído (${person.lastAction || 'Contacto registado'})`
                    : '● Aguardando ação'}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isDone && styles.actionBtnSecondary,
                  ]}
                  onPress={() => setSelectedPerson(person)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      isDone && styles.actionBtnSecondaryText,
                    ]}
                  >
                    {isDone ? 'Atualizar' : 'Registar contacto'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={Boolean(selectedPerson)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPerson(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Destinar ação de cuidado
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {selectedPerson?.name}
            </Text>

            {[
              'Ligação de monitoramento realizada',
              'Visita domiciliária agendada',
              'Encaminhado ao Refúgio Comunitário Leste',
              'Acionada equipa de remoção médica',
            ].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  { borderColor: theme.cardBorder },
                ]}
                onPress={() => handleConfirmAction(option)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: theme.textPrimary },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSelectedPerson(null)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: BRAND_COLORS.azulEscuro,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitleBox: {
    marginLeft: 10,
    flex: 1,
  },
  cityLabel: {
    color: BRAND_COLORS.branco,
    fontSize: 15,
    fontWeight: '700',
  },
  agentSubLabel: {
    color: '#B8C7CE',
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2A3F47',
  },
  themeToggleText: {
    color: BRAND_COLORS.offWhite,
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3C535C',
  },
  logoutText: {
    color: BRAND_COLORS.branco,
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  updateTime: {
    fontSize: 11,
  },
  weatherHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempValue: {
    fontSize: 38,
    fontWeight: '800',
    color: BRAND_COLORS.laranjaSol,
  },
  ncBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ncBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  feelsLike: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  protocolBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
  },
  protocolTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  protocolDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  scaleContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  scaleStep: {
    flex: 1,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleStepActive: {
    borderWidth: 2,
    borderColor: BRAND_COLORS.azulEscuro,
  },
  scaleStepCode: {
    fontSize: 11,
    fontWeight: '800',
  },
  scaleLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  scaleLegendText: {
    fontSize: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  kpiHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND_COLORS.laranjaSol,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  listHeader: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  personCard: {
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  personTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  personMainInfo: {
    flex: 1,
    paddingRight: 10,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
  },
  personSector: {
    fontSize: 12,
    marginTop: 3,
  },
  miniNcTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniNcText: {
    fontSize: 11,
    fontWeight: '800',
  },
  reasonBox: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 12,
  },
  personFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  actionBtn: {
    backgroundColor: BRAND_COLORS.laranjaSol,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnText: {
    color: BRAND_COLORS.azulEscuro,
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9AA8B0',
  },
  actionBtnSecondaryText: {
    color: '#6C7D86',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 47, 54, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 14,
  },
  modalOption: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: BRAND_COLORS.laranjaSol,
    fontSize: 14,
    fontWeight: '700',
  },
});