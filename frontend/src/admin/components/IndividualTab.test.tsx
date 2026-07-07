import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { AdminApiError } from '../lib/admin-api-client';
import { IndividualTab } from './IndividualTab';

function renderTab(client: AdminApiClientPort) {
  return render(<IndividualTab token="token" client={client} />);
}

describe('IndividualTab', () => {
  it('mostra erro ao tentar enviar sem selecionar cliente nem preencher campos', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([]), post: vi.fn() };
    const user = userEvent.setup();
    renderTab(client);

    await user.click(screen.getByRole('button', { name: /enviar notificação/i }));

    expect(await screen.findByText(/selecione um cliente e preencha título e mensagem/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  it('busca, seleciona um cliente e envia com o payload esperado', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([{ id: '7742', name: 'João Silva', email: 'joao@example.com' }]),
      post: vi.fn().mockResolvedValue({ sent: 1, failed: 0, removed: 0 }),
    };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    renderTab(client);

    await user.type(screen.getByPlaceholderText('Buscar por nome, email ou ID...'), 'joao');
    await vi.advanceTimersByTimeAsync(300);

    await user.click(await screen.findByText('João Silva'));
    await user.type(screen.getByPlaceholderText('Ex: 🎉 Promoção especial!'), 'Oi');
    await user.type(screen.getByPlaceholderText('Ex: Você tem novidades disponíveis.'), 'Mensagem teste');

    await user.click(screen.getByRole('button', { name: /enviar notificação/i }));

    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith(
        '/push/send',
        { customer_id: '7742', title: 'Oi', message: 'Mensagem teste', url: '/' },
        'token',
      ),
    );
    expect(await screen.findByText(/1 dispositivo\(s\) recebeu/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('mostra o erro retornado pela API quando o envio falha', async () => {
    const client: AdminApiClientPort = {
      get: vi.fn().mockResolvedValue([{ id: '7742', name: 'João Silva', email: 'joao@example.com' }]),
      post: vi.fn().mockRejectedValue(new AdminApiError(404, 'Cliente não encontrado')),
    };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    renderTab(client);

    await user.type(screen.getByPlaceholderText('Buscar por nome, email ou ID...'), 'joao');
    await vi.advanceTimersByTimeAsync(300);
    await user.click(await screen.findByText('João Silva'));
    await user.type(screen.getByPlaceholderText('Ex: 🎉 Promoção especial!'), 'Oi');
    await user.type(screen.getByPlaceholderText('Ex: Você tem novidades disponíveis.'), 'Mensagem');

    await user.click(screen.getByRole('button', { name: /enviar notificação/i }));

    expect(await screen.findByText(/Cliente não encontrado/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
