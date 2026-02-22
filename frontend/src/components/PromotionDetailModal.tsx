import { X, Tag, Calendar, Store, AlertCircle, TrendingDown } from 'lucide-react';
import type { Promotion } from '../types';

interface PromotionDetailModalProps {
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromotionDetailModal({ promotion, isOpen, onClose }: PromotionDetailModalProps) {
  if (!isOpen || !promotion) return null;

  // Calcula preço original baseado no desconto (exemplo fictício)
  const originalPrice = 100; // Base de R$ 100
  const discountedPrice = originalPrice * (1 - promotion.discount / 100);
  const savings = originalPrice - discountedPrice;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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
                <Tag size={18} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">{promotion.title}</h3>
              </div>
              <p className="text-sm text-slate-400">{promotion.category}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-smooth p-1 -mt-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Badge de Desconto Destaque */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6 mb-6 text-center">
            <div className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-xl mb-3">
              <span className="text-3xl font-black">{promotion.discount}%</span>
              <span className="text-sm font-semibold ml-1">OFF</span>
            </div>
            <p className="text-sm text-slate-300 font-semibold">
              {promotion.description}
            </p>
          </div>

          {/* Comparativo de Preços */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20">
                <TrendingDown size={40} className="text-rose-400" />
              </div>
              <p className="text-xs text-slate-400 mb-1">Preço Original</p>
              <p className="text-lg font-bold text-slate-400 line-through">
                R$ {originalPrice.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-emerald-400 mb-1">Preço Promocional</p>
              <p className="text-2xl font-black text-emerald-400">
                R$ {discountedPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Economia */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <TrendingDown size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Você economiza</p>
              <p className="text-xl font-bold text-blue-400">R$ {savings.toFixed(2)}</p>
            </div>
          </div>

          {/* Informações da Promoção */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-slate-400">Válido até:</span>
              <span className="text-slate-200 font-semibold">{formatDate(promotion.validUntil)}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Store size={16} className="text-slate-400" />
              <span className="text-slate-400">Disponível em:</span>
              <span className="text-slate-200 font-semibold">Todas as lojas</span>
            </div>
          </div>

          {/* Termos e Condições */}
          {promotion.terms && (
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                <h4 className="text-sm font-bold text-white">Termos e Condições</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {promotion.terms}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-slate-400 ml-4 list-disc">
                <li>Promoção válida enquanto durarem os estoques</li>
                <li>Não acumulativo com outras ofertas</li>
                <li>Consulte disponibilidade na loja mais próxima</li>
              </ul>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-600 transition-smooth"
            >
              Voltar
            </button>
            <button
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-smooth"
            >
              Ver Lojas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}