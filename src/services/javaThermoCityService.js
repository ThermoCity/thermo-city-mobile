import axios from "axios";
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// LOGIN E CADASTRO
const API_USER_CREATION_URL = process.env.EXPO_PUBLIC_API_JAVA_CADASTRO;
const API_LOGIN_URL = process.env.EXPO_PUBLIC_API_JAVA_LOGIN;

// CRUD DE FAMIILIARES VULNERAVEIS
const API_CRUD_FAMILIARES_URL = process.env.EXPO_PUBLIC_API_JAVA_CRUD_FAMILIARES_VULNERAVEIS;

// CRUD DO USUARIO LOGADO
const API_USER_URL = process.env.EXPO_PUBLIC_API_JAVA_USER;

// GET DOS LOCAIS DE REFÚGIO E UBS PARA CIDADÃO
const API_BASE_SERVICOS_TERRITORIAL = process.env.EXPO_PUBLIC_API_JAVA_BASE_SERVICOS_TERRITORIAL;

// GET NA LISTA DE PESSOAS VULNERAVEIS PARA AGENTE CONTATAR
const API_LISTA_AGENTE_URL = process.env.EXPO_PUBLIC_API_JAVA_LISTA_AGENTE;

// POST e GET NA LISTA DE CONTATOS DO AGENTE DE SAÚDE
const API_STATUS_CONTATO_AGENTE_URL = process.env.EXPO_PUBLIC_API_JAVA_LISTA_STATUS_CONTATO_AGENTE;

// API DE ORIENTAÇÃO DE CUIDADOS PARA PESSOAS VULNERAVEIS COM IA
const API_ORIENTACAO_VULNERAVEL_URL = process.env.EXPO_PUBLIC_API_JAVA_ASSISTENTE_IA;

const TOKEN_KEY = 'user_token';
const USER_ID_KEY = 'user_id';


// MANIPULAÇÃO DO TOKEN E USER ID PARA PERSISTENCIA DE SESSÃO

const storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};


export const getStoredUserId = async () => {
  return await storage.getItem(USER_ID_KEY);
};

export const getStoredToken = async () => {
  return await storage.getItem(TOKEN_KEY); 
};

const getAuthConfig = async () => {
  try {
    const token =   await storage.getItem(TOKEN_KEY);
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
  } catch (error) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
  }
};


// -------------------- SERVICE DA API AUTENTICAÇÃO SIGNIN E SIGNUP JAVA  --------------------

// API SIGNUP SERVICE
export const registerService = async (nome, email, senha, telefone, cpf, cep) => {
  try {
    const payload = {
      nome: nome.trim(),
      email: email.trim(),
      senha,
      telefone: telefone.replace(/\D/g, ''),
      cpf: cpf.replace(/\D/g, ''),          
      cep: cep.replace(/\D/g, ''),           
    };

    const response = await axios.post(API_USER_CREATION_URL, payload);
    const token = response.data.token || response.data.accessToken;
    const userId = response.data.idResponsavel || response.data.id || response.data.userId;

    if (token) {
      await storage.setItem(TOKEN_KEY, String(token));
    }
    if (userId) {
      await storage.setItem(USER_ID_KEY, String(userId));
    }

    return response.data;
  } catch (error) {
    console.log('Status do erro:', error.response?.status);
    console.log('Detalhe exato retornado pela API:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(error.response?.data?.message || 'Erro ao realizar o cadastro.');
  }
};

// API SIGNIN SERVICE
export const loginService = async (email, senha) => {
  try {
    const response = await axios.post(API_LOGIN_URL, { email, senha });

    const token = typeof response.data === 'string' 
      ? response.data 
      : (response.data.token || response.data.accessToken);
      
    const userId = response.data.idResponsavel || response.data.id;

    if (token) {
      await storage.setItem(TOKEN_KEY, String(token));
    }
    if (userId) {
      await storage.setItem(USER_ID_KEY, String(userId));
    }

    return { token, userData: response.data };
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    throw new Error(error.response?.data?.message || 'Credenciais inválidas ou erro no servidor.');
  }
};

export const logoutService = async () => {
  try {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Erro ao remover o token/usuário:', error);
  }
};


// -------------------- SERVICE DA API CRUD FAMILIARES JAVA  --------------------

// API PARA GESTAO DOS FAMILIARES
export const registerVulnerablePersonService = async (familiarData) => {
  try {
    const config = await getAuthConfig();

    const payload = {
      nome: familiarData.nome.trim(),
      dataNascimento: familiarData.dataNascimento, 
      sexo: familiarData.sexo,                     
      telefone: familiarData.telefone,            
      endereco: familiarData.endereco.trim(),
      cep: familiarData.cep,                       
      latitude: Number(familiarData.latitude),
      longitude: Number(familiarData.longitude),
      moraSozinho: Boolean(familiarData.moraSozinho),
      mobilidadeReduzida: Boolean(familiarData.mobilidadeReduzida),
      condicaoCronica: Boolean(familiarData.condicaoCronica),
      contatoReferenciaNome: familiarData.contatoReferenciaNome?.trim() || '',
      contatoReferenciaTelefone: familiarData.contatoReferenciaTelefone || '',
      consentimentoLgpd: Boolean(familiarData.consentimentoLgpd),
    };

    const response = await axios.post(API_CRUD_FAMILIARES_URL, payload, config);
    return response.data;
  } catch (error) {
    console.log('Status do erro (.NET):', error.response?.status);
    console.log('Detalhe retornado pela API .NET:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.title ||
      'Erro ao cadastrar o familiar vulnerável.'
    );
  }
};

export const getFamilyMembersService = async () => {
  try {
    const config = await getAuthConfig();
    console.log('Tentando buscar na URL:', API_CRUD_FAMILIARES_URL);

    const response = await axios.get(API_CRUD_FAMILIARES_URL, config);
    
    const data = response.data;

    if (data && Array.isArray(data.conteudo)) {
      return data.conteudo;
    }
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro detalhado ao buscar familiares:', {
      mensagem: error.message,
      respostaServidor: error.response?.data,
      status: error.response?.status,
      urlUtilizada: API_CRUD_FAMILIARES_URL,
    });
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Não foi possível carregar os familiares.'
    );
  }
};

