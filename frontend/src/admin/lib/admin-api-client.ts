// src/admin/lib/admin-api-client.ts
//
// Cliente HTTP do painel admin — separado do `lib/api-client.ts` do app do cliente
// porque a autenticação é diferente: aqui o token é passado explicitamente em cada
// chamada (gerenciado pelo hook `useAdminAuth`), não lido de um único local fixo.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class AdminApiError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AdminApiError';
  }
}

export interface AdminApiClientPort {
  get<T>(endpoint: string, token?: string): Promise<T>;
  post<T>(endpoint: string, body: unknown, token?: string): Promise<T>;
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = `Erro ${response.status}`;
    try {
      const json = await response.json();
      detail = json.detail ?? detail;
    } catch {
      // resposta sem corpo JSON, mantém mensagem padrão
    }
    throw new AdminApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const adminApiClient: AdminApiClientPort = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, body: unknown, token?: string) => request<T>(endpoint, { method: 'POST', body, token }),
};
