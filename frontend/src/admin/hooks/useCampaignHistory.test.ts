import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { useCampaignHistory } from './useCampaignHistory';

const CAMPAIGN = {
  id: '12011728-273f-4fec-9ff8-67b6c9839cb4',
  title: 'Teste',
  message: 'Mensagem de teste',
  url: '/',
  target_type: 'broadcast' as const,
  customers_targeted: 2,
  sent: 2,
  failed: 0,
  removed: 0,
  created_at: '2026-07-06T23:11:59.511069',
};

describe('useCampaignHistory', () => {
  it('não busca nada sem token (antes do login)', () => {
    const client: AdminApiClientPort = { get: vi.fn(), post: vi.fn() };

    renderHook(() => useCampaignHistory(null, client));

    expect(client.get).not.toHaveBeenCalled();
  });

  it('refetch busca o histórico com o token', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CAMPAIGN]), post: vi.fn() };

    const { result } = renderHook(() => useCampaignHistory('token', client));

    await act(async () => {
      await result.current.refetch();
    });

    expect(client.get).toHaveBeenCalledWith('/push/admin/campaigns?limit=20', 'token');
    expect(result.current.campaigns).toEqual([CAMPAIGN]);
  });

  it('aceita url nulo (broadcast não tem lista de clientes específica)', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([{ ...CAMPAIGN, url: null }]),
      post: vi.fn(),
    };

    const { result } = renderHook(() => useCampaignHistory('token', client));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.campaigns[0].url).toBeNull();
  });

  it('em caso de erro, mantém a lista anterior em vez de apagar tudo', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValueOnce([CAMPAIGN]).mockRejectedValueOnce(new Error('boom')),
      post: vi.fn(),
    };

    const { result } = renderHook(() => useCampaignHistory('token', client));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.campaigns).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.campaigns).toHaveLength(1);
  });

  it('isLoading fica true durante o fetch e false ao final', async () => {
    let resolvePromise: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    const client: AdminApiClientPort = { get: vi.fn().mockReturnValue(pending), post: vi.fn() };

    const { result } = renderHook(() => useCampaignHistory('token', client));

    act(() => {
      result.current.refetch();
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise([CAMPAIGN]);
      await pending;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
