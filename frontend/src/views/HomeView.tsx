// src/views/HomeView.tsx (ATUALIZADO)

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionList';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { NotificationBell } from '../components/NotificationBell'; // NOVO
import { NotificationModal } from '../components/NotificationModal'; // NOVO
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications'; // NOVO
import type { Customer, Transaction, Notification } from '../types';

interface HomeViewProps {
  customer: Customer;
  transactions: Transaction[];
  onNavigateToExtrato: () => void;
}

export function HomeView({ customer, transactions, onNavigateToExtrato }: HomeViewProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // NOVO: Estado das notificações
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);

  // NOVO: Handlers de notificação
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <header className="mb-8 pt-4">
        <div className="flex items-start justify-between gap-3"> {/* MODIFICADO: added gap-3 */}
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">Olá, {customer.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 text-sm font-medium">Código: {customer.id}</p>
          </div>
          
          {/* NOVO: Sino de Notificação */}
          <NotificationBell 
            notifications={notifications}
            onClick={() => setShowNotifications(true)}
          />
          
          {/* Logo da Empresa */}
          <div>
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-12 h-12 object-contain animate-scale-in"
            />
          </div>
        </div>
      </header>
      
      <main className="space-y-6">
        <BalanceCard customer={customer} />
        
        {/* Card Informativo do Programa */}
        <div className="animate-slide-up bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-blue-400 mb-2">💎 Como funciona?</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            A cada compra, você acumula <strong className="text-white">5% de cashback</strong> em créditos. 
            Use seu saldo diretamente nas lojas participantes para pagar suas próximas compras!
          </p>
          <button 
            onClick={onNavigateToExtrato}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-bold transition-smooth"
          >
            Ver extrato completo
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Lista de Transações Recentes */}
        <TransactionList 
          transactions={transactions.slice(0, 5)}
          onTransactionClick={setSelectedTransaction}
          showSeeAll
          onSeeAll={onNavigateToExtrato}
        />
      </main>

      {/* Modais */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* NOVO: Modal de Notificações */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
}