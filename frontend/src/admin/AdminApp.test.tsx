import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from './lib/admin-api-client';
import { AdminApp } from './AdminApp';

function makeClient(overrides: Partial<AdminApiClientPort> = {}): AdminApiClientPort {
  return {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn(),
    ...overrides,
  };
}

describe('AdminApp', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mostra a tela de login quando não há sessão', async () => {
    render(<AdminApp client={makeClient()} />);

    expect(await screen.findByText('Painel Admin')).toBeInTheDocument();
  });

  it('após o login, mostra o painel com a aba Individual ativa por padrão', async () => {
    const client = makeClient({ post: vi.fn().mockResolvedValue({ token: 'novo-token' }) });
    const user = userEvent.setup();
    render(<AdminApp client={client} />);

    await user.type(await screen.findByLabelText(/senha de administrador/i), 'senha-certa');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('📡 Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('troca de aba e preserva o rascunho da aba anterior', async () => {
    const client = makeClient({ post: vi.fn().mockResolvedValue({ token: 'novo-token' }) });
    const user = userEvent.setup();
    render(<AdminApp client={client} />);

    await user.type(await screen.findByLabelText(/senha de administrador/i), 'senha-certa');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await user.type(screen.getByPlaceholderText('Ex: 🎉 Promoção especial!'), 'Rascunho individual');

    await user.click(screen.getByRole('button', { name: /broadcast/i }));
    expect(screen.getByPlaceholderText(/promoção do fim de semana/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^👤 individual$/i }));
    expect(screen.getByDisplayValue('Rascunho individual')).toBeInTheDocument();
  });

  it('sair volta pra tela de login', async () => {
    const client = makeClient({ post: vi.fn().mockResolvedValue({ token: 'novo-token' }) });
    const user = userEvent.setup();
    render(<AdminApp client={client} />);

    await user.type(await screen.findByLabelText(/senha de administrador/i), 'senha-certa');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await screen.findByText('📡 Push Notifications');

    await user.click(screen.getByRole('button', { name: /sair/i }));

    expect(await screen.findByText('Painel Admin')).toBeInTheDocument();
  });
});
