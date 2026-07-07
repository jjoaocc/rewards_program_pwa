import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './NotificationBell';
import type { Notification } from '../types';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: '1',
    title: 'Título',
    message: 'Mensagem',
    type: 'system',
    timestamp: '2026-01-01T00:00:00Z',
    read: false,
    ...overrides,
  };
}

describe('NotificationBell', () => {
  it('não mostra contador quando não há notificações não lidas', () => {
    render(<NotificationBell notifications={[makeNotification({ read: true })]} onClick={vi.fn()} />);

    expect(screen.getByLabelText('Notificações')).toBeInTheDocument();
  });

  it('mostra o contador de não lidas', () => {
    render(
      <NotificationBell
        notifications={[makeNotification({ id: '1', read: false }), makeNotification({ id: '2', read: false })]}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByLabelText('Notificações (2 não lidas)')).toBeInTheDocument();
  });

  it('mostra "9+" quando há mais de 9 não lidas', () => {
    const notifications = Array.from({ length: 10 }, (_, i) => makeNotification({ id: String(i), read: false }));
    render(<NotificationBell notifications={notifications} onClick={vi.fn()} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('chama onClick ao ser clicado', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<NotificationBell notifications={[]} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});
