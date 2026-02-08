import { useState } from 'react';
import { Home, Receipt, UserCircle } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { MOCK_CUSTOMER, MOCK_TRANSACTIONS } from './data/mockCustomer';
import type { ActivePage } from './types';

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('inicio');

  const renderView = () => {
    switch (activePage) {
      case 'inicio': return <HomeView customer={MOCK_CUSTOMER} transactions={MOCK_TRANSACTIONS} />;
      case 'extrato': return <HistoryView transactions={MOCK_TRANSACTIONS} />;
      case 'perfil': return <ProfileView customer={MOCK_CUSTOMER} />;
      default: return <HomeView customer={MOCK_CUSTOMER} transactions={MOCK_TRANSACTIONS} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 p-6 pb-32">
      {renderView()}

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 px-8 flex justify-around items-center h-20 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
        <button onClick={() => setActivePage('inicio')} className={`flex flex-col items-center gap-1 ${activePage === 'inicio' ? 'text-blue-400' : 'text-slate-500'}`}>
          <Home size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => setActivePage('extrato')} className={`flex flex-col items-center gap-1 ${activePage === 'extrato' ? 'text-blue-400' : 'text-slate-500'}`}>
          <Receipt size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Extrato</span>
        </button>
        <button onClick={() => setActivePage('perfil')} className={`flex flex-col items-center gap-1 ${activePage === 'perfil' ? 'text-blue-400' : 'text-slate-500'}`}>
          <UserCircle size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;