import type { Customer } from '../types';

export function BalanceCard({ customer }: { customer: Customer }) {
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg">
      <p className="text-slate-400 text-sm font-medium">Seu saldo disponível</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl font-black text-white">
          R$ {customer.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-4 italic">
        Atualizado em: {new Date(customer.lastUpdated).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}