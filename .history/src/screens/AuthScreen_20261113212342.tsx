import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS } from '../theme/thermoTheme';

export interface UserProfile {
  name: string;
  role: 'agente' | 'cidadao';
  unit: string;
}

interface AuthScreenProps {
  onAuthenticate: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [role, setRole] = useState<'agente' | 'cidadao'>('agente');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [credentialCode, setCredentialCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = () => {
    onAuthenticate({
      name: name.trim() || 'Agente Mariana Silva',
      role,
      unit: 'UBS Jardim Paulista • Presidente Prudente',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandSection}>
            <ThermoLogo variant="light" showText showSlogan size={62} />
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, !isRegistering && styles.tabActive]}
                onPress={() => setIsRegistering(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, !isRegistering && styles.tabTextActive]}
                >
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, isRegistering && styles.tabActive]}
                onPress={() => setIsRegistering(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isRegistering && styles.tabTextActive]}
                >
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
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'agente' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('agente')}
              >
                <Text
                  style={[
                    styles.roleTitle,
                    role === 'agente' && styles.roleTitleSelected,
                  ]}
                >
                  Agente de Saúde
                </Text>
                <Text style={styles.roleSubtitle}>Busca ativa e alertas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'cidadao' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('cidadao')}
              >
                <Text
                  style={[
                    styles.roleTitle,
                    role === 'cidadao' && styles.roleTitleSelected,
                  ]}
                >
                  Cidadão
                </Text>
                <Text style={styles.roleSubtitle}>Clima e refúgios</Text>
              </TouchableOpacity>
            </View>

            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: Mariana Silva"
                  placeholderTextColor="#8B99A1"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail institucional ou pessoal</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@saude.gov.br"
                placeholderTextColor="#8B99A1"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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
                  style={styles.input}
                  placeholder={
                    role === 'agente' ? 'Ex.: ACS-4092' : 'Ex.: 19010-000'
                  }
                  placeholderTextColor="#8B99A1"
                  value={credentialCode}
                  onChangeText={setCredentialCode}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Palavra-passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#8B99A1"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
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
                {isRegistering
                  ? 'Já possui registo? '
                  : 'Ainda não tem conta? '}
                <Text style={styles.switchPromptHighlight}>
                  {isRegistering ? 'Iniciar sessão' : 'Criar acesso agora'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.offWhite,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  card: {
    backgroundColor: BRAND_COLORS.branco,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E1E6E9',
    shadowColor: '#1D2F36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F4',
    borderRadius: 10,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: BRAND_COLORS.branco,
    shadowColor: '#1D2F36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#52636B',
  },
  tabTextActive: {
    color: BRAND_COLORS.azulEscuro,
    fontWeight: '700',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND_COLORS.azulEscuro,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND_COLORS.azulEscuro,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D8E0E5',
    backgroundColor: '#F8FAFB',
  },
  roleButtonSelected: {
    borderColor: BRAND_COLORS.laranjaSol,
    backgroundColor: '#FDF4F0',
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52636B',
  },
  roleTitleSelected: {
    color: BRAND_COLORS.azulEscuro,
  },
  roleSubtitle: {
    fontSize: 11,
    color: '#6C7D86',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#CBD5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: BRAND_COLORS.azulEscuro,
    backgroundColor: '#F8FAFB',
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.azulEscuro,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: BRAND_COLORS.branco,
    fontSize: 15,
    fontWeight: '700',
  },
  switchPrompt: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchPromptText: {
    fontSize: 13,
    color: '#52636B',
  },
  switchPromptHighlight: {
    color: BRAND_COLORS.laranjaSol,
    fontWeight: '700',
  },
});