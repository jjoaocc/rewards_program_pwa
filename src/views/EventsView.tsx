import { useState, useEffect, useRef } from 'react';
import { Calendar, Tag } from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_PROMOTIONS } from '../data/mockEvents';
import { PromotionDetailModal } from '../components/PromotionDetailModal';
import type { Promotion } from '../types';

export function EventsView() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play do carrossel (troca a cada 10 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MOCK_CAMPAIGNS.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handlers de touch para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Mínimo de pixels para considerar swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe para esquerda (próximo slide)
        setCurrentSlide((prev) => (prev + 1) % MOCK_CAMPAIGNS.length);
      } else {
        // Swipe para direita (slide anterior)
        setCurrentSlide((prev) => (prev - 1 + MOCK_CAMPAIGNS.length) % MOCK_CAMPAIGNS.length);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const currentCampaign = MOCK_CAMPAIGNS[currentSlide];

  return (
    <main className="pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={24} className="text-blue-400" />
        <h2 className="text-xl font-bold text-white animate-fade-in">Eventos e Promoções</h2>
       </div>

      {/* Carrossel de Campanhas */}
      <div className="relative mb-8 animate-slide-up">
        <div 
          ref={carouselRef}
          className="relative overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 h-64 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide atual */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: 1 }}
          >
            {/* Background com gradiente */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                background: `linear-gradient(135deg, ${currentCampaign.highlightColor} 0%, transparent 100%)`
              }}
            />
            
            {/* Conteúdo */}
            <div className="relative h-full flex flex-col justify-between p-6">
              <div>
                <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Campanha Ativa
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {currentCampaign.title}
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentCampaign.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar size={14} />
                <span>
                  {formatDate(currentCampaign.startDate)} - {formatDate(currentCampaign.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-2">
            {MOCK_CAMPAIGNS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-white' 
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dica de swipe (aparece só na primeira vez) */}
        <p className="text-center text-xs text-slate-500 mt-2">
          Deslize para ver mais campanhas
        </p>
      </div>

      {/* Promoções Atuais */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-blue-400" />
          <h3 className="text-lg font-bold text-white">Promoções Ativas</h3>
        </div>

        <div className="space-y-3">
          {MOCK_PROMOTIONS.map((promo, index) => (
            <div
              key={promo.id}
              className="animate-slide-up bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition-smooth"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                      {promo.discount}% OFF
                    </span>
                    <span className="text-xs text-slate-500">
                      {promo.category}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-1">
                    {promo.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    {promo.description}
                  </p>

                  {promo.terms && (
                    <p className="text-xs text-slate-500 italic">
                      * {promo.terms}
                    </p>
                  )}
                </div>

                {/* Badge de validade */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500 mb-1">Válido até</p>
                  <p className="text-sm font-bold text-blue-400">
                    {formatDate(promo.validUntil)}
                  </p>
                </div>
              </div>

              {/* Barra de ação */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Disponível em todas as lojas</span>
                  <button 
                    onClick={() => setSelectedPromotion(promo)}
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-smooth"
                  >
                    Ver detalhes →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <PromotionDetailModal
        promotion={selectedPromotion}
        isOpen={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </main>
  );
}