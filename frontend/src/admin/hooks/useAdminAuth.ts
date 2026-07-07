import { useCallback, useEffect, useState } from 'react';
import { adminApiClient, type AdminApiClientPort } from '../lib/admin-api-client';

const TOKEN_KEY = 'push_admin_token';

interface UseAdminAuthReturn {
  token: string | null;
  isCheckingSession: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (secret: string) => Promise<void>;
  logout: () => void;
}

export function useAdminAuth(client: AdminApiClientPort = adminApiClient): UseAdminAuthReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setIsCheckingSession(false);
      return;
    }
    // Confirma que o token salvo ainda não expirou antes de autenticar de verdade —
    // um GET qualquer protegido serve como verificação.
    client
      .get('/push/admin/campaigns?limit=1', saved)
      .then(() => setToken(saved))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsCheckingSession(false));
  }, [client]);

  const login = useCallback(
    async (secret: string) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const data = await client.post<{ token: string }>('/push/admin/login', { secret });
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      } catch {
        setLoginError('Chave incorreta. Tente novamente.');
      } finally {
        setIsLoggingIn(false);
      }
    },
    [client],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, isCheckingSession, isLoggingIn, loginError, login, logout };
}
