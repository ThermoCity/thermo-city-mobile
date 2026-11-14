import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, type } from '../theme';
import { Field, Button } from '../components/ThermoLogo';
import { signIn, signUp, DEMO_LOGIN } from '../auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES = [
  { id: 'agent', title: 'Agente de saúde', desc: 'Busca ativa e contato com pessoas prioritárias', icon: 'medkit-outline' },
  { id: 'citizen', title: 'Cidadão', desc: 'Alertas e refúgios na sua região', icon: 'person-outline' },
];

export default function LoginScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'agent',
    registration: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';
  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError('');
  };

  const validate = () => {
    const e = {};
    if (isSignup && form.name.trim().length < 3) e.name = 'Informe seu nome completo.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Digite um e-mail válido, como nome@dominio.com.';
    if (!form.password) e.password = 'Digite sua senha.';
    if (isSignup) {
      if (form.password.length < 8) e.password = 'Use pelo menos 8 caracteres.';
      if (form.confirm !== form.password) e.confirm = 'As senhas não são iguais.';
      if (form.role === 'agent' && form.registration.trim().length < 4)
        e.registration = 'Informe sua matrícula funcional para acessar a área restrita.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setFormError('');
    try {
      const user = isSignup ? await signUp(form) : await signIn(form.email, form.password);
      onAuthenticated(user);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm((f) => ({ ...f, ...DEMO_LOGIN }));
    setErrors({});
    setFormError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="ThermoCity. O calor é invisível, o cuidado não."
          />

          <View style={styles.card}>
            <View style={styles.tabs} accessibilityRole="tablist">
              {[
                ['login', 'Entrar'],
                ['signup', 'Criar conta'],
              ].map(([id, label]) => {
                const active = mode === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => switchMode(id)}
                    style={[styles.tab, active && styles.tabActive]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[type.title, { marginBottom: 4 }]}>
              {isSignup ? 'Crie sua conta' : 'Que bom ver você'}
            </Text>
            <Text style={[type.small, { marginBottom: space.xl }]}>
              {isSignup
                ? 'Escolha seu perfil e preencha os dados para começar.'
                : 'Entre para acompanhar o calor na sua região.'}
            </Text>

            {isSignup && (
              <>
                <Text style={styles.label}>Seu perfil</Text>
                <View style={styles.roles}>
                  {ROLES.map((r) => {
                    const active = form.role === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => set('role')(r.id)}
                        style={[styles.role, active && styles.roleActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                          <Ionicons name={r.icon} size={20} color={active ? colors.offwhite : colors.blue} />
                        </View>
                        <Text style={styles.roleTitle}>{r.title}</Text>
                        <Text style={styles.roleDesc}>{r.desc}</Text>
                        {active && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.orange} style={styles.roleCheck} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Field
                  label="Nome completo"
                  icon="person-outline"
                  value={form.name}
                  onChangeText={set('name')}
                  error={errors.name}
                  autoCapitalize="words"
                  textContentType="name"
                  placeholder="Como você se chama"
                />
              </>
            )}

            <Field
              label="E-mail"
              icon="mail-outline"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="nome@dominio.com"
            />

            <Field
              label="Senha"
              icon="lock-closed-outline"
              secure
              value={form.password}
              onChangeText={set('password')}
              error={errors.password}
              textContentType={isSignup ? 'newPassword' : 'password'}
              placeholder={isSignup ? 'Mínimo de 8 caracteres' : 'Sua senha'}
            />

            {isSignup && (
              <Field
                label="Confirmar senha"
                icon="lock-closed-outline"
                secure
                value={form.confirm}
                onChangeText={set('confirm')}
                error={errors.confirm}
                placeholder="Repita a senha"
              />
            )}

            {isSignup && form.role === 'agent' && (
              <Field
                label="Matrícula funcional"
                icon="id-card-outline"
                value={form.registration}
                onChangeText={set('registration')}
                error={errors.registration}
                autoCapitalize="characters"
                placeholder="Ex.: AS-1024"
                hint="O acesso à lista de pessoas prioritárias é restrito à equipe de saúde."
              />
            )}

            {!isSignup && (
              <Pressable style={styles.forgot} hitSlop={8} accessibilityRole="link">
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            )}

            {!!formError && (
              <View style={styles.banner} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.bannerText}>{formError}</Text>
              </View>
            )}

            <Button
              title={isSignup ? 'Criar conta' : 'Entrar'}
              onPress={submit}
              loading={loading}
              style={{ marginTop: space.sm }} disabled={undefined} icon={undefined}            />

            <View style={styles.switchRow}>
              <Text style={type.small}>{isSignup ? 'Já tem conta?' : 'Ainda não tem conta?'}</Text>
              <Pressable onPress={() => switchMode(isSignup ? 'login' : 'signup')} hitSlop={8} accessibilityRole="button">
                <Text style={styles.link}>{isSignup ? 'Entrar' : 'Criar conta'}</Text>
              </Pressable>
            </View>
          </View>

          {!isSignup && (
            <Pressable onPress={fillDemo} style={styles.demo} accessibilityRole="button">
              <Ionicons name="flask-outline" size={16} color={colors.textMuted} />
              <Text style={styles.demoText}>Usar acesso de demonstração (agente de saúde)</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offwhite },
  scroll: { padding: space.xl, paddingBottom: space.xxl, alignItems: 'center' },
  logo: { width: 210, height: 175, marginTop: space.sm, marginBottom: space.lg },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: space.xl,
  },
  tab: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.blue },
  tabText: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: '#FFFFFF' },
  label: { fontSize: 14, fontWeight: '700', color: colors.blue, marginBottom: 6 },
  roles: { flexDirection: 'row', gap: space.md, marginBottom: space.lg },
  role: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleActive: { borderColor: colors.blue, backgroundColor: colors.bg },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  roleIconActive: { backgroundColor: colors.blue },
  roleTitle: { fontSize: 14, fontWeight: '700', color: colors.blue, marginBottom: 2 },
  roleDesc: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
  roleCheck: { position: 'absolute', top: 8, right: 8 },
  forgot: { alignSelf: 'flex-end', marginTop: -6, marginBottom: space.md },
  link: { fontSize: 14, fontWeight: '700', color: colors.blue, textDecorationLine: 'underline' },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: '#F8E9E9',
    borderWidth: 1,
    borderColor: '#E7C3C3',
    marginBottom: space.md,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: space.lg },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.lg, padding: space.sm },
  demoText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