export const updateFamilyMemberService = async (id, familiarData) => {
  try {
    const config = await getAuthConfig();
    const response = await axios.put(`${API_CRUD_FAMILIARES_URL}/${id}`, familiarData, config);
    return response.data;
  } catch (error) {
    console.log('Erro ao atualizar familiar:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Não foi possível atualizar o familiar.');
  }
};

export const deleteFamilyMemberService = async (id) => {
  try {
    const config = await getAuthConfig();
    const response = await axios.delete(`${API_CRUD_FAMILIARES_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.log('Erro ao deletar familiar:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Não foi possível remover o familiar.');
  }
};


// -------------------- SERVICE DA API USER JAVA  --------------------

// SERVICE PARA UPDATE DO USUARIO

export const getUserService = async () => {
  try {
    const config = await getAuthConfig();
    const response = await axios.get(API_USER_URL, config);
    console.log(response.data.nome);
    return response.data;
  } catch (error) {
    console.error('Erro no getUserService:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar dados do usuário.');
  }
};

export const updateUserService = async (userData) => {
  try {
    const config = await getAuthConfig();
    const response = await axios.put(API_USER_URL, userData, config);
    return response.data;
  } catch (error) {
    console.error('Erro no updateUserService:', error);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar os dados do usuário.');
  }
};

// -------------------- SERVICE DA API TERRITORIAL JAVA  --------------------

// Helper para calcular distância em km (Haversine) caso distanciaMetros venha null
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

// API TERRITORIAL (UBS E REFÚGIOS)
export const getTerritorialServices = async (userLat = -22.1256, userLon = -51.3889) => {
  if (!API_BASE_SERVICOS_TERRITORIAL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_BASE_SERVICOS_TERRITORIAL não definida no .env');
  }

  try {
    const config = await getAuthConfig();
    const response = await axios.get(API_BASE_SERVICOS_TERRITORIAL, config);
    const rawList = Array.isArray(response.data) ? response.data : [];

    // Normaliza o JSON da API para o formato SupportPoint usado no mapa e nos cards
    return rawList
      .filter((item) => item.lat !== null && item.lon !== null)
      .map((item) => {
        const isUbs = String(item.tipo || '').toUpperCase().includes('UBS');
        const distanceKm =
          item.distanciaMetros !== null && item.distanciaMetros !== undefined
            ? Number((item.distanciaMetros / 1000).toFixed(2))
            : calculateDistanceKm(userLat, userLon, Number(item.lat), Number(item.lon));

        return {
          id: String(item.id),
          name: item.nome || 'Ponto de Apoio',
          type: isUbs ? 'ubs' : 'refugio',
          address: item.bairro ? `${item.endereco} - ${item.bairro}` : item.endereco || 'Endereço não informado',
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          distanceKm,
          status: item.fonte ? `Fonte: ${item.fonte}` : 'Ativo',
          hours: isUbs ? 'Seg a Sex · 07h às 17h' : 'Consulte disponibilidade local',
          features: item.categoria || (isUbs ? 'Atendimento básico de saúde e hidratação' : 'Espaço sugerido para abrigo térmico'),
        };
      });
  } catch (error) {
    console.error('Erro ao buscar pontos territoriais:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao carregar pontos de apoio no mapa.');
  }
};


// -------------------- SERVICE DA API AGENTE DE SAÚDE JAVA  --------------------

// API LISTA PRIORITÁRIA DO AGENTE DE SAÚDE
export const getAgentPriorityListService = async () => {
  if (!API_LISTA_AGENTE_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_LISTA_AGENTE não definida no .env');
  }

  try {
    const config = await getAuthConfig();
    const response = await axios.get(API_LISTA_AGENTE_URL, config);
    const data = response.data || {};

    const nivelCalor = data.nivelCalor || 1;
    const heatLevelCode = `NC${nivelCalor}`;
    const rawItems = Array.isArray(data.itens?.conteudo) ? data.itens.conteudo : [];

    const mappedContacts = rawItems.map((item) => {
      const pessoa = item.pessoa || {};
      const refugio = item.refugioMaisProximo;
      const isPendente = String(item.statusContato || '').toUpperCase() === 'PENDENTE';

      const distanceText =
        refugio?.distanciaMetros !== null && refugio?.distanciaMetros !== undefined
          ? ` (${refugio.distanciaMetros}m)`
          : '';

      return {
        id: String(item.id),
        pessoaId: pessoa.id,
        posicao: item.posicao,
        pontuacao: item.pontuacao,
        name: pessoa.nome || 'Cidadão não identificado',
        age: pessoa.idade,
        phone: pessoa.telefone || '',
        referenceName: pessoa.contatoReferenciaNome || '',
        referencePhone: pessoa.contatoReferenciaTelefone || '',
        sector: item.setorBairro
          ? `${item.setorBairro} · Setor ${item.setorCodigo || ''}`
          : `${item.ubsNome || data.ubsNome || 'UBS Local'} · Setor ${item.setorCodigo || ''}`,
        heatLevel: heatLevelCode,
        reason: item.motivos || 'Monitoramento preventivo',
        nearestShelter: refugio ? `${refugio.nome}${distanceText}` : null,
        status: isPendente ? 'pendente' : 'contatado',
        lastAction: item.ultimoContatoEm
          ? `Contatado em ${new Date(item.ultimoContatoEm).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : undefined,
      };
    });

    return {
      ubsNome: data.ubsNome || '',
      nivelCalor,
      contacts: mappedContacts,
    };
  } catch (error) {
    console.error('Erro ao buscar lista prioritária do agente:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Não foi possível carregar a lista prioritária.');
  }
};

