import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS } from '../theme/thermoTheme';

export interface UserProfile {
  name: string;
  role: 'agente' | 'cidadao';
  unit: string;
}

type FieldKey = 'name' | 'email' | 'code' | 'password';

const ROLES: {
  key: 'agente' | 'cidadao';
  title: string;
  subtitle: string;
}[] = [
  { key: 'agente', title: 'Agente de Saúde', subtitle: 'Busca ativa e alertas' },
  { key: 'cidadao', title: 'Cidadão', subtitle: 'Clima e refúgios' },
];

const PLACEHOLDER_COLOR = '#9AA8B0';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [role, setRole] = useState<'agente' | 'cidadao'>('agente');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [credentialCode, setCredentialCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focused, setFocused] = useState<FieldKey | null>(null);

  const inputStyle = (key: FieldKey) => [
    styles.input,
    focused === key && styles.inputFocused,
  ];

  const focusProps = (key: FieldKey) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused((current) => (current === key ? null : current)),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLORS.azulEscuro} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ───────── MARCA ───────── */}
          <View style={styles.hero}>
            <ThermoLogo variant="dark" showText showSlogan size={62} />
          </View>

          {/* ───────── FORMULÁRIO ───────── */}
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, !isRegistering && styles.tabActive]}
                  onPress={() => setIsRegistering(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, !isRegistering && styles.tabTextActive]}>
                    Entrar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, isRegistering && styles.tabActive]}
                  onPress={() => setIsRegistering(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isRegistering && styles.tabTextActive]}>
                    Criar conta
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formTitle}>
                {isRegistering
                  ? 'Registe o seu acesso no ThermoCity'
                  : 'Aceda à sua central de monitoramento'}
              </Text>

              <Text style={styles.label}>Perfil de acesso</Text>
              <View style={styles.roleRow}>
                {ROLES.map((item) => {
                  const selected = role === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.roleButton, selected && styles.roleButtonSelected]}
                      onPress={() => setRole(item.key)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.roleTop}>
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                          {selected && <View style={styles.radioDot} />}
                        </View>
                      </View>
                      <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                        {item.title}
                      </Text>
                      <Text style={styles.roleSubtitle}>{item.subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isRegistering && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome completo</Text>
                  <TextInput
                    style={inputStyle('name')}
                    placeholder="Ex.: Mariana Silva"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={name}
                    onChangeText={setName}
                    {...focusProps('name')}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail institucional ou pessoal</Text>
                <TextInput
                  style={inputStyle('email')}
                  placeholder="nome@saude.gov.br"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  {...focusProps('email')}
                />
              </View>

              {isRegistering && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {role === 'agente'
                      ? 'Matrícula / Registo da Equipa'
                      : 'Morada ou Código Postal de referência'}
                  </Text>
                  <TextInput
                    style={inputStyle('code')}
                    placeholder={role === 'agente' ? 'Ex.: ACS-4092' : 'Ex.: 19010-000'}
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={credentialCode}
                    onChangeText={setCredentialCode}
                    {...focusProps('code')}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Palavra-passe</Text>
                <View style={[styles.passwordWrap, focused === 'password' && styles.inputFocused]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    {...focusProps('password')}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={ () => {}}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {isRegistering ? 'Concluir registo' : 'Aceder ao painel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchPrompt}
                onPress={() => setIsRegistering(!isRegistering)}
              >
                <Text style={styles.switchPromptText}>
                  {isRegistering ? 'Já possui registo? ' : 'Ainda não tem conta? '}
                  <Text style={styles.switchPromptHighlight}>
                    {isRegistering ? 'Iniciar sessão' : 'Criar acesso agora'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.azulEscuro,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: BRAND_COLORS.offWhite,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  /* Marca */
  hero: {
    backgroundColor: BRAND_COLORS.azulEscuro,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 72,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  /* Cartão */
  content: {
    paddingHorizontal: 20,
    marginTop: -44,
  },
  card: {
    backgroundColor: BRAND_COLORS.branco,
    borderRadius: 24,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E1E6E9',
    ...Platform.select({
      ios: {
        shadowColor: '#0B1A20',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 22,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },

  /* Abas */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F4',
    borderRadius: 999,
    padding: 4,
    marginBottom: 22,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: BRAND_COLORS.branco,
    ...Platform.select({
      ios: {
        shadowColor: '#0B1A20',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C7D86',
  },
  tabTextActive: {
    color: BRAND_COLORS.azulEscuro,
    fontWeight: '700',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
    color: BRAND_COLORS.azulEscuro,
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E525B',
    marginBottom: 8,
  },

  /* Perfil */
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E6E9',
    backgroundColor: '#F8FAFB',
  },
  roleButtonSelected: {
    borderColor: BRAND_COLORS.laranjaSol,
    backgroundColor: '#FFF6F1',
  },
  roleTop: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#C3CDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: BRAND_COLORS.laranjaSol,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#52636B',
  },
  roleTitleSelected: {
    color: BRAND_COLORS.azulEscuro,
  },
  roleSubtitle: {
    fontSize: 12,
    color: '#6C7D86',
    marginTop: 3,
  },

  /* Campos */
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: BRAND_COLORS.azulEscuro,
    backgroundColor: '#F1F4F6',
  },
  inputFocused: {
    borderColor: BRAND_COLORS.laranjaSol,
    backgroundColor: BRAND_COLORS.branco,
  },
  passwordWrap: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F1F4F6',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: BRAND_COLORS.azulEscuro,
  },
  showPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND_COLORS.laranjaSol,
    marginLeft: 10,
  },

  /* Ações */
  submitButton: {
    backgroundColor: BRAND_COLORS.laranjaSol,
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: BRAND_COLORS.azulEscuro,
    fontSize: 15,
    fontWeight: '800',
  },
  switchPrompt: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchPromptText: {
    fontSize: 13,
    color: '#6C7D86',
  },
  switchPromptHighlight: {
    color: BRAND_COLORS.azulEscuro,
    fontWeight: '800',
  },
});