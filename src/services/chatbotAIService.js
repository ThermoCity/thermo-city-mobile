import axios from 'axios';

const API_CHATBOT_SAUDE_URL = process.env.EXPO_PUBLIC_API_JAVA_CHATBOT_SAUDE_IA;


// -------------------- SERVICE DA API ASSISTENTE DE IA NO CHAT JAVA  --------------------


export const sendHealthChatMessageService = async ({ conversationId, message }) => {
  if (!API_CHATBOT_SAUDE_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_NET_CHATBOT_SAUDE_IA não definida no .env');
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const payload = {
      conversationId: String(conversationId),
      message: String(message || '').trim(),
    };

    const response = await axios.post(API_CHATBOT_SAUDE_URL, payload, config);
    const data = response.data;

    // Extrai a resposta independentemente da chave usada no DTO do backend
    const replyText =
      typeof data === 'string'
        ? data
        : data?.reply ||
          data?.answer ||
          data?.response ||
          data?.message ||
          data?.conteudo ||
          'Não foi possível interpretar a resposta do assistente.';

    return {
      conversationId: data?.conversationId || payload.conversationId,
      reply: replyText,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  } catch (error) {
    console.error('Erro na API do Chatbot de Saúde:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        'Não foi possível obter resposta do assistente no momento.'
    );
  }
};