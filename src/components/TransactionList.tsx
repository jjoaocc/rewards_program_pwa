import type { Transaction } from '../types';

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">Atividades Recentes</h3>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">{t.description}</p>
              <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className={`font-bold ${t.pointsEarned > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.pointsEarned > 0 ? '+' : ''} R$ {t.pointsEarned.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}