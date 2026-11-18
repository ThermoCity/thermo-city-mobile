import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { BRAND_COLORS, THEMES } from '../theme/thermoTheme';
import { useAuth } from '../context/AuthProvider';
import { sendHealthChatMessageService } from '../services/chatbotAIService';
import ChangeThemeBtn from '../components/ThemeToggleButton';

type Message = {
  id: string;
  text: string;
  sender: 'assistant' | 'user';
  time: string;
  isError?: boolean;
};

const getCurrentTime = () =>
  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// Normaliza o nome do usuário para evitar espaços/caracteres especiais no conversationId
const sanitizeUserName = (name?: string) => {
  if (!name || !name.trim()) return 'usuario';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function HealthChatScreen() {
  const { user } = useAuth();
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sessionUuid, setSessionUuid] = useState<string>(() => Crypto.randomUUID());
  const scrollViewRef = useRef<ScrollViewInstance>(null);

  const isDarkMode = internalDarkMode;
  const theme = isDarkMode ? THEMES.dark : THEMES.light;

  const toggleTheme = () => {
    setInternalDarkMode((prev) => !prev);
  };

  // Concatena: <nome-do-usuario>-<randomUUID>
  const conversationId = useMemo(() => {
    const cleanName = sanitizeUserName(user?.name);
    return `${cleanName}-${sessionUuid}`;
  }, [user?.name, sessionUuid]);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      text: 'Olá! Sou o Assistente Térmico ThermoCity. Posso ajudar com orientações de primeiros socorros de acordo com os protocolos do Ministério da Saúde e Defesa Civil. Como posso ajudar?',
      sender: 'assistant',
      time: getCurrentTime(),
    },
  ]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  const handleSendMessage = async (rawMessage?: string) => {
    const textToSend = (rawMessage ?? inputText).trim();
    if (!textToSend || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!rawMessage) {
      setInputText('');
    }
    setIsSending(true);

    try {
      const result = await sendHealthChatMessageService({
        conversationId,
        message: textToSend,
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        text: result.reply,
        sender: 'assistant',
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        text:
          error?.message ||
          'Não foi possível conectar ao assistente agora. Em emergências médicas, ligue 192 (SAMU).',
        sender: 'assistant',
        time: getCurrentTime(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setSessionUuid(Crypto.randomUUID());
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        text: 'Conversa reiniciada. Qual dúvida sobre saúde ou calor extremo você gostaria de consultar?',
        sender: 'assistant',
        time: getCurrentTime(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.navHeader }]}>
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ───────── CABEÇALHO ───────── */}
        <View style={[styles.headerContainer, { backgroundColor: theme.navHeader }]}>
          <View style={styles.headerRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="medkit" size={22} color={BRAND_COLORS.laranjaSol} />
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Assistente de Saúde IA
                </Text>
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={11} color={BRAND_COLORS.azulEscuro} />
                </View>
              </View>
            </View>

            <ChangeThemeBtn isDarkMode={isDarkMode} onPress={toggleTheme} />

            <TouchableOpacity
              accessibilityLabel="Limpar conversa"
              activeOpacity={0.7}
              style={styles.optionsButton}
              onPress={handleClearChat}
            >
              <Ionicons name="refresh-outline" size={20} color={BRAND_COLORS.branco} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ───────── MENSAGENS ───────── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.dateBadge,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 138, 61, 0.16)'
                  : 'rgba(11, 26, 32, 0.08)',
              },
            ]}
          >
            <Text
              style={[
                styles.dateBadgeText,
                { color: isDarkMode ? BRAND_COLORS.laranjaSol : BRAND_COLORS.azulEscuro },
              ]}
            >
              Guias de Calor Extremo e Primeiros Socorros
            </Text>
          </View>

          {messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser
                      ? styles.bubbleUser
                      : [
                          styles.bubbleAssistant,
                          {
                            backgroundColor: theme.card,
                            borderColor: message.isError
                              ? BRAND_COLORS.laranjaSol
                              : theme.cardBorder,
                          },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.textUser : { color: theme.textPrimary },
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageTime,
                    { color: theme.textSecondary },
                    isUser ? styles.timeUser : styles.timeAssistant,
                  ]}
                >
                  {isUser ? `Você · ${message.time}` : `Assistente IA · ${message.time}`}
                </Text>
              </View>
            );
          })}

          {isSending ? (
            <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
              <View
                style={[
                  styles.messageBubble,
                  styles.bubbleAssistant,
                  styles.typingBubble,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <ActivityIndicator size="small" color={BRAND_COLORS.laranjaSol} />
                <Text style={[styles.typingText, { color: theme.textSecondary }]}>
                  Consultando guias de saúde...
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* ───────── RODAPÉ: INPUT ───────── */}
        <View
          style={[
            styles.footerContainer,
            { backgroundColor: theme.card, borderTopColor: theme.cardBorder },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#242B30' : '#F3F6F8',
                  color: theme.textPrimary,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Pergunte sobre insolação, hidratação, sinais..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isSending}
              onSubmitEditing={() => handleSendMessage()}
            />

            <TouchableOpacity
              accessibilityLabel="Enviar mensagem"
              activeOpacity={0.8}
              disabled={!inputText.trim() || isSending}
              onPress={() => handleSendMessage()}
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
            >
              <Ionicons name="send" size={18} color={BRAND_COLORS.azulEscuro} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  /* Cabeçalho */
  headerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 138, 61, 0.18)',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_COLORS.branco,
  },
  checkBadge: {
    marginLeft: 8,
    height: 16,
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: BRAND_COLORS.laranjaSol,
  },
  optionsButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 6,
  },

  /* Área do Chat */
  chatScroll: {
    flex: 1,
  },
  chatContentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 20,
  },
  dateBadge: {
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  messageWrapper: {
    marginBottom: 14,
    maxWidth: '86%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
  },
  messageWrapperAssistant: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    backgroundColor: BRAND_COLORS.azulEscuro,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  textUser: {
    color: BRAND_COLORS.branco,
  },
  typingText: {
    fontSize: 13.5,
    fontStyle: 'italic',
  },
  messageTime: {
    marginTop: 4,
    fontSize: 10,
  },
  timeUser: {
    textAlign: 'right',
  },
  timeAssistant: {
    textAlign: 'left',
  },

  /* Rodapé */
  footerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14.5,
  },
  sendButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.laranjaSol,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});