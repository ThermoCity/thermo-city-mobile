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
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ThermoLogo from '../components/ThermoLogo';
import { BRAND_COLORS } from '../theme/thermoTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  registerVulnerablePersonService,
  updateFamilyMemberService,
} from '../services/javaThermoCityService';
import { formatCep, formatDate, formatPhone } from '../utils/inputsMaskUtils';

type FieldKey =
  | 'nome'
  | 'dataNascimento'
  | 'telefone'
  | 'endereco'
  | 'cep'
  | 'contatoReferenciaNome'
  | 'contatoReferenciaTelefone';

// Coordenadas padrão de Presidente Prudente caso a geocodificação não encontre o endereço exato
const DEFAULT_COORDS = {
  latitude: -22.1256,
  longitude: -51.3889,
};

export default function RegisterForms() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Se veio um familiar COM id → edição. Sem id (ou sem param) → criação.
  const familiarParam = route.params?.familiarToEdit;
  const isEditing = !!familiarParam?.id;

  const initialCep = formatCep(String(familiarParam?.cep ?? ''));

  // Estados dos campos (hidratados com o familiar quando em edição)
  const [nome, setNome] = useState<string>(familiarParam?.nome ?? '');
  const [dataNascimento, setDataNascimento] = useState<string>(
    formatDate(String(familiarParam?.dataNascimento ?? '').slice(0, 10))
  );
  const [sexo, setSexo] = useState<'M' | 'F' | ''>(
    familiarParam?.sexo === 'M' || familiarParam?.sexo === 'F' ? familiarParam.sexo : ''
  );
  const [telefone, setTelefone] = useState<string>(formatPhone(String(familiarParam?.telefone ?? '')));
  const [endereco, setEndereco] = useState<string>(familiarParam?.endereco ?? '');
  const [cep, setCep] = useState<string>(initialCep);
  const [moraSozinho, setMoraSozinho] = useState<boolean>(!!familiarParam?.moraSozinho);
  const [mobilidadeReduzida, setMobilidadeReduzida] = useState<boolean>(!!familiarParam?.mobilidadeReduzida);
  const [condicaoCronica, setCondicaoCronica] = useState<boolean>(!!familiarParam?.condicaoCronica);
  const [contatoReferenciaNome, setContatoReferenciaNome] = useState<string>(
    familiarParam?.contatoReferenciaNome ?? ''
  );
  const [contatoReferenciaTelefone, setContatoReferenciaTelefone] = useState<string>(
    formatPhone(String(familiarParam?.contatoReferenciaTelefone ?? ''))
  );
  // Em edição o consentimento já foi dado no cadastro, então começa marcado
  const [consentimentoLgpd, setConsentimentoLgpd] = useState<boolean>(
    isEditing ? familiarParam?.consentimentoLgpd ?? true : false
  );

  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<FieldKey | null>(null);

  const inputStyle = (key: FieldKey) => [
    styles.input,
    focused === key && styles.inputFocused,
  ];

  const focusProps = (key: FieldKey) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused((current) => (current === key ? null : current)),
  });

  const goBackToList = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const resolveCoordinates = async (addressText: string, cepText: string) => {
    try {
      const fullQuery = `${addressText}, Presidente Prudente - SP, ${cepText}, Brasil`;
      const results = await Location.geocodeAsync(fullQuery);
      if (results && results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }
    } catch (e) {
      console.log('Geocoding falhou, usando coordenadas padrão:', e);
    }
    return DEFAULT_COORDS;
  };

  const handleSubmit = async () => {
    if (!nome || !dataNascimento || !sexo || !telefone || !cep || !endereco) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios principais.');
      return;
    }

    if (dataNascimento.length < 10) {
      Alert.alert('Atenção', 'Informe a data de nascimento completa (AAAA-MM-DD).');
      return;
    }

    if (cep.length < 9) {
      Alert.alert('Atenção', 'Informe um CEP completo.');
      return;
    }

    if (!consentimentoLgpd) {
      Alert.alert('Atenção', 'É necessário aceitar os termos de consentimento da LGPD.');
      return;
    }

    setIsLoading(true);
    try {
      // Na edição, só refaz a geocodificação se endereço/CEP mudaram e já houver coordenadas salvas
      const addressChanged =
        !isEditing || endereco !== (familiarParam?.endereco ?? '') || cep !== initialCep;
      const hasSavedCoords =
        familiarParam?.latitude != null && familiarParam?.longitude != null;

      const coords =
        !addressChanged && hasSavedCoords
          ? {
              latitude: Number(familiarParam.latitude),
              longitude: Number(familiarParam.longitude),
            }
          : await resolveCoordinates(endereco, cep);

      const payload = {
        nome: nome.trim(),
        dataNascimento,
        sexo,
        telefone,
        endereco: endereco.trim(),
        cep,
        latitude: coords.latitude,
        longitude: coords.longitude,
        moraSozinho,
        mobilidadeReduzida,
        condicaoCronica,
        contatoReferenciaNome,
        contatoReferenciaTelefone,
        consentimentoLgpd,
      };

      if (isEditing) {
        await updateFamilyMemberService(familiarParam.id, { id: familiarParam.id, ...payload });
      } else {
        await registerVulnerablePersonService(payload);
      }

      Alert.alert(
        'Sucesso',
        isEditing
          ? `${nome.trim()} foi atualizado com sucesso!`
          : 'Familiar vulnerável cadastrado com sucesso!',
        [{ text: 'OK', onPress: goBackToList }]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.message ||
          (isEditing
            ? 'Não foi possível atualizar o familiar.'
            : 'Não foi possível realizar o cadastro.')
      );
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
        >
          {/* Cabeçalho */}
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity
                accessibilityLabel="Voltar"
                activeOpacity={0.75}
                style={styles.backButton}
                onPress={goBackToList}
              >
                <Ionicons name="arrow-back" size={19} color={BRAND_COLORS.branco} />
              </TouchableOpacity>
              <ThermoLogo variant="dark" showText={false} size={44} />
              <View style={styles.backButton} pointerEvents="none" />
            </View>

            <Text style={styles.heroTitle}>
              {isEditing ? 'Editar Familiar' : 'Cadastro de Familiar Vulnerável'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isEditing
                ? `Modificando as informações de ${nome || 'seu familiar'}.`
                : 'Proteção e monitoramento ativo para quem você ama em dias de calor extremo.'}
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.content}>
            <View style={styles.card}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput
                  style={inputStyle('nome')}
                  placeholder="Ex.: Dona Aparecida Souza"
                  value={nome}
                  onChangeText={setNome}
                  {...focusProps('nome')}
                />
              </View>

              {/* Data de Nascimento e Sexo */}
              <View style={styles.rowGroup}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Nascimento (AAAA-MM-DD) *</Text>
                  <TextInput
                    style={inputStyle('dataNascimento')}
                    placeholder="1948-03-15"
                    keyboardType="numeric"
                    maxLength={10}
                    value={dataNascimento}
                    onChangeText={(t) => setDataNascimento(formatDate(t))}
                    {...focusProps('dataNascimento')}
                  />
                </View>

                <View style={[styles.inputGroup, { width: 110 }]}>
                  <Text style={styles.label}>Sexo *</Text>
                  <View style={styles.sexRow}>
                    <TouchableOpacity
                      style={[styles.sexBtn, sexo === 'F' && styles.sexBtnActive]}
                      onPress={() => setSexo('F')}
                    >
                      <Text style={[styles.sexText, sexo === 'F' && styles.sexTextActive]}>F</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sexBtn, sexo === 'M' && styles.sexBtnActive]}
                      onPress={() => setSexo('M')}
                    >
                      <Text style={[styles.sexText, sexo === 'M' && styles.sexTextActive]}>M</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Telefone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone de Contato *</Text>
                <TextInput
                  style={inputStyle('telefone')}
                  placeholder="(18) 99999-1234"
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={telefone}
                  onChangeText={(t) => setTelefone(formatPhone(t))}
                  {...focusProps('telefone')}
                />
              </View>

              {/* Endereço */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço Completo *</Text>
                <TextInput
                  style={inputStyle('endereco')}
                  placeholder="Rua Siqueira Campos, 1200 - Centro"
                  value={endereco}
                  onChangeText={setEndereco}
                  {...focusProps('endereco')}
                />
              </View>

              {/* CEP */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP *</Text>
                <TextInput
                  style={inputStyle('cep')}
                  placeholder="19010-000"
                  keyboardType="numeric"
                  maxLength={9}
                  value={cep}
                  onChangeText={(t) => setCep(formatCep(t))}
                  {...focusProps('cep')}
                />
              </View>

              {/* Condições Especiais (Switches) */}
              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Mora sozinho(a)?</Text>
                  <Switch
                    value={moraSozinho}
                    onValueChange={setMoraSozinho}
                    trackColor={{ false: '#C3CDD3', true: BRAND_COLORS.laranjaSol }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Possui mobilidade reduzida?</Text>
                  <Switch
                    value={mobilidadeReduzida}
                    onValueChange={setMobilidadeReduzida}
                    trackColor={{ false: '#C3CDD3', true: BRAND_COLORS.laranjaSol }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Possui condição crônica de saúde?</Text>
                  <Switch
                    value={condicaoCronica}
                    onValueChange={setCondicaoCronica}
                    trackColor={{ false: '#C3CDD3', true: BRAND_COLORS.laranjaSol }}
                  />
                </View>
              </View>

              {/* Contato de Referência */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Contato de Referência</Text>
                <TextInput
                  style={inputStyle('contatoReferenciaNome')}
                  placeholder="Carlos Souza (filho)"
                  value={contatoReferenciaNome}
                  onChangeText={setContatoReferenciaNome}
                  {...focusProps('contatoReferenciaNome')}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone do Contato de Referência</Text>
                <TextInput
                  style={inputStyle('contatoReferenciaTelefone')}
                  placeholder="(18) 98888-7777"
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={contatoReferenciaTelefone}
                  onChangeText={(t) => setContatoReferenciaTelefone(formatPhone(t))}
                  {...focusProps('contatoReferenciaTelefone')}
                />
              </View>

              {/* Consentimento LGPD */}
              <View style={styles.lgpdRow}>
                <Switch
                  value={consentimentoLgpd}
                  onValueChange={setConsentimentoLgpd}
                  trackColor={{ false: '#C3CDD3', true: '#185A43' }}
                />
                <Text style={styles.lgpdText}>
                  Concordo com os termos de tratamento de dados para fins de monitoramento e assistência em saúde (LGPD) *.
                </Text>
              </View>

              {/* Botão Salvar */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isEditing ? 'save-outline' : 'person-add-outline'}
                  size={19}
                  color={BRAND_COLORS.azulEscuro}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitButtonText}>
                  {isLoading
                    ? isEditing
                      ? 'Atualizando...'
                      : 'Salvando...'
                    : isEditing
                      ? 'Salvar Alterações'
                      : 'Cadastrar Familiar'}
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
    paddingTop: 12,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTopRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -28,
  },
  card: {
    backgroundColor: BRAND_COLORS.branco,
    borderRadius: 24,
    padding: 20,
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
  inputGroup: {
    marginBottom: 14,
  },
  rowGroup: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E525B',
    marginBottom: 6,
  },
  input: {
    height: 50,
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
  sexRow: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#F1F4F6',
    borderRadius: 14,
    overflow: 'hidden',
  },
  sexBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sexBtnActive: {
    backgroundColor: BRAND_COLORS.azulEscuro,
  },
  sexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#52636B',
  },
  sexTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E1E6E9',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E525B',
    flex: 1,
    paddingRight: 10,
  },
  lgpdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#F1F4F6',
    padding: 12,
    borderRadius: 14,
  },
  lgpdText: {
    fontSize: 12,
    color: '#52636B',
    flex: 1,
    marginLeft: 10,
    lineHeight: 16,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLORS.laranjaSol,
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: BRAND_COLORS.azulEscuro,
    fontSize: 15,
    fontWeight: '800',
  },
});