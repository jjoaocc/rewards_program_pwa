import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient, getStoredToken, removeStoredToken, setStoredToken } from './api-client';

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response;
  const fakeResponse = {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(jsonBody),
    ...rest,
  } as unknown as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));
  return fakeResponse;
}

describe('helpers de token', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('setStoredToken/getStoredToken fazem roundtrip via localStorage', () => {
    setStoredToken('abc123');

    expect(getStoredToken()).toBe('abc123');
  });

  it('getStoredToken retorna null quando não há token salvo', () => {
    expect(getStoredToken()).toBeNull();
  });

  it('removeStoredToken limpa o token salvo', () => {
    setStoredToken('abc123');

    removeStoredToken();

    expect(getStoredToken()).toBeNull();
  });
});

describe('ApiError', () => {
  it('carrega status e mensagem', () => {
    const err = new ApiError(404, 'não encontrado');

    expect(err.status).toBe(404);
    expect(err.message).toBe('não encontrado');
    expect(err.name).toBe('ApiError');
  });
});

describe('apiClient', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('injeta o Authorization header quando existe token salvo e a rota exige auth', async () => {
    setStoredToken('meu-token');
    mockFetchOnce({ jsonBody: { ok: true } });

    await apiClient.get('/customers/me');

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)['Authorization']).toBe('Bearer meu-token');
  });

  it('não injeta Authorization quando requiresAuth=false (ex: login)', async () => {
    setStoredToken('meu-token');
    mockFetchOnce({ jsonBody: { access_token: 'x' } });

    await apiClient.post('/auth/login', { identifier: 'a', password: 'b' }, false);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('não injeta Authorization quando não há token salvo, mesmo em rota autenticada', async () => {
    mockFetchOnce({ jsonBody: {} });

    await apiClient.get('/customers/me');

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('serializa o body em JSON pra POST/PUT/PATCH', async () => {
    mockFetchOnce({ jsonBody: {} });

    await apiClient.post('/notifications', { title: 'Oi' });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.body).toBe(JSON.stringify({ title: 'Oi' }));
  });

  it('em 401, limpa o token, dispara auth:unauthorized e levanta ApiError', async () => {
    setStoredToken('token-expirado');
    mockFetchOnce({ ok: false, status: 401, jsonBody: { detail: 'expirado' } });
    const listener = vi.fn();
    window.addEventListener('auth:unauthorized', listener);

    await expect(apiClient.get('/customers/me')).rejects.toThrow(ApiError);

    expect(getStoredToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:unauthorized', listener);
  });

  it('em erro HTTP com corpo JSON, usa o campo detail na mensagem do ApiError', async () => {
    mockFetchOnce({ ok: false, status: 409, jsonBody: { detail: 'Email já está em uso' } });

    await expect(apiClient.patch('/customers/me', {})).rejects.toMatchObject({
      status: 409,
      message: 'Email já está em uso',
    });
  });

  it('em erro HTTP sem corpo JSON válido, cai numa mensagem padrão em vez de quebrar', async () => {
    const fakeResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('body vazio')),
    } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));

    await expect(apiClient.get('/customers/me')).rejects.toMatchObject({
      status: 500,
      message: 'Erro 500',
    });
  });

  it('em 204 No Content, retorna undefined em vez de tentar fazer parse de JSON', async () => {
    const fakeResponse = {
      ok: true,
      status: 204,
      json: vi.fn(),
    } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));

    const result = await apiClient.delete('/notifications/abc');

    expect(result).toBeUndefined();
    expect(fakeResponse.json).not.toHaveBeenCalled();
  });

  it('em resposta 200 com corpo, retorna o JSON parseado', async () => {
    mockFetchOnce({ jsonBody: { id: '7742', name: 'João' } });

    const result = await apiClient.get<{ id: string; name: string }>('/customers/me');

    expect(result).toEqual({ id: '7742', name: 'João' });
  });
});
