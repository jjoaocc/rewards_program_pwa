import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { TransactionApiResponseSchema, useTransactions } from './useTransactions';

describe('TransactionApiResponseSchema', () => {
  // Payload real capturado de /transactions em produção — trava contra regressão de schema.
  const validResponse = {
    id: '460f00d0-fc5f-4260-86b5-3a5e9a5c8675',
    customer_id: '7742',
    type: 'credit',
    amount: '156.78',
    description: 'Cashback da compra #8923',
    store: 'Loja Matriz - Centro',
    created_at: '2026-02-15T14:32:00',
    items: [
      {
        id: 'e7befd79-408e-4f7b-a131-a6cecf7ed1cc',
        name: 'Cimento CP-II 50kg',
        quantity: 10,
        unit_price: '32.90',
        total_price: '329.00',
      },
      {
        id: 'a9f65ac9-2040-47ce-b487-193d67ab0fdd',
        name: 'Areia Média (m³)',
        quantity: 2,
        unit_price: '85.00',
        total_price: '170.00',
      },
    ],
  };

  it('aceita a resposta real de produção', () => {
    expect(() => TransactionApiResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('aceita store nulo (transações sem loja, ex: resgates)', () => {
    expect(() => TransactionApiResponseSchema.parse({ ...validResponse, store: null })).not.toThrow();
  });

  it('aceita items como lista vazia', () => {
    expect(() => TransactionApiResponseSchema.parse({ ...validResponse, items: [] })).not.toThrow();
  });

  it('rejeita quando falta um campo obrigatório', () => {
    const missing: Record<string, unknown> = { ...validResponse };
    delete missing.amount;

    expect(() => TransactionApiResponseSchema.parse(missing)).toThrow();
  });

  it('rejeita type fora do enum esperado', () => {
    expect(() => TransactionApiResponseSchema.parse({ ...validResponse, type: 'invalido' })).toThrow();
  });
});

function makeTransactionPayload(id: string) {
  return {
    id,
    customer_id: '7742',
    type: 'credit' as const,
    amount: '10.00',
    description: `Compra ${id}`,
    store: 'Loja Matriz - Centro',
    created_at: '2026-02-15T14:32:00',
    items: [],
  };
}

describe('useTransactions (porta injetável)', () => {
  it('usa o client injetado em vez do apiClient real, buscando a primeira página', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue([makeTransactionPayload('1')]),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useTransactions(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fakeClient.get).toHaveBeenCalledWith('/transactions?limit=20&offset=0');
    expect(result.current.transactions).toHaveLength(1);
  });

  it('hasMore é true quando a página vem cheia (indício de que há mais)', async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) => makeTransactionPayload(String(i)));
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue(fullPage),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useTransactions(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasMore).toBe(true);
  });

  it('hasMore é false quando a página vem incompleta', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue([makeTransactionPayload('1')]),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useTransactions(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore busca a próxima página com o offset certo e concatena os resultados', async () => {
    const firstPage = Array.from({ length: 20 }, (_, i) => makeTransactionPayload(`p1-${i}`));
    const secondPage = [makeTransactionPayload('p2-0')];
    const get = vi.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage);
    const fakeClient: ApiClientPort = { get, post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };

    const { result } = renderHook(() => useTransactions(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.loadMore();
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
    });

    expect(get).toHaveBeenLastCalledWith('/transactions?limit=20&offset=20');
    expect(result.current.transactions).toHaveLength(21);
    expect(result.current.hasMore).toBe(false);
  });
});
