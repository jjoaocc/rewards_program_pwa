import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotificationModal } from './NotificationModal';
import type { Notification } from '../types';

const UNREAD: Notification = {
  id: '1',
  title: 'Promoção nova',
  message: 'Confira o desconto de hoje',
  type: 'promotion',
  timestamp: new Date().toISOString(),
  read: false,
};

const READ: Notification = {
  id: '2',
  title: 'Já lida',
  message: 'Mensagem antiga',
  type: 'system',
  timestamp: new Date().toISOString(),
  read: true,
};

describe('NotificationModal', () => {
  it('não renderiza nada quando fechado', () => {
    const { container } = render(
      <NotificationModal
        isOpen={false}
        onClose={vi.fn()}
        notifications={[UNREAD]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra estado vazio quando não há notificações', () => {
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });

  it('marca como lida ao clicar numa notificação não lida', async () => {
    const onMarkAsRead = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[UNREAD]}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Promoção nova'));

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('não chama onMarkAsRead ao clicar numa notificação já lida', async () => {
    const onMarkAsRead = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[READ]}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Já lida'));

    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('chama onDelete ao clicar no botão de deletar, sem marcar como lida', async () => {
    const onMarkAsRead = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[UNREAD]}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByLabelText('Deletar notificação'));

    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('chama onMarkAllAsRead quando há não lidas', async () => {
    const onMarkAllAsRead = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[UNREAD]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={onMarkAllAsRead}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Marcar todas como lidas'));

    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it('não mostra o botão de marcar todas quando não há não lidas', () => {
    render(
      <NotificationModal
        isOpen
        onClose={vi.fn()}
        notifications={[READ]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByText('Marcar todas como lidas')).not.toBeInTheDocument();
  });
});
