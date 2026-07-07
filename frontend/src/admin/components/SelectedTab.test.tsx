import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { SelectedTab } from './SelectedTab';

function renderTab(client: AdminApiClientPort) {
  return render(<SelectedTab token="token" client={client} />);
}

describe('SelectedTab', () => {
  it('mostra erro ao enviar sem nenhum cliente selecionado', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([]), post: vi.fn() };
    const user = userEvent.setup();
    renderTab(client);

    await user.type(screen.getByPlaceholderText('Ex: 🎁 Oferta exclusiva pra você'), 'Oi');
    await user.type(screen.getByPlaceholderText('Ex: Preparamos algo especial pros nossos melhores clientes.'), 'msg');
    await user.click(screen.getByRole('button', { name: /enviar pros selecionados/i }));

    expect(await screen.findByText(/selecione ao menos um cliente/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  it('busca, seleciona múltiplos clientes e envia a lista de IDs', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([
        { id: '7742', name: 'João Silva', email: 'joao@example.com' },
        { id: '8851', name: 'Maria Santos', email: 'maria@example.com' },
      ]),
      post: vi.fn().mockResolvedValue({ customers_targeted: 2, sent: 2, failed: 0, removed: 0, not_found: [] }),
    };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    renderTab(client);

    const searchInput = screen.getByPlaceholderText('Buscar por nome, email ou ID...');
    await user.type(searchInput, 'a');
    await vi.advanceTimersByTimeAsync(300);

    await user.click(await screen.findByText('João Silva'));
    await user.type(searchInput, 'a');
    await vi.advanceTimersByTimeAsync(300);
    await user.click(await screen.findByText('Maria Santos'));

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Ex: 🎁 Oferta exclusiva pra você'), 'Oi');
    await user.type(
      screen.getByPlaceholderText('Ex: Preparamos algo especial pros nossos melhores clientes.'),
      'Mensagem',
    );

    await user.click(screen.getByRole('button', { name: /enviar pros selecionados/i }));

    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith(
        '/push/send-bulk',
        { customer_ids: ['7742', '8851'], title: 'Oi', message: 'Mensagem', url: '/' },
        'token',
      ),
    );
    expect(await screen.findByText(/2 cliente\(s\)/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('remove um cliente selecionado ao clicar no chip', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([{ id: '7742', name: 'João Silva', email: 'joao@example.com' }]),
      post: vi.fn(),
    };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    renderTab(client);

    await user.type(screen.getByPlaceholderText('Buscar por nome, email ou ID...'), 'joao');
    await vi.advanceTimersByTimeAsync(300);
    await user.click(await screen.findByText('João Silva'));

    expect(screen.getByText('João Silva')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remover João Silva'));

    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
