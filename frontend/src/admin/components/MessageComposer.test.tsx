import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MessageComposer } from './MessageComposer';

describe('MessageComposer', () => {
  it('chama os callbacks corretos ao editar título, mensagem e url', async () => {
    const onTitleChange = vi.fn();
    const onMessageChange = vi.fn();
    const onUrlChange = vi.fn();
    const user = userEvent.setup();

    render(
      <MessageComposer
        title=""
        onTitleChange={onTitleChange}
        message=""
        onMessageChange={onMessageChange}
        url=""
        onUrlChange={onUrlChange}
      />,
    );

    await user.type(screen.getByPlaceholderText('Ex: 🎉 Promoção especial!'), 'a');
    await user.type(screen.getByPlaceholderText('Ex: Você tem novidades disponíveis.'), 'b');
    await user.type(screen.getByPlaceholderText('/'), '/promo');

    expect(onTitleChange).toHaveBeenCalledWith('a');
    expect(onMessageChange).toHaveBeenCalledWith('b');
    expect(onUrlChange).toHaveBeenCalled();
  });

  it('reflete título e mensagem na pré-visualização', () => {
    render(
      <MessageComposer
        title="Promoção"
        onTitleChange={vi.fn()}
        message="20% off"
        onMessageChange={vi.fn()}
        url="/"
        onUrlChange={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Promoção')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20% off')).toBeInTheDocument();
  });
});
