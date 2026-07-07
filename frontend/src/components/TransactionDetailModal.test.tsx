import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionDetailModal } from './TransactionDetailModal';
import type { Transaction } from '../types';

const CREDIT_TRANSACTION: Transaction = {
  id: '1',
  date: '2026-01-10',
  description: 'Compra Loja Matriz',
  value: 100,
  pointsEarned: 100,
  paymentMethod: 'Loja Matriz',
  products: [{ id: 'p1', name: 'Cimento CP-II', quantity: 2, unitPrice: 30, total: 60 }],
};

const DEBIT_TRANSACTION: Transaction = {
  id: '2',
  date: '2026-01-05',
  description: 'Resgate de pontos',
  value: 30,
  pointsEarned: -30,
};

describe('TransactionDetailModal', () => {
  it('não renderiza nada quando fechado', () => {
    const { container } = render(
      <TransactionDetailModal transaction={CREDIT_TRANSACTION} isOpen={false} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra os produtos de uma compra com cashback', () => {
    render(<TransactionDetailModal transaction={CREDIT_TRANSACTION} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Cimento CP-II')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Loja Matriz' })).toBeInTheDocument();
  });

  it('mostra o estado de resgate quando não há produtos', () => {
    render(<TransactionDetailModal transaction={DEBIT_TRANSACTION} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Resgate de créditos do programa')).toBeInTheDocument();
  });

  it('chama onClose ao clicar em Fechar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TransactionDetailModal transaction={CREDIT_TRANSACTION} isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /fechar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
