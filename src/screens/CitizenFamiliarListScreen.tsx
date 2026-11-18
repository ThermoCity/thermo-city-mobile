import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThermoLogo from '../components/ThermoLogo';
import FamiliarListCard from '../components/FamiliarCard';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { getFamilyMembersService, deleteFamilyMemberService } from '../services/javaThermoCityService';
import ChangeThemeBtn from '../components/ThemeToggleButton';

export default function FamilyListScreen() {
  const navigation = useNavigation<any>();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [familiars, setFamiliars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const fabShadow = {
    elevation: 8,
    shadowColor: BRAND_COLORS.laranjaSol,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  };

  const attentionCount = familiars.filter(
    (f) => f.moraSozinho || f.mobilidadeReduzida || f.condicaoCronica
  ).length;

  const fetchFamiliars = async () => {
    try {
      const data = await getFamilyMembersService();
      setFamiliars(data || []);
    } catch (error: any) {
      Alert.alert('Atenção', error.message || 'Erro ao carregar lista de familiares.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFamiliars();
  };

  useFocusEffect(
    useCallback(() => {
      fetchFamiliars();
    }, [])
  );

  const handleDelete = (item: any) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja remover ${item.nome} do monitoramento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamilyMemberService(item.id);
              setFamiliars((prev) => prev.filter((fam) => fam.id !== item.id));
              Alert.alert('Sucesso', 'Familiar removido com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item: any) => {
    navigation.navigate('RegisterForms', { familiarToEdit: item });
  };

  const handleAdd = () => navigation.navigate('RegisterForms');

  const listHeader = (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Pessoas monitoradas
      </Text>
      {familiars.length > 0 && (
        <View style={styles.hintRow}>
          <Ionicons name="swap-horizontal-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Deslize um card para editar ou excluir
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.navHeader }]}>
      {/* ───────── HERO ───────── */}
      <View style={[styles.hero, { backgroundColor: theme.navHeader }]}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <ThermoLogo variant="dark" showText={false} size={30} />
            <View style={styles.titleBox}>
              <Text style={styles.title}>Familiares</Text>
              <Text style={styles.subtitle}>Quem você protege do calor</Text>
            </View>
          </View>

          <View style={styles.topBarActions}>
            <ChangeThemeBtn isDarkMode={isDarkMode} onPress={toggleTheme} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{familiars.length}</Text>
            <Text style={styles.statLabel}>
              {familiars.length === 1 ? 'vinculado' : 'vinculados'}
            </Text>
          </View>
          <View style={styles.statPill}>
            <View style={styles.statDot} />
            <Text style={styles.statValue}>{attentionCount}</Text>
            <Text style={styles.statLabel}>com atenção especial</Text>
          </View>
        </View>
      </View>

      {/* ───────── CORPO ───────── */}
      <View style={[styles.body, { backgroundColor: theme.background }]}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.laranjaSol} />
            <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
              Carregando familiares...
            </Text>
          </View>
        ) : (
          <FamiliarListCard
            familiars={familiars}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            ListHeaderComponent={listHeader}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}
      </View>

      {/* ───────── BOTÃO FLUTUANTE ───────── */}
      <TouchableOpacity
        style={[styles.fab, fabShadow]}
        onPress={handleAdd}
        accessibilityLabel="Adicionar familiar"
        accessibilityRole="button"
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={theme.accentActionText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Hero */
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 44,
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
  titleBox: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: BRAND_COLORS.branco,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  statValue: {
    color: BRAND_COLORS.branco,
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },

  /* Corpo */
  body: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingTop: 22,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
});