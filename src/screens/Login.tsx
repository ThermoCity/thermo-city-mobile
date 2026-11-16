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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS } from '../theme/thermoTheme';
import { useNavigation } from '@react-navigation/native';
import { loginService, registerService } from '../services/thermoCityService';


type FieldKey = 'name' | 'email' | 'phone' | 'cpf' | 'cep' | 'password';

const ROLES: {
  key: 'agente' | 'cidadao';
  title: string;
  subtitle: string;
}[] = [
  { key: 'agente', title: 'Agente de Saúde', subtitle: 'Busca ativa e alertas' },
  { key: 'cidadao', title: 'Cidadão', subtitle: 'Clima e refúgios' },
];


export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [role, setRole] = useState<'agente' | 'cidadao'>('agente');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Campos de preenchimento
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focused, setFocused] = useState<FieldKey | null>(null);

  // Máscaras de formatação
  const handleCpfChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 11);
    let formatted = cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    setCpf(formatted);
  };

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 11);
    let formatted = cleaned;
    if (cleaned.length > 6) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length > 0) {
      formatted = `(${cleaned}`;
    }
    setTelefone(formatted);
  };

  const handleCepChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 8);
    // Assegura o prefixo obrigatório de Presidente Prudente (19010)
    if (!cleaned.startsWith('19010')) {
      cleaned = '19010' + cleaned.replace(/^19010/, '');
    }
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    setCep(formatted);
  };

  const inputStyle = (key: FieldKey) => [
    styles.input,
    focused === key && styles.inputFocused,
  ];

  const focusProps = (key: FieldKey) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused((current) => (current === key ? null : current)),
  });

  const navigate = useNavigation<any>();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        // Validação estrita para o cadastro de Cidadão
        if (!name || !telefone || !cpf || !cep) {
          Alert.alert('Atenção', 'Por favor, preencha todos os campos do cadastro de cidadão.');
          setIsLoading(false);
          return;
        }

        if (cpf.length < 14) {
          Alert.alert('Atenção', 'Informe um CPF válido e completo.');
          setIsLoading(false);
          return;
        }

        if (cep.length < 9) {
          Alert.alert('Atenção', 'Informe um CEP completo.');
          setIsLoading(false);
          return;
        }
        
        // Chamada do service de registro para perfil Cidadão
        await registerService(name, email, password, telefone, cpf, cep);
        Alert.alert('Sucesso', 'Conta de cidadão criada com sucesso!');
      } else {
        // Chamada do service de login
        await loginService(email, password);
      }

      // Navegação para a Home após sucesso na autenticação/cadastro
      navigate.navigate('MainTabs', { screen: 'CitizenHomeScreen' });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: BRAND_COLORS.azulEscuro }]}>
      <StatusBar barStyle="light-content" />

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
                  ? 'Crie sua conta de Cidadão no ThermoCity'
                  : 'Acesse a sua central de monitoramento'}
              </Text>

              {/* Seletor de Perfil visível apenas no Login por regra de negócio */}
              {!isRegistering && (
                <>
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
                </>
              )}

              {/* Campos adicionais exclusivos para Cadastro de Cidadão */}
              {isRegistering && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome completo</Text>
                    <TextInput
                      style={inputStyle('name')}
                      placeholder="Maria Silva"
                      value={name}
                      onChangeText={setName}
                      {...focusProps('name')}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                      style={inputStyle('cpf')}
                      placeholder="529.982.247-25"
                      keyboardType="numeric"
                      value={cpf}
                      onChangeText={handleCpfChange}
                      maxLength={14}
                      {...focusProps('cpf')}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={inputStyle('phone')}
                      placeholder="(18) 99999-1234"
                      keyboardType="phone-pad"
                      value={telefone}
                      onChangeText={handlePhoneChange}
                      maxLength={15}
                      {...focusProps('phone')}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CEP (Presidente Prudente)</Text>
                    <TextInput
                      style={inputStyle('cep')}
                      placeholder="19010-000"
                      keyboardType="numeric"
                      value={cep}
                      onChangeText={handleCepChange}
                      maxLength={9}
                      {...focusProps('cep')}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={inputStyle('email')}
                  placeholder="maria@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  {...focusProps('email')}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={[styles.passwordWrap, focused === 'password' && styles.inputFocused]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="senhaForte123"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    {...focusProps('password')}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading
                    ? 'Aguarde...'
                    : isRegistering
                    ? 'Concluir cadastro de Cidadão'
                    : 'Acessar o painel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchPrompt}
                onPress={() => setIsRegistering(!isRegistering)}
              >
                <Text style={styles.switchPromptText}>
                  {isRegistering ? 'Já possui conta? ' : 'Ainda não tem conta? '}
                  <Text style={styles.switchPromptHighlight}>
                    {isRegistering ? 'Iniciar sessão' : 'Criar conta de Cidadão'}
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
  hero: {
    backgroundColor: BRAND_COLORS.azulEscuro,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 72,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
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