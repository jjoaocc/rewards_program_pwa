// src/views/HistoryView.tsx

import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { TransactionList } from '../components/TransactionList';
import { FilterModal } from '../components/FilterModal';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { initialTransactionFilters, type Transaction, type TransactionFilters } from '../types';

interface HistoryViewProps {
  transactions: Transaction[];
  transactionsError?: string | null;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function HistoryView({
  transactions,
  transactionsError,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  filters,
  onFiltersChange,
}: HistoryViewProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const availableStores = useMemo(() => {
    const storeSet = new Set<string>();
    transactions.forEach((t) => {
      if (t.paymentMethod) storeSet.add(t.paymentMethod);
    });
    return Array.from(storeSet).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filters.startDate && t.date < filters.startDate) return false;
        if (filters.endDate && t.date > filters.endDate) return false;
        if (filters.store && t.paymentMethod !== filters.store) return false;
        if (filters.minValue && Math.abs(t.pointsEarned) < parseFloat(filters.minValue)) return false;
        if (filters.maxValue && Math.abs(t.pointsEarned) > parseFloat(filters.maxValue)) return false;
        if (filters.operationType === 'credit' && t.pointsEarned <= 0) return false;
        if (filters.operationType === 'debit' && t.pointsEarned >= 0) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const hasActiveFilters =
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.store !== '' ||
    filters.minValue !== '' ||
    filters.maxValue !== '' ||
    filters.operationType !== 'all';

  const handleClearFilters = () => onFiltersChange(initialTransactionFilters);

  return (
    <main className="pt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white animate-fade-in">Extrato Completo</h2>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="relative flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-smooth touch-feedback"
        >
          <Filter size={18} />
          <span className="text-sm font-semibold">Filtrar</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 text-xs animate-slide-down">
          <span className="text-slate-400">Filtros ativos:</span>
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-semibold">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
      )}

      {transactionsError ? (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-slate-400 text-sm">{transactionsError}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
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
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold transition-smooth disabled:opacity-50"
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </>
      )}

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={handleClearFilters}
        availableStores={availableStores}
      />
    </main>
  );
}