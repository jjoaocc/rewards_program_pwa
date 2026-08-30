import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiClientPort } from '../lib/api-client';
import { usePushNotifications } from './usePushNotifications';

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

function stubNotification(permission: NotificationPermission, requestResult?: NotificationPermission) {
  vi.stubGlobal('Notification', {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestResult ?? permission),
  });
}

function stubServiceWorker(registration: unknown) {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { ready: Promise.resolve(registration) },
    configurable: true,
  });
}

function makeRegistration(subscription: unknown, subscribeImpl?: () => Promise<unknown>) {
  return {
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(subscription),
      subscribe: subscribeImpl ?? vi.fn().mockResolvedValue(subscription),
    },
  };
}

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.stubGlobal('PushManager', class {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  });

  it('sinaliza "unsupported" quando o navegador não tem PushManager', async () => {
    vi.unstubAllGlobals();
    stubNotification('default');

    const { result } = renderHook(() => usePushNotifications(makeClient()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.permissionState).toBe('unsupported');
  });

  it('reflete a permissão atual e ausência de subscription ao montar', async () => {
    stubNotification('default');
    stubServiceWorker(makeRegistration(null));

    const { result } = renderHook(() => usePushNotifications(makeClient()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.permissionState).toBe('default');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('detecta uma subscription já existente ao montar', async () => {
    stubNotification('granted');
    stubServiceWorker(makeRegistration({ endpoint: 'https://push.example.com/a' }));

    const { result } = renderHook(() => usePushNotifications(makeClient()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSubscribed).toBe(true);
  });

  it('subscribe() não chama a API quando o usuário nega a permissão', async () => {
    stubNotification('default', 'denied');
    stubServiceWorker(makeRegistration(null));
    const client = makeClient();

    const { result } = renderHook(() => usePushNotifications(client));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.permissionState).toBe('denied');
    expect(result.current.isSubscribed).toBe(false);
    expect(client.get).not.toHaveBeenCalled();
  });

  it('subscribe() busca a chave VAPID, assina o push e registra no backend', async () => {
    stubNotification('default', 'granted');
    const fakeSubscription = {
      toJSON: () => ({
        endpoint: 'https://push.example.com/a',
        keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
      }),
    };
    stubServiceWorker(makeRegistration(null, vi.fn().mockResolvedValue(fakeSubscription)));
    const client = makeClient({
      get: vi.fn().mockResolvedValue({ public_key: 'QUJD' }), // base64url válido curto
      post: vi.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => usePushNotifications(client));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(client.get).toHaveBeenCalledWith('/push/vapid-public-key');
    expect(client.post).toHaveBeenCalledWith('/push/subscribe', {
      endpoint: 'https://push.example.com/a',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
      user_agent: navigator.userAgent,
    });
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('subscribe() não deixa uma falha (ex: pushManager.subscribe rejeitado) travar isLoading', async () => {
    stubNotification('default', 'granted');
    stubServiceWorker(makeRegistration(null, vi.fn().mockRejectedValue(new Error('permissão negada pelo SO'))));
    const client = makeClient({ get: vi.fn().mockResolvedValue({ public_key: 'QUJD' }) });

    const { result } = renderHook(() => usePushNotifications(client));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('unsubscribe() cancela a subscription local e avisa o backend', async () => {
    stubNotification('granted');
    const fakeSubscription = { unsubscribe: vi.fn().mockResolvedValue(true) };
    stubServiceWorker(makeRegistration(fakeSubscription));
    const client = makeClient({ delete: vi.fn().mockResolvedValue({}) });

    const { result } = renderHook(() => usePushNotifications(client));
    await waitFor(() => expect(result.current.isSubscribed).toBe(true));

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(fakeSubscription.unsubscribe).toHaveBeenCalled();
    expect(client.delete).toHaveBeenCalledWith('/push/unsubscribe');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('unsubscribe() ainda avisa o backend mesmo sem subscription local ativa (limpeza best-effort)', async () => {
    stubNotification('granted');
    stubServiceWorker(makeRegistration(null));
    const client = makeClient({ delete: vi.fn().mockResolvedValue({}) });

    const { result } = renderHook(() => usePushNotifications(client));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(client.delete).toHaveBeenCalledWith('/push/unsubscribe');
  });
});
