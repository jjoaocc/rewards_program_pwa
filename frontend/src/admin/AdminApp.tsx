import { useState } from 'react';
import { adminApiClient, type AdminApiClientPort } from './lib/admin-api-client';
import { useAdminAuth } from './hooks/useAdminAuth';
import { LoginScreen } from './components/LoginScreen';
import { IndividualTab } from './components/IndividualTab';
import { SelectedTab } from './components/SelectedTab';
import { BroadcastTab } from './components/BroadcastTab';
import { HistoryTab } from './components/HistoryTab';

type TabId = 'individual' | 'selected' | 'broadcast' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'individual', label: '👤 Individual' },
  { id: 'selected', label: '🎯 Selecionados' },
  { id: 'broadcast', label: '📢 Broadcast' },
  { id: 'history', label: '🕒 Histórico' },
];

interface AdminAppProps {
  client?: AdminApiClientPort;
}

export function AdminApp({ client = adminApiClient }: AdminAppProps) {
  const { token, isCheckingSession, isLoggingIn, loginError, login, logout } = useAdminAuth(client);
  const [activeTab, setActiveTab] = useState<TabId>('individual');

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <LoginScreen onLogin={login} isLoggingIn={isLoggingIn} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-1.5">
          <h1 className="text-xl font-bold text-slate-100">📡 Push Notifications</h1>
          <button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-slate-300">
            Sair
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Envie notificações para os clientes do programa de fidelidade
        </p>

        <div className="flex flex-wrap gap-2 bg-slate-900 p-1 rounded-xl mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 basis-[45%] py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-smooth ${
                activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Todas as abas ficam montadas (só a visível aparece) — troca de aba não
            perde o que já foi digitado nas outras, igual ao comportamento anterior
            baseado em display:none/block. */}
        <div className={activeTab === 'individual' ? '' : 'hidden'}>
          <IndividualTab token={token} client={client} />
        </div>
        <div className={activeTab === 'selected' ? '' : 'hidden'}>
          <SelectedTab token={token} client={client} />
        </div>
        <div className={activeTab === 'broadcast' ? '' : 'hidden'}>
          <BroadcastTab token={token} client={client} />
        </div>
        <div className={activeTab === 'history' ? '' : 'hidden'}>
          <HistoryTab token={token} client={client} />
        </div>
      </div>
    </div>
  );
}
