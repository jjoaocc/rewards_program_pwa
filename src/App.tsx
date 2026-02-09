import { useState } from 'react';
import { Home, Receipt, Calendar, UserCircle } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { EventsView } from './views/EventsView'; // NOVO
import { ProfileView } from './views/ProfileView';
import { HelpCenterView } from './views/HelpCenterView';
import { TermsView } from './views/TermsView';
import { PrivacyView } from './views/PrivacyView';
import { MOCK_CUSTOMER, MOCK_TRANSACTIONS } from './data/mockCustomer';
import type { ActivePage } from './types';

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('inicio');

  const renderView = () => {
    switch (activePage) {
      case 'inicio': 
        return (
          <HomeView 
            customer={MOCK_CUSTOMER} 
            transactions={MOCK_TRANSACTIONS}
            onNavigateToExtrato={() => setActivePage('extrato')}
          />
        );
      case 'extrato': 
        return <HistoryView transactions={MOCK_TRANSACTIONS} />;
      case 'eventos': // NOVO
        return <EventsView />;
      case 'perfil': 
        return <ProfileView customer={MOCK_CUSTOMER} onNavigate={setActivePage} />;
      case 'ajuda':
        return <HelpCenterView onBack={() => setActivePage('perfil')} />;
      case 'termos':
        return <TermsView onBack={() => setActivePage('perfil')} />;
      case 'privacidade':
        return <PrivacyView onBack={() => setActivePage('perfil')} />;
      default: 
        return (
          <HomeView 
            customer={MOCK_CUSTOMER} 
            transactions={MOCK_TRANSACTIONS}
            onNavigateToExtrato={() => setActivePage('extrato')}
          />
        );
    }
  };

  // Esconde bottom nav nas páginas de ajuda/legal
  const showBottomNav = !['ajuda', 'termos', 'privacidade'].includes(activePage);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 p-6 pb-32">
      <div key={activePage} className="animate-fade-in">
        {renderView()}
      </div>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700 px-4 flex justify-around items-center h-20 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setActivePage('inicio')}
            className={`flex flex-col items-center gap-1 touch-feedback transition-spring px-3 py-2 rounded-xl ${
              activePage === 'inicio'
                ? 'text-blue-400 scale-110'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home size={22} strokeWidth={activePage === 'inicio' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Início</span>
            {activePage === 'inicio' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-scale-in"></div>
            )}
          </button>

          <button
            onClick={() => setActivePage('extrato')}
            className={`flex flex-col items-center gap-1 touch-feedback transition-spring px-3 py-2 rounded-xl ${
              activePage === 'extrato'
                ? 'text-blue-400 scale-110'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Receipt size={22} strokeWidth={activePage === 'extrato' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Extrato</span>
            {activePage === 'extrato' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-scale-in"></div>
            )}
          </button>

          {/* NOVO - Botão Eventos */}
          <button
            onClick={() => setActivePage('eventos')}
            className={`flex flex-col items-center gap-1 touch-feedback transition-spring px-3 py-2 rounded-xl ${
              activePage === 'eventos'
                ? 'text-blue-400 scale-110'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Calendar size={22} strokeWidth={activePage === 'eventos' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Eventos</span>
            {activePage === 'eventos' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-scale-in"></div>
            )}
          </button>

          <button
            onClick={() => setActivePage('perfil')}
            className={`flex flex-col items-center gap-1 touch-feedback transition-spring px-3 py-2 rounded-xl ${
              activePage === 'perfil'
                ? 'text-blue-400 scale-110'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <UserCircle size={22} strokeWidth={activePage === 'perfil' ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Perfil</span>
            {activePage === 'perfil' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-scale-in"></div>
            )}
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;