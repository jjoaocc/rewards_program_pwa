import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminApiError, adminApiClient } from './admin-api-client';

describe('adminApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('faz GET sem token quando nenhum é passado (ex: antes do login)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await adminApiClient.get('/push/admin/campaigns');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('inclui o Bearer token quando fornecido', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([]),
    });
    vi.stubGlobal('fetch', fetchMock);

    await adminApiClient.get('/push/admin/campaigns', 'meu-token');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer meu-token');
  });

  it('faz POST com body serializado em JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'abc' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await adminApiClient.post('/push/admin/login', { secret: 'x' });

    expect(result).toEqual({ token: 'abc' });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ secret: 'x' }));
  });

  it('lança AdminApiError com a mensagem do detail quando a resposta falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Acesso negado' }),
    }));

    await expect(adminApiClient.get('/push/admin/campaigns', 'token-errado')).rejects.toMatchObject({
      name: 'AdminApiError',
      status: 403,
      message: 'Acesso negado',
    });
  });

  it('usa uma mensagem padrão quando a resposta de erro não tem corpo JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new Error('no body'); },
    }));

    await expect(adminApiClient.get('/push/admin/campaigns', 't')).rejects.toMatchObject({
      status: 500,
      message: 'Erro 500',
    });
  });

  it('AdminApiError carrega o status', () => {
    const err = new AdminApiError(409, 'conflito');
    expect(err.status).toBe(409);
    expect(err.message).toBe('conflito');
  });
});
