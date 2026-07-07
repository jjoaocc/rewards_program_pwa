import { TrendingUp, Award, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import type { Customer } from '../../types';

// Não usa formatDateLong de lib/format aqui de propósito: `memberSince` é um timestamp
// real (created_at do backend), não uma data pura como birthDate/validUntil. Um timestamp
// sem timezone explícito no ISO string é interpretado como horário local pelo JS, então
// `new Date(...).toLocaleDateString()` já funciona corretamente sem o parsing especial que
// formatDateLong faz para strings de data pura (que o spec trata como UTC).
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ProfileStatsCards({ customer }: { customer: Customer }) {
  const memberSinceDate = new Date(customer.stats.memberSince);
  memberSinceDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const memberDays = Math.max(0, Math.floor((today.getTime() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="animate-slide-up bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 font-semibold">Total Acumulado</span>
        </div>
        <p className="text-xl font-black text-white break-all">R$ {formatCurrency(customer.stats.totalEarned)}</p>
      </div>

      <div
        className="animate-slide-up bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-2xl p-4 min-w-0"
        style={{ animationDelay: '75ms' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Award size={16} className="text-rose-400 shrink-0" />
          <span className="text-xs text-rose-400 font-semibold">Total Resgatado</span>
        </div>
        <p className="text-xl font-black text-white break-all">R$ {formatCurrency(customer.stats.totalRedeemed)}</p>
      </div>

      <div
        className="animate-slide-up col-span-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-4"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">Membro desde</span>
            </div>
            <p className="text-lg font-bold text-white">{formatDate(customer.stats.memberSince)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {memberDays} {memberDays === 1 ? 'dia' : 'dias'} economizando com a gente! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
