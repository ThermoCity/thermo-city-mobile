import axios from "axios";
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_USER_CREATION_URL = process.env.EXPO_PUBLIC_API_JAVA_CADASTRO;
const API_LOGIN_URL = process.env.EXPO_PUBLIC_API_JAVA_LOGIN;

const API_CRUD_FAMILIARES_URL = process.env.EXPO_PUBLIC_API_NET_CRUD_FAMILIARES_VULNERAVEIS;

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

// API JAVA SERVICE
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

// API .NET SERVICE
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