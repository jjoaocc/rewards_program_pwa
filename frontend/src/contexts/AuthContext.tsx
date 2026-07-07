// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient, getStoredToken, setStoredToken, removeStoredToken, ApiError, type ApiClientPort } from '../lib/api-client';
import type { AuthUser } from '../types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Resposta do POST /auth/login
interface LoginResponse {
  access_token: string;
  token_type: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
  client?: ApiClientPort;
}

export function AuthProvider({ children, client = apiClient }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Limpa sessão (usada tanto no logout manual quanto no 401 automático)
  const clearSession = useCallback(() => {
    setUser(null);
    removeStoredToken();
  }, []);

  // Busca os dados do usuário autenticado via GET /auth/me
  const fetchCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await client.get<{
        id: string;
        name: string;
        email: string;
      }>('/auth/me');

      return {
        id: data.id,
        name: data.name,
        email: data.email,
      };
    } catch {
      return null;
    }
  }, [client]);

  // Ao montar: verifica se já existe token salvo e valida no backend
  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Token existe → valida no backend
      const userData = await fetchCurrentUser();

      if (userData) {
        setUser(userData);
      } else {
        // Token inválido ou expirado → limpa tudo
        removeStoredToken();
      }

      setIsLoading(false);
    }

    restoreSession();
  }, [fetchCurrentUser]);

  // Escuta o evento global disparado pelo api-client quando recebe 401
  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearSession]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Autentica e recebe o JWT
      const { access_token } = await client.post<LoginResponse>(
        '/auth/login',
        { identifier, password },
        false, // não requer token (é o próprio login)
      );

      // 2. Persiste o token
      setStoredToken(access_token);

      // 3. Busca dados completos do usuário
      const userData = await fetchCurrentUser();

      if (!userData) {
        // Token veio mas /me falhou (situação inesperada)
        removeStoredToken();
        setIsLoading(false);
        return false;
      }

      setUser(userData);
      setIsLoading(false);
      return true;

    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`[Auth] Erro ${error.status}: ${error.message}`);
      }
      setIsLoading(false);
      return false;
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = () => {
    clearSession();
    // POST /auth/logout é opcional (JWT é stateless), mas útil para logs futuros
    client.post('/auth/logout', {}).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}