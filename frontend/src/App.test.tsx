import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { apiClient } from './lib/api-client';

vi.mock('./lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/api-client')>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const CUSTOMER_RESPONSE = {
  id: '7742',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '47999990000',
  document: '12345678900',
  document_type: 'cpf' as const,
  balance: '123.45',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function mockAuthenticatedBackend() {
  vi.mocked(apiClient.post).mockImplementation(async (endpoint: string) => {
    if (endpoint === '/auth/login') {
      return { access_token: 'fake-token', token_type: 'bearer' };
    }
    return {};
  });

  vi.mocked(apiClient.get).mockImplementation(async (endpoint: string) => {
    if (endpoint === '/auth/me') {
      return { id: '7742', name: 'João Silva', email: 'joao@example.com' };
    }
    if (endpoint === '/customers/me') {
      return CUSTOMER_RESPONSE;
    }
    if (endpoint === '/transactions') {
      return [];
    }
    if (endpoint === '/customers/me/stats') {
      return {
        total_earned: '0',
        total_redeemed: '0',
        transaction_count: 0,
        member_since: '2026-01-01T00:00:00Z',
      };
    }
    if (endpoint === '/notifications') {
      return [];
    }
    throw new Error(`unexpected GET ${endpoint}`);
  });
}

describe('App — carregamento de dados após login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it('carrega os dados do cliente logo após o login, sem precisar recarregar a página', async () => {
    mockAuthenticatedBackend();
    const user = userEvent.setup();

    render(<App />);

    await screen.findByLabelText(/e-mail ou código do cliente/i);

    await user.type(screen.getByLabelText(/e-mail ou código do cliente/i), '7742');
    await user.type(screen.getByLabelText(/senha/i), 'tmx');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Olá, João!')).toBeInTheDocument();
    });

    expect(screen.queryByText(/não foi possível carregar seus dados/i)).not.toBeInTheDocument();
  });
});
