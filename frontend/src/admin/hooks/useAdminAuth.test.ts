import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { AdminApiError } from '../lib/admin-api-client';
import { useAdminAuth } from './useAdminAuth';

const TOKEN_KEY = 'push_admin_token';

describe('useAdminAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sem token salvo, termina a verificação de sessão sem autenticar', async () => {
    const client: AdminApiClientPort = { get: vi.fn(), post: vi.fn() };

    const { result } = renderHook(() => useAdminAuth(client));

    await waitFor(() => expect(result.current.isCheckingSession).toBe(false));
    expect(result.current.token).toBeNull();
    expect(client.get).not.toHaveBeenCalled();
  });

  it('com token salvo válido, confirma a sessão e autentica automaticamente', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-salvo');
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn(),
    };

    const { result } = renderHook(() => useAdminAuth(client));

    await waitFor(() => expect(result.current.isCheckingSession).toBe(false));
    expect(result.current.token).toBe('token-salvo');
    expect(client.get).toHaveBeenCalledWith('/push/admin/campaigns?limit=1', 'token-salvo');
  });

  it('com token salvo expirado, limpa o storage e não autentica', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-expirado');
    const client: AdminApiClientPort = {
      get: vi.fn().mockRejectedValue(new AdminApiError(403, 'Acesso negado')),
      post: vi.fn(),
    };

    const { result } = renderHook(() => useAdminAuth(client));

    await waitFor(() => expect(result.current.isCheckingSession).toBe(false));
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('login com sucesso guarda o token e persiste no localStorage', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({ token: 'novo-token' }),
    };

    const { result } = renderHook(() => useAdminAuth(client));
    await waitFor(() => expect(result.current.isCheckingSession).toBe(false));

    await act(async () => {
      await result.current.login('senha-certa');
    });

    expect(result.current.token).toBe('novo-token');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('novo-token');
    expect(client.post).toHaveBeenCalledWith('/push/admin/login', { secret: 'senha-certa' });
  });

  it('login com senha errada mostra erro e não autentica', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn(),
      post: vi.fn().mockRejectedValue(new AdminApiError(403, 'Acesso negado')),
    };

    const { result } = renderHook(() => useAdminAuth(client));
    await waitFor(() => expect(result.current.isCheckingSession).toBe(false));

    await act(async () => {
      await result.current.login('senha-errada');
    });

    expect(result.current.token).toBeNull();
    expect(result.current.loginError).toBe('Chave incorreta. Tente novamente.');
  });

  it('logout limpa o token do estado e do localStorage', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-salvo');
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([]), post: vi.fn() };

    const { result } = renderHook(() => useAdminAuth(client));
    await waitFor(() => expect(result.current.token).toBe('token-salvo'));

    act(() => result.current.logout());

    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
