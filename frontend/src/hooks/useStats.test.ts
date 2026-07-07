import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { StatsApiResponseSchema, useStats } from './useStats';

describe('StatsApiResponseSchema', () => {
  const validResponse = {
    total_earned: '150.00',
    total_redeemed: '30.00',
    transaction_count: 3,
    member_since: '2026-01-01T00:00:00Z',
  };

  it('aceita uma resposta válida da API', () => {
    expect(() => StatsApiResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('aceita o valor "0" (sem casas decimais) que a API manda quando não há transações', () => {
    // Achado da revisão anterior: sum(...) or 0 no backend serializa como "0", não "0.00".
    expect(() =>
      StatsApiResponseSchema.parse({ ...validResponse, total_earned: '0', total_redeemed: '0' }),
    ).not.toThrow();
  });

  it('rejeita quando falta um campo obrigatório', () => {
    const missing: Record<string, unknown> = { ...validResponse };
    delete missing.transaction_count;

    expect(() => StatsApiResponseSchema.parse(missing)).toThrow();
  });
});

describe('useStats (porta injetável)', () => {
  it('usa o client injetado em vez do apiClient real', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue({
        total_earned: '150.00',
        total_redeemed: '30.00',
        transaction_count: 3,
        member_since: '2026-01-01T00:00:00Z',
      }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useStats(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fakeClient.get).toHaveBeenCalledWith('/customers/me/stats');
    expect(result.current.stats?.transactionCount).toBe(3);
  });
});
