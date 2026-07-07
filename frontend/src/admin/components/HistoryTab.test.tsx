import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { HistoryTab } from './HistoryTab';

const CAMPAIGN = {
  id: '1',
  title: 'Promoção especial',
  message: 'Confira o desconto de hoje',
  url: '/',
  target_type: 'broadcast' as const,
  customers_targeted: 5,
  sent: 5,
  failed: 0,
  removed: 0,
  created_at: new Date().toISOString(),
};

describe('HistoryTab', () => {
  it('busca o histórico automaticamente ao montar', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CAMPAIGN]), post: vi.fn() };
    render(<HistoryTab token="token" client={client} />);

    expect(await screen.findByText('Promoção especial')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/push/admin/campaigns?limit=20', 'token');
  });

  it('mostra estado vazio quando não há campanhas', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([]), post: vi.fn() };
    render(<HistoryTab token="token" client={client} />);

    expect(await screen.findByText(/nenhum envio registrado ainda/i)).toBeInTheDocument();
  });

  it('busca de novo ao clicar em Atualizar', async () => {
    const client: AdminApiClientPort = { get: vi.fn().mockResolvedValue([CAMPAIGN]), post: vi.fn() };
    const user = userEvent.setup();
    render(<HistoryTab token="token" client={client} />);

    await screen.findByText('Promoção especial');
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    expect(client.get).toHaveBeenCalledTimes(2);
  });
});
