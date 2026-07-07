import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { EventApiResponseSchema, useEvents } from './useEvents';

describe('EventApiResponseSchema', () => {
  // Payload real capturado de /events em produção — trava contra regressão de schema.
  const validResponse = {
    id: '38a9c9d7-1a5a-42a7-b10f-b9bfc3e961bb',
    title: 'Aniversário da Loja - 25 Anos',
    description: 'Promoções imperdíveis durante todo o mês! Sorteios diários de brindes.',
    discount: '25.00',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    image_url: 'https://exemplo.com/evento-aniversario.jpg',
    active: true,
    created_at: '2026-02-22T03:16:23.373793',
  };

  it('aceita a resposta real de produção', () => {
    expect(() => EventApiResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('aceita image_url nulo', () => {
    expect(() => EventApiResponseSchema.parse({ ...validResponse, image_url: null })).not.toThrow();
  });

  it('rejeita quando falta um campo obrigatório', () => {
    const missing: Record<string, unknown> = { ...validResponse };
    delete missing.discount;

    expect(() => EventApiResponseSchema.parse(missing)).toThrow();
  });
});

describe('useEvents (porta injetável)', () => {
  it('usa o client injetado em vez do apiClient real', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue([
        {
          id: '38a9c9d7-1a5a-42a7-b10f-b9bfc3e961bb',
          title: 'Aniversário da Loja - 25 Anos',
          description: 'Promoções imperdíveis durante todo o mês!',
          discount: '25.00',
          start_date: '2026-04-01',
          end_date: '2026-04-30',
          image_url: null,
          active: true,
          created_at: '2026-02-22T03:16:23.373793',
        },
      ]),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useEvents(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fakeClient.get).toHaveBeenCalledWith('/events');
    expect(result.current.campaigns).toHaveLength(1);
    expect(result.current.promotions).toHaveLength(1);
  });
});
