// src/lib/api-client.ts

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

// Chave usada para persistir o token no localStorage
const TOKEN_KEY = 'authToken';

// ─── Helpers de token ────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Tipos de erro ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ─── Porta injetável ─────────────────────────────────────────────────────────
// Interface que hooks/contexts dependem, em vez do objeto `apiClient` concreto.
// Permite trocar a implementação (retry, cache, mocks de teste) sem tocar
// em quem consome — só o parâmetro/prop `client` precisa de outro valor.

export interface ApiClientPort {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body: unknown, requiresAuth?: boolean): Promise<T>;
  put<T>(endpoint: string, body: unknown): Promise<T>;
  patch<T>(endpoint: string, body: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

// ─── Cliente HTTP base ───────────────────────────────────────────────────────

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  requiresAuth?: boolean; // padrão: true
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Injeta o JWT automaticamente se existir
  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expirado ou inválido → dispara evento global para o AuthContext reagir
  if (response.status === 401) {
    removeStoredToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
  }

  // Outros erros HTTP
  if (!response.ok) {
    let detail = `Erro ${response.status}`;
    try {
      const json = await response.json();
      detail = json.detail ?? detail;
    } catch {
      // resposta sem corpo JSON, mantém mensagem padrão
    }
    throw new ApiError(response.status, detail);
  }

  // Respostas sem corpo (ex: 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── API pública ─────────────────────────────────────────────────────────────

export const apiClient: ApiClientPort = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, requiresAuth = true) =>
    request<T>(endpoint, { method: 'POST', body, requiresAuth }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};