import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionList } from './TransactionList';
import type { Transaction } from '../types';

const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-01-10', description: 'Compra na loja A', value: 100, pointsEarned: 100 },
  { id: '2', date: '2026-01-05', description: 'Resgate de pontos', value: 30, pointsEarned: -30 },
];

describe('TransactionList', () => {
  it('lista as transações com valores positivos e negativos formatados', () => {
    render(<TransactionList transactions={TRANSACTIONS} />);

    expect(screen.getByText('Compra na loja A')).toBeInTheDocument();
    expect(screen.getByText('+ R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('- R$ 30,00')).toBeInTheDocument();
  });

  it('chama onTransactionClick com a transação clicada', async () => {
    const onTransactionClick = vi.fn();
    const user = userEvent.setup();
    render(<TransactionList transactions={TRANSACTIONS} onTransactionClick={onTransactionClick} />);

    await user.click(screen.getByText('Compra na loja A'));

    expect(onTransactionClick).toHaveBeenCalledWith(TRANSACTIONS[0]);
  });
});
