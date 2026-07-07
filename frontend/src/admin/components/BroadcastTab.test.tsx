import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { BroadcastTab } from './BroadcastTab';

describe('BroadcastTab', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mostra erro ao enviar sem título nem mensagem', async () => {
    const client: AdminApiClientPort = { get: vi.fn(), post: vi.fn() };
    const user = userEvent.setup();
    render(<BroadcastTab token="token" client={client} />);

    await user.click(screen.getByRole('button', { name: /enviar para todos/i }));

    expect(await screen.findByText(/preencha título e mensagem/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  it('pede confirmação e não envia se o usuário cancelar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const client: AdminApiClientPort = { get: vi.fn(), post: vi.fn() };
    const user = userEvent.setup();
    render(<BroadcastTab token="token" client={client} />);

    await user.type(screen.getByPlaceholderText(/promoção do fim de semana/i), 'Oi');
    await user.type(screen.getByPlaceholderText(/materiais de construção/i), 'Mensagem');
    await user.click(screen.getByRole('button', { name: /enviar para todos/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(client.post).not.toHaveBeenCalled();
  });

  it('envia o broadcast quando confirmado', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const client: AdminApiClientPort = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({ customers_targeted: 5, sent: 5, failed: 0, removed: 0 }),
    };
    const user = userEvent.setup();
    render(<BroadcastTab token="token" client={client} />);

    await user.type(screen.getByPlaceholderText(/promoção do fim de semana/i), 'Oi pessoal');
    await user.type(screen.getByPlaceholderText(/materiais de construção/i), 'Mensagem broadcast');
    await user.click(screen.getByRole('button', { name: /enviar para todos/i }));

    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith(
        '/push/broadcast',
        { title: 'Oi pessoal', message: 'Mensagem broadcast', url: '/' },
        'token',
      ),
    );
    expect(await screen.findByText(/5 clientes/)).toBeInTheDocument();
  });
});
