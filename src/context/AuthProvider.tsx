import React, { createContext, useState, useEffect, useContext } from 'react';
import { getStoredToken, getStoredUserId, logoutService } from '../services/thermoCityService';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await getStoredToken();
        const userId = await getStoredUserId();

        // if (token && userId) {
        //   const userData = await getUserService(userId);
        //   setUser(userData);
        //   setIsAuthenticated(true);
        // }
      } catch (error) {
        console.error('Sessão expirada ou erro ao carregar usuário:', error);
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
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);