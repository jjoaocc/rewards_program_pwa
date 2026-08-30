import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { ApiError, getStoredToken, setStoredToken } from '../lib/api-client';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthProvider';

function makeClient(overrides: Partial<ApiClientPort> = {}): ApiClientPort {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

function renderAuth(client: ApiClientPort) {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider client={client}>{children}</AuthProvider>,
  });
}

describe('AuthProvider — sessão ao montar', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('sem token salvo, termina o loading sem autenticar', async () => {
    const client = makeClient();

    const { result } = renderAuth(client);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(client.get).not.toHaveBeenCalled();
  });

  it('com token salvo válido, restaura a sessão automaticamente', async () => {
    setStoredToken('token-valido');
    const client = makeClient({
      get: vi.fn().mockResolvedValue({ id: '7742', name: 'João', email: 'joao@example.com' }),
    });

    const { result } = renderAuth(client);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('João');
    expect(client.get).toHaveBeenCalledWith('/auth/me');
  });

  it('com token salvo mas inválido (GET /auth/me falha), limpa o token e não autentica', async () => {
    setStoredToken('token-invalido');
    const client = makeClient({ get: vi.fn().mockRejectedValue(new ApiError(401, 'expirado')) });

    const { result } = renderAuth(client);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(getStoredToken()).toBeNull();
  });
});

describe('AuthProvider — login', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('login bem-sucedido autentica, persiste o token e retorna true', async () => {
    const client = makeClient({
      post: vi.fn().mockResolvedValue({ access_token: 'novo-token', token_type: 'bearer' }),
      get: vi.fn().mockResolvedValue({ id: '7742', name: 'João', email: 'joao@example.com' }),
    });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success = false;
    await act(async () => {
      success = await result.current.login('7742', 'tmx');
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(getStoredToken()).toBe('novo-token');
    expect(client.post).toHaveBeenCalledWith('/auth/login', { identifier: '7742', password: 'tmx' }, false);
  });

  it('login com credenciais inválidas retorna false e não autentica', async () => {
    const client = makeClient({ post: vi.fn().mockRejectedValue(new ApiError(401, 'senha incorreta')) });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success = true;
    await act(async () => {
      success = await result.current.login('7742', 'errada');
    });

    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('quando o token vem mas GET /auth/me falha depois do login, desfaz o token e retorna false', async () => {
    const client = makeClient({
      post: vi.fn().mockResolvedValue({ access_token: 'novo-token', token_type: 'bearer' }),
      get: vi.fn().mockResolvedValue(null),
    });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success = true;
    await act(async () => {
      success = await result.current.login('7742', 'tmx');
    });

    expect(success).toBe(false);
    expect(getStoredToken()).toBeNull();
  });

  it('sempre termina com isLoading=false, mesmo em erro inesperado (não-ApiError)', async () => {
    const client = makeClient({ post: vi.fn().mockRejectedValue(new Error('network down')) });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('7742', 'tmx');
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('AuthProvider — logout', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('limpa o token e o estado de usuário autenticado', async () => {
    setStoredToken('token-valido');
    const client = makeClient({
      get: vi.fn().mockResolvedValue({ id: '7742', name: 'João', email: 'joao@example.com' }),
      post: vi.fn().mockResolvedValue({}),
    });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(getStoredToken()).toBeNull();
    expect(client.post).toHaveBeenCalledWith('/auth/logout', {});
  });

  it('não deixa uma falha no POST /auth/logout impedir o logout local', async () => {
    setStoredToken('token-valido');
    const client = makeClient({
      get: vi.fn().mockResolvedValue({ id: '7742', name: 'João', email: 'joao@example.com' }),
      post: vi.fn().mockRejectedValue(new Error('offline')),
    });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('AuthProvider — evento global auth:unauthorized', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('desloga automaticamente quando o api-client dispara o evento (ex: 401 em qualquer chamada)', async () => {
    setStoredToken('token-valido');
    const client = makeClient({
      get: vi.fn().mockResolvedValue({ id: '7742', name: 'João', email: 'joao@example.com' }),
    });
    const { result } = renderAuth(client);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(getStoredToken()).toBeNull();
  });
});

describe('useAuth fora do AuthProvider', () => {
  it('levanta erro explicativo em vez de crashar silenciosamente', () => {
    function Consumer() {
      useAuth();
      return null;
    }
    // Suprime o console.error do React sobre o erro não capturado, esperado neste teste.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow('useAuth deve ser usado dentro de AuthProvider');

    spy.mockRestore();
  });
});
