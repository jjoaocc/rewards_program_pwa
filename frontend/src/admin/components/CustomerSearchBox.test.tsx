import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomerSearchBox } from './CustomerSearchBox';

const RESULTS = [
  { id: '7742', name: 'João Silva', email: 'joao@example.com' },
  { id: '8851', name: 'Maria Santos', email: 'maria@example.com' },
];

describe('CustomerSearchBox', () => {
  it('chama onTermChange ao digitar', async () => {
    const onTermChange = vi.fn();
    const user = userEvent.setup();
    render(<CustomerSearchBox term="" onTermChange={onTermChange} results={[]} onPick={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Buscar por nome, email ou ID...'), 'a');

    expect(onTermChange).toHaveBeenCalledWith('a');
  });

  it('não mostra lista de resultados quando vazia', () => {
    render(<CustomerSearchBox term="" onTermChange={vi.fn()} results={[]} onPick={vi.fn()} />);

    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  it('lista os resultados e chama onPick ao clicar', async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(<CustomerSearchBox term="a" onTermChange={vi.fn()} results={RESULTS} onPick={onPick} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();

    await user.click(screen.getByText('João Silva'));

    expect(onPick).toHaveBeenCalledWith(RESULTS[0]);
  });
});
