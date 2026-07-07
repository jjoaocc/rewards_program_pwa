import { Bell, BellOff } from 'lucide-react';

interface PushPreferencesSectionProps {
  permissionState: 'default' | 'granted' | 'denied' | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

export function PushPreferencesSection({
  permissionState,
  isSubscribed,
  isLoading,
  subscribe,
  unsubscribe,
}: PushPreferencesSectionProps) {
  if (permissionState === 'unsupported') return null;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up"
      style={{ animationDelay: '400ms' }}
    >
      <h3 className="text-sm font-bold text-slate-200 mb-4">Preferências</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg">
            {isSubscribed ? (
              <Bell size={18} className="text-emerald-400" />
            ) : (
              <BellOff size={18} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Notificações push</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {permissionState === 'denied'
                ? 'Bloqueadas nas configurações do dispositivo'
                : isSubscribed
                  ? 'Ativas neste dispositivo'
                  : 'Receba alertas de promoções e recompensas'}
            </p>
          </div>
        </div>

        {permissionState !== 'denied' && (
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubscribed
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-emerald-500 text-white hover:bg-emerald-400'
            }`}
          >
            {isLoading ? '...' : isSubscribed ? 'Desativar' : 'Ativar'}
          </button>
        )}
      </div>
    </div>
  );
}
