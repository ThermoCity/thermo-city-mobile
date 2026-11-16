import axios from "axios";
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

export const getStoredUserId = async () => {
  return await storage.getItemAsync(USER_ID_KEY);
};

export const getStoredToken = async () => {
  return await storage.getItemAsync(TOKEN_KEY);
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
export const registerService = async (nome, email, senha, telefone, cpf, cep , papel = 'CIDADAO') => {
  try {
    const response = await axios.post(API_CREATION_URL, { nome, email, senha, telefone, cpf, cep, papel});
    
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
    console.error('Erro na requisição de cadastro:', error);
    throw new Error(error.response?.data?.message || 'Erro ao realizar o cadastro.');
  }
};

export const loginService = async (email, senha) => {
  try {
    const response = await axios.post(API_LOGIN_URL, { email, senha });

    const token = response.data.token || response.data.accessToken || response.data;
    const userId = response.data.idResponsavel || response.data.id;

    if (token) {
      await storage.setItem(TOKEN_KEY, String(token));
    }
    if (userId) {
      await storage.setItem(USER_ID_KEY, String(userId));
    }

    return response.data;
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




