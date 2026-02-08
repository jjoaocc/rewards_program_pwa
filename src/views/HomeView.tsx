import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionList } from '../components/TransactionList';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import type { Customer, Transaction } from '../types';

interface HomeViewProps {
  customer: Customer;
  transactions: Transaction[];
  onNavigateToExtrato: () => void; // NOVO: função para navegar
}

export function HomeView({ customer, transactions, onNavigateToExtrato }: HomeViewProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <header className="mb-8 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">Olá, {customer.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 text-sm font-medium">Código: {customer.id}</p>
          </div>
          
          {/* Logo da Empresa */}
          <div className="ml-4">
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
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-slate-400">Sem validade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-400">Todas as lojas são elegíveis</span>
            </div>
          </div>
        </div>

        <TransactionList 
          transactions={transactions.slice(0, 5)}
          onTransactionClick={setSelectedTransaction}
        />

        {/* Link "Ver todas" */}
        {transactions.length > 5 && (
          <button
            onClick={onNavigateToExtrato}
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold transition-smooth py-2 animate-fade-in"
          >
            Ver todas as transações
            <ChevronRight size={16} />
          </button>
        )}
      </main>

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}