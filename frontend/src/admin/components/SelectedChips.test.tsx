import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SelectedChips } from './SelectedChips';

describe('SelectedChips', () => {
  it('mostra mensagem de vazio quando não há clientes selecionados', () => {
    render(<SelectedChips customers={{}} onRemove={vi.fn()} />);

    expect(screen.getByText('Nenhum cliente selecionado ainda.')).toBeInTheDocument();
  });

  it('mostra um chip por cliente selecionado', () => {
    render(<SelectedChips customers={{ '1': 'Maria', '2': 'João' }} onRemove={vi.fn()} />);

    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('chama onRemove com o id certo ao clicar em remover', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<SelectedChips customers={{ '7742': 'Maria' }} onRemove={onRemove} />);

    await user.click(screen.getByLabelText('Remover Maria'));

    expect(onRemove).toHaveBeenCalledWith('7742');
  });
});
