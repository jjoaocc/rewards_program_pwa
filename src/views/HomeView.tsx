import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionList';
import type { Customer, Transaction } from '../types';

interface HomeViewProps {
  customer: Customer;
  transactions: Transaction[];
}

export function HomeView({ customer, transactions }: HomeViewProps) {
  return (
    <>
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-white">Olá, {customer.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 text-sm font-medium">Código: {customer.id}</p>
      </header>
      <main className="space-y-6">
        <BalanceCard customer={customer} />
        <TransactionList transactions={transactions.slice(0, 3)} />
      </main>
    </>
  );
}