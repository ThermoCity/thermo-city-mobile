import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  Modal,
  Alert,
  Linking,
  Platform,
  AppState,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { HEAT_LEVELS } from '../utils/thermoCityUtils';
import { shadow } from '../theme/shadowTheme';
import { useAuth } from '../context/AuthProvider';
import {
  getFamilyMembersService,
  getUserService,
  logoutService,
  updateUserService,
} from '../services/javaThermoCityService';
import { NotificationPrefs } from '../utils/notificationUtils';
import ChangeThemeBtn from '../components/ThemeToggleButton';
import {
  scheduleHeatAlertNotification,
} from '../services/notificationService';

type PermissionState = 'undetermined' | 'granted' | 'denied';

const PREFS_KEY = '@thermocity:notification_prefs';

const DEFAULT_PREFS: NotificationPrefs = {
  heatAlerts: true,
  minLevel: 'NC3',
  hydrationReminders: false,
};

const getInitials = (text?: string) => {
  if (!text) return 'TC';
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return text.substring(0, 2).toUpperCase();
};

const maskCpf = (cpf?: string) => {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf || '';
  return `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`;
};

const formatPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length > 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length > 2) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length > 0) return `(${cleaned}`;
  return cleaned;
};

const formatCpf = (cpf?: string) => {
  const d = (cpf || '').replace(/\D/g, '').slice(0, 11);
  if (d.length !== 11) return cpf || '';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatCep = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  return cleaned;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CitizenProfile() {
  const { user, setUser, logout } = useAuth() as any;

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const cardShadow = shadow(isDarkMode);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const serverData = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  const [familyCount, setFamilyCount] = useState<number | null>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const commitHash = process.env.EXPO_PUBLIC_GIT_COMMIT_HASH || 'Versão de desenvolvimento';

  const fillFields = useCallback((u: any) => {
    if (!u) return;
    serverData.current = u;
    setName(u.nome || u.nomeCompleto || u.name || 'Cidadão');
    setEmail(u.email || u.usuario?.email || '');
    setPhone(formatPhone(String(u.telefone || u.phone || '')));
    setCpf(u.cpf || '');
    setCep(formatCep(String(u.cep || '')));
  }, []);

  const closeEdit = () => {
    fillFields(serverData.current);
    setIsEditing(false);
  };

  useEffect(() => {
    fillFields(user);
  }, [user, fillFields]);

  const refreshPermission = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermission(status as PermissionState);
    } catch (e) {
      console.log('Erro ao consultar permissão de notificações:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPermission();
      getUserService()
        .then((data: any) => {
          if (data && typeof data === 'object') fillFields(data);
        })
        .catch((e: any) => console.log('Erro ao carregar perfil:', e?.message));
      getFamilyMembersService()
        .then((list: any[]) => setFamilyCount(Array.isArray(list) ? list.length : 0))
        .catch(() => setFamilyCount(null));
    }, [refreshPermission, fillFields])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermission();
    });
    return () => sub.remove();
  }, [refreshPermission]);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  // Solicita permissão ao sistema operacional na primeira ativação do toggle
  const requestSystemPermissionIfNeeded = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === 'granted') {
        setPermission('granted');
        return true;
      }
      if (current.status === 'denied' && !current.canAskAgain) {
        Alert.alert(
          'Notificações bloqueadas',
          'Ative as notificações do ThermoCity nos ajustes do dispositivo para receber alertas.',
          [
            { text: 'Agora não', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      const result = await Notifications.requestPermissionsAsync();
      setPermission(result.status as PermissionState);
      return result.status === 'granted';
    } catch (e: any) {
      Alert.alert('Notificações indisponíveis', e?.message || 'Não foi possível solicitar a permissão.');
      return false;
    }
  };

  const updatePrefs = async (patch: Partial<NotificationPrefs>) => {
    // Se está tentando ativar e ainda não tem permissão do OS, solicita agora
    if (patch.heatAlerts === true && permission !== 'granted') {
      const granted = await requestSystemPermissionIfNeeded();
      if (!granted) return; // Se o usuário negou, aborta a mudança do switch
    }

    const next = { ...prefs, ...patch };
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});

    // Dispara validações/agendamentos 5s após alteração se ativo
    if (Platform.OS !== 'web' && permission === 'granted') {
      if (patch.heatAlerts === true || patch.minLevel) {
        if (next.heatAlerts) {
          scheduleHeatAlertNotification(next.minLevel);
        }
      }
    }
  };

  // O card superior reflete se a permissão foi concedida E o switch está ligado
  const notificationsOn = permission === 'granted' && prefs.heatAlerts;

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutService();
            if (logout) await logout();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
          }
        },
      },
    ]);
  };

  const persistProfile = async (emailChanged: boolean) => {
    try {
      setIsSaving(true);
      const payload = {
        nome: name.trim(),
        email: email.trim(),
        telefone: phone,
        cep,
      };
      const response = await updateUserService(payload);
      setIsEditing(false);

      if (emailChanged) {
        Alert.alert(
          'E-mail alterado',
          'Seus dados foram atualizados. Por segurança, entre novamente com o novo e-mail.',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await logoutService();
                } catch (e) {}
                if (logout) await logout();
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      const fresh = response && typeof response === 'object' ? response : {};
      const merged = { ...serverData.current, ...payload, ...fresh };
      fillFields(merged);
      if (setUser) setUser({ ...user, ...merged });
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível atualizar os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe seu nome completo.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Atenção', 'Informe um e-mail válido.');
      return;
    }
    if (cep && cep.length < 9) {
      Alert.alert('Atenção', 'Informe um CEP completo.');
      return;
    }

    const originalEmail = String(
      serverData.current?.email || serverData.current?.usuario?.email || ''
    ).trim();
    const emailChanged = email.trim().toLowerCase() !== originalEmail.toLowerCase();

    if (emailChanged) {
      Alert.alert(
        'Alterar e-mail?',
        'Ao trocar o e-mail, sua sessão será encerrada e você precisará entrar novamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => persistProfile(true) },
        ]
      );
      return;
    }
    persistProfile(false);
  };

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
        <Ionicons name={icon} size={16} color={BRAND_COLORS.laranjaSol} />
      </View>
      <View style={styles.infoTexts}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
          {value || 'Não informado'}
        </Text>
      </View>
    </View>
  );

  const ToggleRow = ({
    icon,
    label,
    detail,
    value,
    onChange,
    last,
  }: {
    icon: any;
    label: string;
    detail: string;
    value: boolean;
    onChange: (v: boolean) => void;
    last?: boolean;
  }) => (
    <View
      style={[
        styles.toggleRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.cardBorder },
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
        <Ionicons name={icon} size={17} color={BRAND_COLORS.laranjaSol} />
      </View>
      <View style={styles.infoTexts}>
        <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>{label}</Text>
        <Text style={[styles.toggleDetail, { color: theme.textSecondary }]}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.inputBorder, true: BRAND_COLORS.laranjaSol }}
        thumbColor={BRAND_COLORS.branco}
      />
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    extra?: object
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary },
        ]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.textSecondary}
        {...extra}
      />
    </View>
  );

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
              <Text style={styles.screenTitle}>Meu perfil</Text>
            </View>
            <View style={styles.topBarActions}>
              <ChangeThemeBtn isDarkMode={isDarkMode} onPress={toggleTheme} />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsEditing(true)}
                accessibilityLabel="Editar perfil"
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={18} color={BRAND_COLORS.branco} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {email || 'E-mail não informado'}
              </Text>
              <View style={styles.rolePill}>
                <Ionicons name="shield-checkmark-outline" size={12} color={BRAND_COLORS.laranjaSol} />
                <Text style={styles.roleText}>Cidadão · Presidente Prudente</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ───────── CONTEÚDO ───────── */}
        <View style={styles.content}>
          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {familyCount ?? '–'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {familyCount === 1 ? 'Familiar monitorado' : 'Familiares monitorados'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.stat}>
              <View style={styles.statStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: notificationsOn ? '#2E9E6B' : theme.textSecondary },
                  ]}
                />
                <Text style={[styles.statValueSmall, { color: theme.textPrimary }]}>
                  {notificationsOn ? 'Ativas' : 'Desativadas'}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Notificações</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Informações pessoais</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
              <Text style={styles.sectionAction}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <InfoRow icon="person-outline" label="Nome completo" value={name} />
            <InfoRow icon="mail-outline" label="E-mail" value={email} />
            <InfoRow icon="call-outline" label="Telefone" value={phone} />
            <InfoRow icon="location-outline" label="CEP" value={cep} />
            <InfoRow icon="card-outline" label="CPF" value={maskCpf(cpf)} />
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notificações</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Escolha o que você quer receber
              </Text>
            </View>
          </View>

          {!notificationsOn && permission === 'denied' && Platform.OS !== 'web' && (
            <View
              style={[
                styles.permissionBanner,
                {
                  backgroundColor: isDarkMode ? 'rgba(225,108,66,0.15)' : '#FDEEE8',
                  borderColor: BRAND_COLORS.laranjaSol,
                },
              ]}
            >
              <Ionicons name="notifications-off-outline" size={22} color={BRAND_COLORS.laranjaSol} />
              <View style={styles.bannerTexts}>
                <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>
                  Notificações bloqueadas no sistema
                </Text>
                <Text style={[styles.bannerDesc, { color: theme.textSecondary }]}>
                  Ative nas configurações do dispositivo para receber alertas.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bannerBtn}
                onPress={() => Linking.openSettings()}
                activeOpacity={0.85}
              >
                <Text style={styles.bannerBtnText}>Ajustes</Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.cardBorder, paddingVertical: 4 },
              cardShadow,
            ]}
          >
            <ToggleRow
              icon="thermometer-outline"
              label="Alertas de calor"
              detail="Avisos da Defesa Civil e INMET"
              value={prefs.heatAlerts}
              onChange={(v) => updatePrefs({ heatAlerts: v })}
              last
            />

            {prefs.heatAlerts && (
              <View
                style={[
                  styles.levelBlock,
                  { borderBottomColor: theme.cardBorder },
                ]}
              >
                <Text style={[styles.levelTitle, { color: theme.textSecondary }]}>
                  Avisar a partir do nível
                </Text>
                <View style={styles.levelRow}>
                  {Object.values(HEAT_LEVELS).map((level) => {
                    const active = prefs.minLevel === level.code;
                    return (
                      <TouchableOpacity
                        key={level.code}
                        activeOpacity={0.8}
                        onPress={() => updatePrefs({ minLevel: level.code })}
                        accessibilityLabel={`${level.code} ${level.label}`}
                        style={[
                          styles.levelChip,
                          active
                            ? { backgroundColor: level.color, borderColor: level.color }
                            : { backgroundColor: 'transparent', borderColor: theme.cardBorder },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelChipText,
                            { color: active ? level.textColor : theme.textSecondary },
                          ]}
                        >
                          {level.code}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={[styles.levelHint, { color: theme.textSecondary }]}>
                  {HEAT_LEVELS[prefs.minLevel]?.label || prefs.minLevel} ou acima
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Aplicativo</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsAboutVisible(true)}
            style={[
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              cardShadow,
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
              <Ionicons name="information-circle-outline" size={20} color={BRAND_COLORS.laranjaSol} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Sobre</Text>
              <Text style={[styles.menuDetail, { color: theme.textSecondary }]}>
                Versão, fontes de dados e privacidade
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleLogout}
            style={[
              styles.menuItem,
              styles.logoutItem,
              { backgroundColor: theme.card },
            ]}
          >
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <Ionicons name="log-out-outline" size={20} color="#D9534F" />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.menuLabel, { color: '#D9534F' }]}>Sair da conta</Text>
              <Text style={[styles.menuDetail, { color: '#D9534F', opacity: 0.8 }]}>
                Encerrar sessão atual
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D9534F" />
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            ThermoCity · versão {appVersion}
          </Text>
        </View>
      </ScrollView>

      {/* ───────── MODAL: EDITAR DADOS ───────── */}
      <Modal
        visible={isEditing}
        animationType="fade"
        transparent
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Editar dados pessoais</Text>
              <TouchableOpacity
                onPress={closeEdit}
                style={[styles.closeButton, { backgroundColor: theme.inputBg }]}
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {renderInput('Nome completo', name, setName, { placeholder: 'Seu nome' })}
              {renderInput('E-mail', email, setEmail, {
                placeholder: 'seu@email.com',
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
              {renderInput('Telefone', phone, (t: string) => setPhone(formatPhone(t)), {
                placeholder: '(18) 99999-1234',
                keyboardType: 'phone-pad',
                maxLength: 15,
              })}
              {renderInput('CEP', cep, (t: string) => setCep(formatCep(t)), {
                placeholder: '19010-000',
                keyboardType: 'numeric',
                maxLength: 9,
              })}
              <Text style={[styles.fieldHint, { color: theme.textSecondary }]}>
                Ao mudar o CEP, sua localização é recalculada automaticamente.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CPF</Text>
                <View
                  style={[
                    styles.textInput,
                    styles.lockedInput,
                    { backgroundColor: theme.inputBg, borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={[styles.lockedText, { color: theme.textSecondary }]}>{formatCpf(cpf) || '—'}</Text>
                  <Ionicons name="lock-closed-outline" size={15} color={theme.textSecondary} />
                </View>
                <Text style={[styles.fieldHint, { color: theme.textSecondary, marginTop: 6 }]}>
                  O CPF não pode ser alterado.
                </Text>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.cardBorder }]}
                  onPress={closeEdit}
                  disabled={isSaving}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.accentActionBg },
                    isSaving && { opacity: 0.7 },
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.saveButtonText, { color: theme.accentActionText }]}>
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ───────── MODAL: SOBRE ───────── */}
      <Modal
        visible={isAboutVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Sobre o app</Text>
              <TouchableOpacity
                onPress={() => setIsAboutVisible(false)}
                style={[styles.closeButton, { backgroundColor: theme.inputBg }]}
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.aboutScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutBrand}>
                <View style={[styles.aboutLogo, { backgroundColor: BRAND_COLORS.azulEscuro }]}>
                  <ThermoLogo variant="dark" showText={false} size={40} />
                </View>
                <Text style={[styles.aboutName, { color: theme.textPrimary }]}>ThermoCity</Text>
                <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
                  Alertas de calor extremo, pontos de apoio e monitoramento de familiares vulneráveis
                  para proteger quem você ama.
                </Text>
              </View>

              <View
                style={[
                  styles.aboutInfoCard,
                  { backgroundColor: theme.inputBg, borderColor: theme.cardBorder },
                ]}
              >
                <View style={[styles.aboutRow, { borderBottomColor: theme.cardBorder }]}>
                  <Text style={[styles.aboutLabel, { color: theme.textPrimary }]}>Versão do app</Text>
                  <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>{appVersion}</Text>
                </View>
                <View style={[styles.aboutRow, { borderBottomColor: theme.cardBorder }]}>
                  <Text style={[styles.aboutLabel, { color: theme.textPrimary }]}>Cidade piloto</Text>
                  <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>
                    Presidente Prudente
                  </Text>
                </View>
                <View style={[styles.aboutRow, { borderBottomColor: theme.cardBorder }]}>
                  <Text style={[styles.aboutLabel, { color: theme.textPrimary }]}>Fontes dos alertas</Text>
                  <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>
                    Defesa Civil · INMET
                  </Text>
                </View>
                <View style={[styles.aboutRowColumn, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.aboutLabel, { color: theme.textPrimary }]}>Commit de referência</Text>
                  <Text style={[styles.aboutCommit, { color: theme.textSecondary }]}>{commitHash}</Text>
                </View>
              </View>

              <View style={styles.lgpdNote}>
                <Ionicons name="lock-closed-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.lgpdNoteText, { color: theme.textSecondary }]}>
                  Seus dados e os de seus familiares são tratados conforme a LGPD, apenas para fins de
                  monitoramento e assistência em saúde.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.aboutClose, { backgroundColor: theme.primaryActionBg }]}
                activeOpacity={0.85}
                onPress={() => setIsAboutVisible(false)}
              >
                <Text style={[styles.aboutCloseText, { color: theme.primaryActionText }]}>Entendido</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 40 },

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
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenTitle: { color: BRAND_COLORS.branco, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: BRAND_COLORS.azulEscuro, letterSpacing: 0.5 },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { color: BRAND_COLORS.branco, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  userEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  roleText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },

  /* Conteúdo */
  content: { paddingHorizontal: 16, marginTop: -34 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    marginBottom: 24,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 34 },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  statValueSmall: { fontSize: 15, fontWeight: '800' },
  statStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 27 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { fontSize: 12, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, marginTop: 3 },
  sectionAction: { fontSize: 13, fontWeight: '800', color: BRAND_COLORS.laranjaSol },

  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 20,
  },

  /* Linhas de informação */
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  infoValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },

  /* Notificações */
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  bannerTexts: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '800' },
  bannerDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  bannerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  bannerBtnText: { fontSize: 12, fontWeight: '800', color: BRAND_COLORS.azulEscuro },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '700' },
  toggleDetail: { fontSize: 12, marginTop: 2 },
  levelBlock: {
    paddingBottom: 14,
    marginTop: -4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  levelTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  levelRow: { flexDirection: 'row', gap: 6 },
  levelChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  levelChipText: { fontSize: 12, fontWeight: '800' },
  levelHint: { fontSize: 12, marginTop: 8 },

  /* Itens de menu */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '800' },
  menuDetail: { fontSize: 12, marginTop: 2 },
  logoutItem: { borderColor: 'rgba(217, 83, 79, 0.3)' },
  logoutIcon: { backgroundColor: 'rgba(217, 83, 79, 0.1)', borderColor: 'transparent' },
  footerText: { textAlign: 'center', fontSize: 11, marginTop: 12 },

  /* Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 26, 32, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    borderRadius: 26,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  closeButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  fieldHint: { fontSize: 12, lineHeight: 17, marginTop: -6, marginBottom: 14 },
  lockedInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    opacity: 0.7,
  },
  lockedText: { fontSize: 15 },
  modalButtonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '700' },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { fontSize: 14, fontWeight: '800' },

  /* Sobre */
  aboutScroll: { alignItems: 'center', paddingBottom: 4 },
  aboutBrand: { alignItems: 'center', marginBottom: 20 },
  aboutLogo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 },
  aboutDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  aboutInfoCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  aboutRowColumn: { paddingVertical: 14 },
  aboutLabel: { fontSize: 13, fontWeight: '700' },
  aboutValue: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  aboutCommit: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  lgpdNote: { flexDirection: 'row', gap: 8, marginBottom: 20, paddingHorizontal: 4 },
  lgpdNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  aboutClose: {
    width: '100%',
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCloseText: { fontSize: 14, fontWeight: '800' },
});