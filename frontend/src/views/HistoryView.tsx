import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { TransactionList } from '../components/TransactionList';
import { FilterModal } from '../components/FilterModal';
import { TransactionDetailModal } from '../components/TransactionDetailModal'; // NOVO
import type { Transaction, TransactionFilters } from '../types';

const initialFilters: TransactionFilters = {
  startDate: '',
  endDate: '',
  store: '',
  minValue: '',
  maxValue: '',
  operationType: 'all',
};

export function HistoryView({ transactions }: { transactions: Transaction[] }) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Extrair lojas únicas das transações (apenas lojas de compra, não resgates)
  const availableStores = useMemo(() => {
    const storeSet = new Set<string>();
    transactions.forEach((transaction) => {
      // Extrai o nome da loja da descrição (ex: "Compra Loja Centro" -> "Loja Centro")
      if (transaction.description.toLowerCase().includes('compra')) {
        const storeName = transaction.description.replace(/^Compra\s+/i, '').trim();
        if (storeName) {
          storeSet.add(storeName);
        }
      }
    });
    return Array.from(storeSet).sort();
  }, [transactions]);

  // Lógica de filtro composto
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filtro de data inicial
      if (filters.startDate && transaction.date < filters.startDate) {
        return false;
      }

      // Filtro de data final
      if (filters.endDate && transaction.date > filters.endDate) {
        return false;
      }

      // Filtro de loja (busca exata ou contém)
      if (filters.store && !transaction.description.toLowerCase().includes(filters.store.toLowerCase())) {
        return false;
      }

      // Filtro de valor mínimo
      if (filters.minValue && Math.abs(transaction.pointsEarned) < parseFloat(filters.minValue)) {
        return false;
      }

      // Filtro de valor máximo
      if (filters.maxValue && Math.abs(transaction.pointsEarned) > parseFloat(filters.maxValue)) {
        return false;
      }

      // Filtro de tipo de operação
      if (filters.operationType === 'credit' && transaction.pointsEarned <= 0) {
        return false;
      }
      if (filters.operationType === 'debit' && transaction.pointsEarned >= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = 
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.store !== '' ||
    filters.minValue !== '' ||
    filters.maxValue !== '' ||
    filters.operationType !== 'all';

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <main className="pt-4">
      {/* Header com botão de filtro */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white animate-fade-in">Extrato Completo</h2>
        
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-smooth touch-feedback"
        >
          <Filter size={18} />
          <span className="text-sm font-semibold">Filtrar</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 text-xs animate-slide-down">
          <span className="text-slate-400">Filtros ativos:</span>
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-semibold">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
      )}

      {/* Lista de transações ou empty state */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <Filter size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-sm">Nenhuma transação encontrada</p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-smooth"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3 px-2">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transação' : 'transações'}
          </p>
          <TransactionList
            transactions={filteredTransactions}
            onTransactionClick={setSelectedTransaction}
          />
        </>
      )}

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Modal de Filtros */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        availableStores={availableStores}
      />
    </main>
  );
}