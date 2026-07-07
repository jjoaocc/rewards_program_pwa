import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('não chama onLogin quando o campo está vazio', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onLogin={onLogin} isLoggingIn={false} error={null} />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(onLogin).not.toHaveBeenCalled();
  });

  it('chama onLogin com a senha (trim) ao submeter', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onLogin={onLogin} isLoggingIn={false} error={null} />);

    await user.type(screen.getByLabelText(/senha de administrador/i), '  minha-senha  ');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(onLogin).toHaveBeenCalledWith('minha-senha');
  });

  it('mostra a mensagem de erro quando fornecida', () => {
    render(<LoginScreen onLogin={vi.fn()} isLoggingIn={false} error="Chave incorreta. Tente novamente." />);

    expect(screen.getByText('Chave incorreta. Tente novamente.')).toBeInTheDocument();
  });

  it('desabilita input e botão durante o login', () => {
    render(<LoginScreen onLogin={vi.fn()} isLoggingIn={true} error={null} />);

    expect(screen.getByLabelText(/senha de administrador/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
  });
});
