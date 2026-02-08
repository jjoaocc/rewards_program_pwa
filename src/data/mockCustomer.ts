import type { Customer, Transaction } from '../types';

export const MOCK_CUSTOMER: Customer = {
  id: '7742',
  name: 'João CC',
  email: 'jjoaocc@exemplo.com',
  phone: '47 99999-9999',
  balance: 154.50,
  identificationToken: 'TOKEN-ABC-123',
  lastUpdated: new Date().toISOString(),
  active: true,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-02-05', description: 'Compra Loja Centro', value: 100.00, pointsEarned: 5.00 },
  { id: '2', date: '2026-02-01', description: 'Compra Loja Sul', value: 50.00, pointsEarned: 2.50 },
  { id: '3', date: '2026-01-28', description: 'Resgate de Cupom', value: 0, pointsEarned: -10.00 },
];