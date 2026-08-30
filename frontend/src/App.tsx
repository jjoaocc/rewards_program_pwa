// src/App.tsx, substitui o arquivo inteiro

import { useState, useMemo } from 'react';
import { Home, Receipt, Calendar, UserCircle } from 'lucide-react';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import { useCustomer } from './hooks/useCustomer';
import { useTransactions } from './hooks/useTransactions';
import { useStats } from './hooks/useStats';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { EventsView } from './views/EventsView';
import { ProfileView } from './views/ProfileView';
import { HelpCenterView } from './views/HelpCenterView';
import { TermsView } from './views/TermsView';
import { PrivacyView } from './views/PrivacyView';
import { initialTransactionFilters, type ActivePage, type TransactionFilters } from './types';

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginView />;

  // Monta só depois de autenticado: garante que useCustomer/useTransactions/useStats
  // façam seu fetch inicial já com o token presente, em vez de reaproveitar o estado
  // de uma tentativa anterior (feita sem token, antes do login).
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [activePage, setActivePage] = useState<ActivePage>('inicio');
  // Vive aqui (não dentro de HistoryView) de propósito: HistoryView remonta toda vez
  // que a aba troca (o `key={activePage}` abaixo força isso pra animação de fade-in),
  // então um filtro guardado só dentro dele seria perdido ao voltar pra essa aba.
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>(initialTransactionFilters);

  const { customer, isLoading: isCustomerLoading, error: customerError, refetch: refetchCustomer } = useCustomer();
  const {
    transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    hasMore: hasMoreTransactions,
    isLoadingMore: isLoadingMoreTransactions,
    loadMore: loadMoreTransactions,
  } = useTransactions();
  const { stats, error: statsError } = useStats();

  // Mescla stats da API no objeto customer
  const customerWithStats = useMemo(() => {
    if (!customer) return null;
    return {
      ...customer,
      stats: stats ?? customer.stats,
    };
  }, [customer, stats]);

  if (isCustomerLoading || isTransactionsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando seus dados...</p>
      </div>
    );
  }

  if (!customerWithStats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 p-6">
        <p className="text-slate-300 text-center">{customerError ?? 'Não foi possível carregar seus dados.'}<br />Tente novamente.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm">
          Recarregar
        </button>
      </div>
    );
  }

  const showBottomNav = !['ajuda', 'termos', 'privacidade'].includes(activePage);

  const renderView = () => {
    switch (activePage) {
      case 'inicio':
        return (
          <HomeView
            customer={customerWithStats}
            transactions={transactions}
            transactionsError={transactionsError}
            onNavigateToExtrato={() => setActivePage('extrato')}
          />
        );
      case 'extrato':
        return (
          <HistoryView
            transactions={transactions}
            transactionsError={transactionsError}
            hasMore={hasMoreTransactions}
            isLoadingMore={isLoadingMoreTransactions}
            onLoadMore={loadMoreTransactions}
            filters={transactionFilters}
            onFiltersChange={setTransactionFilters}
          />
        );
      case 'eventos':
        return <EventsView />;
      case 'perfil':
        return (
          <ProfileView
            customer={customerWithStats}
            statsError={statsError}
            onNavigate={setActivePage}
            onUpdate={refetchCustomer}
          />
        );
      case 'ajuda':
        return <HelpCenterView onBack={() => setActivePage('perfil')} />;
      case 'termos':
        return <TermsView onBack={() => setActivePage('perfil')} />;
      case 'privacidade':
        return <PrivacyView onBack={() => setActivePage('perfil')} />;
      default:
        return (
          <HomeView
            customer={customerWithStats}
            transactions={transactions}
            transactionsError={transactionsError}
            onNavigateToExtrato={() => setActivePage('extrato')}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 p-6 pb-40">
      <div key={activePage} className="animate-fade-in">
        {renderView()}
      </div>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700 px-4 flex justify-around items-center h-20 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
          {(
            [
              { page: 'inicio', icon: Home, label: 'Início' },
              { page: 'extrato', icon: Receipt, label: 'Extrato' },
              { page: 'eventos', icon: Calendar, label: 'Eventos' },
              { page: 'perfil', icon: UserCircle, label: 'Perfil' },
            ] as const
          ).map(({ page, icon: Icon, label }) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`relative flex flex-col items-center gap-1 touch-feedback transition-spring px-3 py-2 rounded-xl ${
                activePage === page ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={activePage === page ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
              {activePage === page && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-scale-in" />
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;