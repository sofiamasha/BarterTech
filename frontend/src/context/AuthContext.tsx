import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, removeToken, setToken, Usuario } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (payload: { nome: string; email: string; senha: string; bio?: string; localizacao?: string; interesses?: string[] }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Usuario) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const perfil = await api.auth.me();
      setUser(perfil);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await api.auth.login({ email, senha });
    setToken(res.token);
    setUser(res.usuario);
  };

  const register = async (payload: { nome: string; email: string; senha: string; bio?: string; localizacao?: string; interesses?: string[] }) => {
    const res = await api.auth.register(payload);
    setToken(res.token);
    setUser(res.usuario);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const updateUser = (updated: Usuario) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
