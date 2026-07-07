import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { NotificationApiResponseSchema, useNotifications } from './useNotifications';

describe('NotificationApiResponseSchema', () => {
  // Payload real capturado de /notifications em produção (com image_url nulo de
  // verdade) — trava contra regressão de schema.
  const validResponse = {
    id: '0474d905-3db0-4c03-9cb0-7f18436dee5d',
    title: 'Teste de verificação',
    message: 'Confirmando que a notificação aparece no sininho',
    type: 'system',
    read: true,
    image_url: null,
    action_url: '/',
    created_at: '2026-07-05T15:15:31.467446',
  };

  it('aceita a resposta real de produção', () => {
    expect(() => NotificationApiResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('aceita action_url nulo também', () => {
    expect(() => NotificationApiResponseSchema.parse({ ...validResponse, action_url: null })).not.toThrow();
  });

  it('rejeita quando falta um campo obrigatório', () => {
    const missing: Record<string, unknown> = { ...validResponse };
    delete missing.title;

    expect(() => NotificationApiResponseSchema.parse(missing)).toThrow();
  });

  it('rejeita type fora do enum esperado', () => {
    expect(() => NotificationApiResponseSchema.parse({ ...validResponse, type: 'invalido' })).toThrow();
  });
});

describe('useNotifications (porta injetável)', () => {
  function makeFakeClient(): ApiClientPort {
    return {
      get: vi.fn().mockResolvedValue([
        {
          id: '0474d905-3db0-4c03-9cb0-7f18436dee5d',
          title: 'Teste de verificação',
          message: 'Confirmando que a notificação aparece no sininho',
          type: 'system',
          read: false,
          image_url: null,
          action_url: '/',
          created_at: '2026-07-05T15:15:31.467446',
        },
      ]),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn().mockResolvedValue({}),
      delete: vi.fn(),
    };
  }

  it('usa o client injetado para buscar notificações', async () => {
    const fakeClient = makeFakeClient();

    const { result } = renderHook(() => useNotifications(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fakeClient.get).toHaveBeenCalledWith('/notifications');
    expect(result.current.notifications).toHaveLength(1);
  });

  it('usa o client injetado para marcar como lida', async () => {
    const fakeClient = makeFakeClient();

    const { result } = renderHook(() => useNotifications(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('0474d905-3db0-4c03-9cb0-7f18436dee5d');
    });

    expect(fakeClient.patch).toHaveBeenCalledWith('/notifications/mark-read', {
      notification_ids: ['0474d905-3db0-4c03-9cb0-7f18436dee5d'],
    });
  });

  it('dismiss chama o DELETE da notificação no backend', async () => {
    const fakeClient = makeFakeClient();
    fakeClient.delete = vi.fn().mockResolvedValue({});

    const { result } = renderHook(() => useNotifications(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.dismiss('0474d905-3db0-4c03-9cb0-7f18436dee5d');
    });

    expect(fakeClient.delete).toHaveBeenCalledWith('/notifications/0474d905-3db0-4c03-9cb0-7f18436dee5d');
    expect(result.current.notifications).toHaveLength(0);
  });

  it('dismiss restaura a notificação se o DELETE falhar', async () => {
    const fakeClient = makeFakeClient();
    fakeClient.delete = vi.fn().mockRejectedValue(new Error('falhou'));

    const { result } = renderHook(() => useNotifications(fakeClient));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.dismiss('0474d905-3db0-4c03-9cb0-7f18436dee5d');
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('expõe um erro visível quando a resposta não bate com o schema (zod), em vez de falhar em silêncio', async () => {
    const fakeClient: ApiClientPort = {
      get: vi.fn().mockResolvedValue([{ id: '1' }]), // faltam campos obrigatórios
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const { result } = renderHook(() => useNotifications(fakeClient));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toEqual(expect.any(String));
    expect(result.current.notifications).toHaveLength(0);
  });
});
