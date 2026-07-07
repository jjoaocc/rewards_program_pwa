import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BalanceCard } from './BalanceCard';
import type { Customer } from '../types';

const CUSTOMER: Customer = {
  id: '7742',
  name: 'João Silva',
  documentType: 'cpf',
  document: '123.456.789-00',
  email: 'joao@example.com',
  phone: '47999990000',
  balance: 1234.56,
  lastUpdated: '2026-01-01T00:00:00Z',
  active: true,
  address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
  stats: { totalEarned: 0, totalRedeemed: 0, memberSince: '2026-01-01T00:00:00Z' },
};

describe('BalanceCard', () => {
  it('mostra o saldo formatado em reais', () => {
    render(<BalanceCard customer={CUSTOMER} />);

    expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument();
  });

  it('mostra saldo zero corretamente', () => {
    render(<BalanceCard customer={{ ...CUSTOMER, balance: 0 }} />);

    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });
});
