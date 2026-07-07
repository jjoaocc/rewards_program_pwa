import { formatCurrency } from '../lib/format';
import type { Customer } from '../types';

export function BalanceCard({ customer }: { customer: Customer }) {
  // Pegar data/hora atual para mostrar como "última atualização"
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="animate-slide-up hover-lift bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-lg transition-smooth relative overflow-hidden">
      {/* Brilho sutil no fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <p className="text-slate-400 text-sm font-medium">Seu saldo disponível</p>
        <div className="flex items-baseline gap-2 mt-1 min-w-0">
          <span className="text-4xl font-black text-white animate-scale-in break-all">
            R$ {formatCurrency(customer.balance)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-4 italic animate-fade-in">
          Atualizado em: {formattedDate} às {formattedTime}
        </p>
      </div>
    </div>
  );
}