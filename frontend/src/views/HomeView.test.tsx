import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeView } from './HomeView';
import { useNotifications } from '../hooks/useNotifications';
import type { Customer, Transaction } from '../types';

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

const CUSTOMER: Customer = {
  id: '7742',
  name: 'João Silva',
  documentType: 'cpf',
  document: '123.456.789-00',
  email: 'joao@example.com',
  phone: '47999990000',
  balance: 123.45,
  lastUpdated: '2026-01-01T00:00:00Z',
  active: true,
  address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
  stats: { totalEarned: 500, totalRedeemed: 100, memberSince: '2026-01-01T00:00:00Z' },
};

const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-01-05', description: 'Compra teste', value: 50, pointsEarned: 50 },
];

const onNavigateToExtrato = vi.fn();

describe('HomeView', () => {
  beforeEach(() => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      isLoading: false,
      error: null,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      dismiss: vi.fn(),
    });
    onNavigateToExtrato.mockReset();
  });

  it('mostra a saudação com o primeiro nome e as transações recentes', () => {
    render(<HomeView customer={CUSTOMER} transactions={TRANSACTIONS} onNavigateToExtrato={onNavigateToExtrato} />);

    expect(screen.getByText('Olá, João!')).toBeInTheDocument();
    expect(screen.getByText('Compra teste')).toBeInTheDocument();
  });

  it('navega pro extrato ao clicar em "Ver extrato completo"', async () => {
    const user = userEvent.setup();
    render(<HomeView customer={CUSTOMER} transactions={TRANSACTIONS} onNavigateToExtrato={onNavigateToExtrato} />);

    await user.click(screen.getByText('Ver extrato completo'));

    expect(onNavigateToExtrato).toHaveBeenCalled();
  });

  it('mostra uma mensagem de erro em vez da lista quando as transações falham ao carregar', () => {
    render(
      <HomeView
        customer={CUSTOMER}
        transactions={[]}
        transactionsError="Erro ao carregar histórico."
        onNavigateToExtrato={onNavigateToExtrato}
      />,
    );

    expect(screen.getByText('Erro ao carregar histórico.')).toBeInTheDocument();
  });
});
