import axios from "axios";
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_USER_CREATION_URL = process.env.EXPO_PUBLIC_API_JAVA_CADASTRO;
const API_LOGIN_URL = process.env.EXPO_PUBLIC_API_JAVA_LOGIN;


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

// ... mantenha o resto igual ...

export const getStoredUserId = async () => {
  return await storage.getItem(USER_ID_KEY); // Corrigido de getItemAsync para getItem
};

export const getStoredToken = async () => {
  return await storage.getItem(TOKEN_KEY); // Corrigido de getItemAsync para getItem
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




