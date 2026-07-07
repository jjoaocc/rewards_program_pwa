import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginView } from './LoginView';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const login = vi.fn();

describe('LoginView', () => {
  beforeEach(() => {
    login.mockReset();
    vi.mocked(useAuth).mockReturnValue({
      login,
      isLoading: false,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
  });

  it('não chama login e mostra um aviso quando os campos estão vazios', async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('chama login com os valores digitados (identifier sem espaços extras)', async () => {
    login.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<LoginView />);

    await user.type(screen.getByLabelText(/e-mail ou código do cliente/i), '  7742  ');
    await user.type(screen.getByLabelText(/senha/i), 'minhasenha');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(login).toHaveBeenCalledWith('7742', 'minhasenha');
  });

  it('mostra mensagem de erro e limpa a senha quando o login falha', async () => {
    login.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<LoginView />);

    await user.type(screen.getByLabelText(/e-mail ou código do cliente/i), '7742');
    await user.type(screen.getByLabelText(/senha/i), 'senha-errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Usuário ou senha incorretos')).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toHaveValue('');
  });

  it('desabilita os campos e o botão durante o carregamento', () => {
    vi.mocked(useAuth).mockReturnValue({
      login,
      isLoading: true,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
    render(<LoginView />);

    expect(screen.getByLabelText(/e-mail ou código do cliente/i)).toBeDisabled();
    expect(screen.getByLabelText(/senha/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
  });
});
