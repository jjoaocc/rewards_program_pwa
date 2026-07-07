import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileView } from './ProfileView';
import { apiClient, ApiError } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import type { Customer } from '../types';

vi.mock('../lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api-client')>();
  return {
    ...actual,
    apiClient: { ...actual.apiClient, patch: vi.fn() },
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/usePushNotifications', () => ({
  usePushNotifications: vi.fn(),
}));

const CUSTOMER: Customer = {
  id: '7742',
  name: 'João Silva',
  documentType: 'cpf',
  document: '123.456.789-00',
  email: 'joao@example.com',
  phone: '47999990000',
  birthDate: '1990-01-01',
  address: {
    cep: '89200-000',
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    city: 'Joinville',
    state: 'SC',
  },
  balance: 123.45,
  lastUpdated: '2026-01-01T00:00:00Z',
  active: true,
  stats: {
    totalEarned: 500,
    totalRedeemed: 100,
    memberSince: '2026-01-01T00:00:00Z',
  },
};

const logout = vi.fn();
const subscribe = vi.fn();
const unsubscribe = vi.fn();
const onNavigate = vi.fn();
const onUpdate = vi.fn();

function renderProfileView() {
  return render(<ProfileView customer={CUSTOMER} onNavigate={onNavigate} onUpdate={onUpdate} />);
}

describe('ProfileView', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      logout,
      user: null,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
    });
    vi.mocked(usePushNotifications).mockReturnValue({
      permissionState: 'default',
      isSubscribed: false,
      isLoading: false,
      subscribe,
      unsubscribe,
    });
    vi.mocked(apiClient.patch).mockReset().mockResolvedValue({});
    logout.mockReset();
    subscribe.mockReset();
    unsubscribe.mockReset();
    onNavigate.mockReset();
    onUpdate.mockReset();
  });

  it('mostra os dados do cliente populados', () => {
    renderProfileView();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('Joinville')).toBeInTheDocument();
  });

  it('entra em modo edição e salva com o payload esperado', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const nameInput = screen.getByDisplayValue('João Silva');
    await user.clear(nameInput);
    await user.type(nameInput, 'João Silva Atualizado');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/customers/me', {
        name: 'João Silva Atualizado',
        email: 'joao@example.com',
        secondary_email: null,
        phone: '47999990000',
        mobile: undefined,
        birth_date: '1990-01-01',
      });
    });
    expect(onUpdate).toHaveBeenCalled();
  });

  it('salva o email secundário editado', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const secondaryEmailInput = screen.getByPlaceholderText('email@exemplo.com');
    await user.type(secondaryEmailInput, 'secundario@example.com');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/customers/me',
        expect.objectContaining({ secondary_email: 'secundario@example.com' }),
      );
    });
  });

  it('salva o email editado', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const emailInput = screen.getByDisplayValue('joao@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'novo@example.com');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/customers/me',
        expect.objectContaining({ email: 'novo@example.com' }),
      );
    });
  });

  it('mostra o erro quando o email já está em uso por outro cliente', async () => {
    vi.mocked(apiClient.patch).mockReset().mockRejectedValue(new ApiError(409, 'Email já está em uso'));
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /editar/i }));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('Email já está em uso')).toBeInTheDocument();
  });

  it('cancelar reverte as alterações sem chamar a API', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const nameInput = screen.getByDisplayValue('João Silva');
    await user.clear(nameInput);
    await user.type(nameInput, 'Outro Nome');

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('ativa notificações push ao clicar em Ativar', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /ativar/i }));

    expect(subscribe).toHaveBeenCalled();
  });

  it('desativa notificações push quando já inscrito', async () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      permissionState: 'granted',
      isSubscribed: true,
      isLoading: false,
      subscribe,
      unsubscribe,
    });
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /desativar/i }));

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('navega para as páginas de ajuda e legal', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByText('Central de Ajuda'));
    expect(onNavigate).toHaveBeenCalledWith('ajuda');

    await user.click(screen.getByText('Termos de Uso'));
    expect(onNavigate).toHaveBeenCalledWith('termos');

    await user.click(screen.getByText('Política de Privacidade'));
    expect(onNavigate).toHaveBeenCalledWith('privacidade');
  });

  it('chama logout ao clicar em Sair da Conta', async () => {
    const user = userEvent.setup();
    renderProfileView();

    await user.click(screen.getByRole('button', { name: /sair da conta/i }));

    expect(logout).toHaveBeenCalled();
  });

  it('mostra um aviso quando as estatísticas falharam ao carregar, sem esconder os cards', () => {
    render(
      <ProfileView customer={CUSTOMER} onNavigate={onNavigate} onUpdate={onUpdate} statsError="Erro ao carregar estatísticas." />,
    );

    expect(screen.getByText('Erro ao carregar estatísticas.')).toBeInTheDocument();
    expect(screen.getByText('Total Acumulado')).toBeInTheDocument();
  });
});
