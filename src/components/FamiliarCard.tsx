import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS, THEMES, ThemeToggles } from '../theme/thermoTheme';
import { shadow } from '../theme/shadowTheme';
import { Familiar } from '../interfaces/interfaces';

interface FamiliarListCardProps {
  familiars: Familiar[];
  onEdit: (item: Familiar) => void;
  onDelete: (item: Familiar) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  theme?: ThemeToggles;
  isDarkMode?: boolean;
}

const ACTION_SIZE = 64;
const ACTION_GAP = 8;
const OPEN_VALUE = -(ACTION_SIZE * 2 + ACTION_GAP * 3);

const DANGER = '#D9534F';

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export default function FamiliarListCard({
  familiars,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  refreshing,
  ListHeaderComponent,
  ListFooterComponent,
  theme = THEMES.light,
  isDarkMode = false,
}: FamiliarListCardProps) {
  const cardShadow = shadow(isDarkMode);

  const riskChip = {
    bg: isDarkMode ? 'rgba(225,108,66,0.18)' : '#FDEEE8',
    text: isDarkMode ? '#F2A68A' : '#B85130',
  };

  const renderItem = ({ item }: { item: Familiar }) => {
    const risks = [
      item.moraSozinho && { icon: 'person-outline', label: 'Mora sozinho' },
      item.mobilidadeReduzida && { icon: 'accessibility-outline', label: 'Mobilidade reduzida' },
      item.condicaoCronica && { icon: 'fitness-outline', label: 'Condição crônica' },
    ].filter(Boolean) as { icon: any; label: string }[];

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          cardShadow,
        ]}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isDarkMode ? 'rgba(225,108,66,0.18)' : '#FDEEE8' },
            ]}
          >
            <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.nome || 'Nome não informado'}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.telefone || 'Sem telefone'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.endereco || 'Sem endereço'}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-back" size={16} color={theme.textSecondary} style={styles.swipeHint} />
        </View>

        {risks.length > 0 && (
          <View style={[styles.tagsRow, { borderTopColor: theme.cardBorder }]}>
            {risks.map((r) => (
              <View key={r.label} style={[styles.tag, { backgroundColor: riskChip.bg }]}>
                <Ionicons name={r.icon} size={12} color={riskChip.text} />
                <Text style={[styles.tagText, { color: riskChip.text }]}>{r.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderHiddenItem = (data: { item: Familiar; index: number }, rowMap: any) => {
    const item = data.item;
    const rowKey = String(item.id || data.index);
    const closeRow = () => rowMap[rowKey]?.closeRow();

    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityLabel={`Editar ${item.nome}`}
          style={[styles.backBtn, { backgroundColor: BRAND_COLORS.laranjaSol }]}
          onPress={() => {
            closeRow();
            onEdit(item);
          }}
        >
          <Ionicons name="pencil" size={18} color={BRAND_COLORS.azulEscuro} />
          <Text style={[styles.backBtnText, { color: BRAND_COLORS.azulEscuro }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityLabel={`Excluir ${item.nome}`}
          style={[styles.backBtn, { backgroundColor: DANGER }]}
          onPress={() => {
            closeRow();
            onDelete(item);
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={[styles.backBtnText, { color: '#FFFFFF' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SwipeListView
      data={familiars}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={OPEN_VALUE}
      previewRowKey={familiars[0]?.id ? String(familiars[0].id) : '0'}
      previewOpenValue={-40}
      previewOpenDelay={1200}
      disableRightSwipe
      keyExtractor={(item, index) => String(item?.id || index)}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponentStyle={ListHeaderComponent}
      ListFooterComponentStyle={ListFooterComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View
          style={[
            styles.empty,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            cardShadow,
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: isDarkMode ? 'rgba(225,108,66,0.18)' : '#FDEEE8' },
            ]}
          >
            <Ionicons name="people-outline" size={30} color={BRAND_COLORS.laranjaSol} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            Nenhum familiar cadastrado
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            Adicione pessoas queridas para receber alertas de calor e orientações personalizadas.
          </Text>
          {onAdd && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.emptyBtn, { backgroundColor: theme.accentActionBg }]}
              onPress={onAdd}
            >
              <Ionicons name="add" size={18} color={theme.accentActionText} />
              <Text style={[styles.emptyBtnText, { color: theme.accentActionText }]}>
                Adicionar familiar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, 
  },

  /* Card */
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_COLORS.laranjaSol,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
  },
  swipeHint: {
    opacity: 0.35,
    marginLeft: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Ações do swipe - Ajustado para acompanhar a altura dinâmica do card */
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // Alterado de 'stretch' para 'center' para centralizar verticalmente
    justifyContent: 'flex-end',
    paddingRight: ACTION_GAP,
    gap: ACTION_GAP,
  },
  backBtn: {
    width: ACTION_SIZE,
    height: '92%', // Ocupa quase toda a altura do card dinamicamente sem vazar
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Estado vazio */
  empty: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});