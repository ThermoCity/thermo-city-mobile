import React, { createContext, useState, useEffect, useContext } from 'react';
import { getStoredToken, logoutService } from '../services/javaThermoCityService';
import { decodeJWT, extractRoleFromToken } from '../utils/jwtUtils';

interface UserSession {
  email?: string;
  name?: string;
  role: 'agente' | 'cidadao';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  isLoading: boolean;
  signInWithToken: (token: string, extraData?: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
interface UserSession {
  id?: number;
  email?: string;
  name?: string;
  role: 'agente' | 'cidadao';
}

const signInWithToken = (token: string, extraData?: any) => {
  const decoded = decodeJWT(token);
  const role = extractRoleFromToken(token);

  setUser({
    id: decoded?.idUsuario,
    email: decoded?.sub,
    name: extraData?.nome || (role === 'agente' ? 'Agente de Saúde' : 'Cidadão'),
    role,
  });
  setIsAuthenticated(true);
};
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await getStoredToken();
        if (token) {
          const decoded = decodeJWT(token);
          // Verifica se o token não expirou
          const isExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;

          if (!isExpired) {
            signInWithToken(token);
          } else {
            await logoutService();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        await logoutService();
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const logout = async () => {
    await logoutService();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, signInWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);