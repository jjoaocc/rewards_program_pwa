import { Calendar, Store, DollarSign, X } from 'lucide-react';
import type { TransactionFilters } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  availableStores: string[];
}

export function FilterModal({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableStores 
}: FilterModalProps) {
  if (!isOpen) return null;

  const hasActiveFilters = 
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.store !== '' ||
    filters.minValue !== '' ||
    filters.maxValue !== '' ||
    filters.operationType !== 'all';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto animate-slide-up">
        <div className="bg-slate-800 border-t border-slate-700 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Filtros</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-smooth p-1"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Filtro de Data */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 font-medium">
                  <Calendar size={11} />
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                  className="w-full h-9 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-0 text-[11px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 font-medium">
                  <Calendar size={11} />
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                  className="w-full h-9 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-0 text-[11px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              </div>
            </div>

            {/* Filtro de Loja - AGORA É SELECT */}
            <div>
              <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                <Store size={14} />
                Loja
              </label>
              <select
                value={filters.store}
                onChange={(e) => onFiltersChange({ ...filters, store: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                <option value="">Todas as lojas</option>
                {availableStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                  <DollarSign size={14} />
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={filters.minValue}
                  onChange={(e) => onFiltersChange({ ...filters, minValue: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                  <DollarSign size={14} />
                  Valor Máximo
                </label>
                <input
                  type="number"
                  placeholder="999.99"
                  step="0.01"
                  value={filters.maxValue}
                  onChange={(e) => onFiltersChange({ ...filters, maxValue: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              </div>
            </div>

            {/* Filtro de Tipo de Operação */}
            <div>
              <label className="text-xs text-slate-400 mb-2 font-medium block">
                Tipo de Operação
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onFiltersChange({ ...filters, operationType: 'all' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    filters.operationType === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, operationType: 'credit' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    filters.operationType === 'credit'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Ganhos
                </button>
                <button
                  onClick={() => onFiltersChange({ ...filters, operationType: 'debit' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    filters.operationType === 'debit'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Gastos
                </button>
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-600 transition-smooth"
              >
                Limpar Tudo
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-smooth"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </>
  );
}