// API DE REGISTRO E LISTAGEM DE CONTATOS FEITOS PELO AGENTE DE SAÚDE
export const registerAgentContactStatusService = async ({
  pessoaId,
  resultado = 'CONTATADO_BEM',
  observacao,
}) => {
  if (!API_STATUS_CONTATO_AGENTE_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_LISTA_STATUS_CONTATO_AGENTE não definida no .env');
  }

  try {
    const config = await getAuthConfig();
    const payload = {
      pessoaId: Number(pessoaId),
      resultado,
      observacao: String(observacao || '').trim(),
    };

    const response = await axios.post(API_STATUS_CONTATO_AGENTE_URL, payload, config);
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar status de contato:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Não foi possível registrar o contato no servidor.'
    );
  }
};

export const getAgentContactStatusListService = async (pagina = 0, tamanho = 50) => {
  if (!API_STATUS_CONTATO_AGENTE_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_LISTA_STATUS_CONTATO_AGENTE não definida no .env');
  }

  try {
    const config = await getAuthConfig();
    const response = await axios.get(API_STATUS_CONTATO_AGENTE_URL, {
      ...config,
      params: { pagina, tamanho },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao listar histórico de contatos:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Não foi possível carregar o histórico de contatos.'
    );
  }
};

export const getAgentContactStatusByIdService = async (id) => {
  if (!API_STATUS_CONTATO_AGENTE_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_LISTA_STATUS_CONTATO_AGENTE não definida no .env');
  }

  try {
    const config = await getAuthConfig();
    const response = await axios.get(`${API_STATUS_CONTATO_AGENTE_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contato ID ${id}:`, error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Não foi possível carregar os detalhes do contato.'
    );
  }
};


// -------------------- SERVICE DA API ASSISTENTE DE IA PARA ATENDIMENTO PERSONALIZADO JAVA  --------------------

// API DE ORIENTAÇÃO DE CUIDADOS PARA PESSOAS VULNERAVEIS COM IA
export const getVulnerablePersonGuidanceService = async (pessoaId) => {
  if (!API_ORIENTACAO_VULNERAVEL_URL) {
    throw new Error('Variável EXPO_PUBLIC_API_JAVA_ORIENTACAO_VULNERAVEL não definida no .env');
  }

  if (!pessoaId) {
    throw new Error('ID da pessoa vulnerável não fornecido.');
  }

  try {
    const token = await getStoredToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const url = `${API_ORIENTACAO_VULNERAVEL_URL.replace(/\/$/, '')}/${pessoaId}/orientacao`;
    const response = await axios.get(url, config);
    const data = response.data || {};

    return {
      pessoaId: data.pessoaId,
      data: data.data,
      nivelCalor: data.nivelCalor,
      nivelNome: data.nivelNome,
      roteiro: Array.isArray(data.roteiro) ? data.roteiro : [],
      sinaisAlerta: Array.isArray(data.sinaisAlerta) ? data.sinaisAlerta : [],
      refugio: data.refugio || null,
      fontes: Array.isArray(data.fontes) ? data.fontes : [],
      aviso: data.aviso || '',
      geradoEm: data.geradoEm,
    };
  } catch (error) {
    console.error('Erro ao buscar orientação da pessoa vulnerável:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        'Não foi possível carregar as orientações baseadas em IA para este cidadão.'
    );
  }
};