import { useEffect } from 'react';
import type { AdminApiClientPort } from '../lib/admin-api-client';
import { adminApiClient } from '../lib/admin-api-client';
import { useCampaignHistory, type PushCampaign } from '../hooks/useCampaignHistory';

interface HistoryTabProps {
  token: string;
  client?: AdminApiClientPort;
}

const TARGET_LABELS: Record<PushCampaign['target_type'], string> = {
  individual: 'Individual',
  selected: 'Selecionados',
  broadcast: 'Broadcast',
};

const TARGET_STYLES: Record<PushCampaign['target_type'], string> = {
  individual: 'bg-blue-900/40 text-blue-300',
  selected: 'bg-emerald-900/40 text-emerald-300',
  broadcast: 'bg-amber-950 text-amber-400',
};

function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

export function HistoryTab({ token, client = adminApiClient }: HistoryTabProps) {
  const { campaigns, isLoading, refetch } = useCampaignHistory(token, client);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na primeira montagem da aba
  }, []);

  return (
    <div>
      {isLoading && campaigns.length === 0 && <p className="text-sm text-slate-600 text-center py-6">Carregando...</p>}

      {!isLoading && campaigns.length === 0 && (
        <p className="text-sm text-slate-600 text-center py-6">Nenhum envio registrado ainda.</p>
      )}

      {campaigns.map((campaign) => (
        <div key={campaign.id} className="border border-slate-700 rounded-xl p-3.5 mb-2.5">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <span className="text-sm font-bold text-slate-100">{campaign.title}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${TARGET_STYLES[campaign.target_type]}`}
            >
              {TARGET_LABELS[campaign.target_type]}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">{campaign.message}</p>
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span>🎯 {campaign.customers_targeted}</span>
            <span>✅ {campaign.sent}</span>
            <span>❌ {campaign.failed}</span>
            <span>🗑️ {campaign.removed}</span>
            <span className="text-slate-600">{relativeTime(campaign.created_at)}</span>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => refetch()}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl transition-smooth mt-2"
      >
        🔄 Atualizar
      </button>
    </div>
  );
}
