import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  showSeeAll?: boolean;   // adiciona
  onSeeAll?: () => void;  // adiciona
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-200 mb-4 px-2 animate-fade-in">
        Atividades Recentes
      </h3>
      <div className="space-y-3">
        {transactions.map((t, index) => (
          <button
            key={t.id}
            onClick={() => onTransactionClick?.(t)}
            className="w-full animate-slide-up touch-feedback bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center border border-slate-700 hover:border-slate-600 hover:bg-slate-800/80 transition-smooth cursor-pointer"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="text-left">
              <p className="font-semibold text-slate-200">{t.description}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(t.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
                {t.time && ` • ${t.time}`}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`font-bold text-lg ${
                  t.pointsEarned > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {t.pointsEarned > 0 ? '+' : '-'} R$ {Math.abs(t.pointsEarned).toFixed(2)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}