// src/views/EventsView.tsx

import { useState, useEffect, useRef } from 'react';
import { Calendar, Tag } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { PromotionDetailModal } from '../components/PromotionDetailModal';
import { formatDateShort } from '../lib/format';
import type { Promotion } from '../types';

export function EventsView() {
  const { campaigns, promotions, isLoading, error } = useEvents();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reseta o slide quando os dados carregam
  useEffect(() => {
    setCurrentSlide(0);
  }, [campaigns.length]);

  // Auto-play
  useEffect(() => {
    if (campaigns.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % campaigns.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [campaigns.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentSlide(prev => (prev + 1) % campaigns.length);
      else setCurrentSlide(prev => (prev - 1 + campaigns.length) % campaigns.length);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-4 flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 text-center py-16">
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  const currentCampaign = campaigns[currentSlide];

  return (
    <main className="pt-4 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={24} className="text-blue-400" />
        <h2 className="text-xl font-bold text-white animate-fade-in">Eventos e Promoções</h2>
      </div>

      {/* Carrossel */}
      {campaigns.length > 0 && currentCampaign && (
        <div className="relative mb-8 animate-slide-up">
          <div
            ref={carouselRef}
            className="relative overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 h-64 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 transition-opacity duration-500">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${currentCampaign.highlightColor} 0%, transparent 100%)`,
                }}
              />
              <div className="relative h-full flex flex-col justify-between p-6">
                <div>
                  <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Campanha Ativa
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{currentCampaign.title}</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentCampaign.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Calendar size={14} />
                  <span>
                    {formatDateShort(currentCampaign.startDate)} - {formatDateShort(currentCampaign.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-2">
              {campaigns.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">Deslize para ver mais campanhas</p>
        </div>
      )}

      {/* Promoções */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-blue-400" />
          <h3 className="text-lg font-bold text-white">Promoções Ativas</h3>
        </div>

        {promotions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Nenhuma promoção ativa no momento.</p>
        ) : (
          <div className="space-y-3">
            {promotions.map((promo, index) => (
              <button
                key={promo.id}
                onClick={() => setSelectedPromotion(promo)}
                className="w-full text-left animate-slide-up bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition-smooth"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-200 text-sm">{promo.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{promo.description}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Válido até {formatDateShort(promo.validUntil)}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 shrink-0">
                    <span className="text-emerald-400 font-black text-lg">{promo.discount}%</span>
                    <p className="text-emerald-600 text-[10px] font-bold">OFF</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <PromotionDetailModal
        promotion={selectedPromotion}
        isOpen={selectedPromotion !== null}
        onClose={() => setSelectedPromotion(null)}
      />
    </main>
  );
}