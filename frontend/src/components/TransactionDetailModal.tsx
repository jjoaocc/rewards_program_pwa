import { X, ShoppingBag, CreditCard, FileText, Calendar, Clock, MapPin } from 'lucide-react';
import { formatCurrency, formatDateLong } from '../lib/format';
import type { Transaction } from '../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.pointsEarned > 0;
  const storeName = transaction.description.replace(/^(Compra|Resgate de)\s+/i, '').trim();

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
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-slate-400" />
                <h3 className="text-lg font-bold text-white">{storeName}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDateLong(transaction.date)}
                </span>
                {transaction.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {transaction.time}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-smooth p-1 -mt-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Valor Total e Pontos */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Valor da Compra</p>
              <p className="text-xl font-bold text-white">
                R$ {formatCurrency(transaction.value)}
              </p>
            </div>
            <div className={`rounded-xl p-4 ${isCredit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              <p className="text-xs text-slate-400 mb-1">
                {isCredit ? 'Pontos Ganhos' : 'Pontos Usados'}
              </p>
              <p className={`text-xl font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCredit ? '+' : ''} R$ {formatCurrency(Math.abs(transaction.pointsEarned))}
              </p>
            </div>
          </div>

          {/* Informações da Compra */}
          <div className="space-y-3 mb-6">
            {transaction.paymentMethod && (
              <div className="flex items-center gap-3 text-sm">
                <CreditCard size={16} className="text-slate-400" />
                <span className="text-slate-400">Pagamento:</span>
                <span className="text-slate-200 font-semibold">{transaction.paymentMethod}</span>
              </div>
            )}
            {transaction.invoiceNumber && (
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-slate-400" />
                <span className="text-slate-400">Nota Fiscal:</span>
                <span className="text-slate-200 font-semibold font-mono">{transaction.invoiceNumber}</span>
              </div>
            )}
          </div>

          {/* Lista de Produtos */}
          {transaction.products && transaction.products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} className="text-blue-400" />
                <h4 className="text-sm font-bold text-white">Produtos Comprados</h4>
              </div>
              <div className="space-y-2">
                {transaction.products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-slate-700/30 rounded-lg p-3 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-slate-200 flex-1 min-w-0 pr-2 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-white whitespace-nowrap shrink-0">
                        R$ {formatCurrency(product.total)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>
                        {product.quantity}x R$ {formatCurrency(product.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total de Itens */}
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  {transaction.products.length} {transaction.products.length === 1 ? 'item' : 'itens'}
                </span>
                <span className="text-lg font-bold text-white">
                  R$ {formatCurrency(transaction.value)}
                </span>
              </div>
            </div>
          )}

          {/* Se for resgate sem produtos */}
          {(!transaction.products || transaction.products.length === 0) && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={32} className="text-rose-400" />
              </div>
              <p className="text-slate-400 text-sm">
                Resgate de créditos do programa
              </p>
            </div>
          )}

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-smooth"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}