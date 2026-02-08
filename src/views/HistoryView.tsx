import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

export function HistoryView({ transactions }: { transactions: Transaction[] }) {
  return (
    <main className="pt-4">
      <h2 className="text-xl font-bold mb-6 text-white">Extrato Completo</h2>
      <TransactionList transactions={transactions} />
    </main>
  );
}