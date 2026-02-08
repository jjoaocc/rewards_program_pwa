import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Tag, Sparkles } from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_PROMOTIONS } from '../data/mockEvents';

export function EventsView() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play do carrossel (troca a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MOCK_CAMPAIGNS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % MOCK_CAMPAIGNS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + MOCK_CAMPAIGNS.length) % MOCK_CAMPAIGNS.length);
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
        <Sparkles size={24} className="text-yellow-400" />
        <h2 className="text-xl font-bold text-white animate-fade-in">Eventos e Promoções</h2>
      </div>

      {/* Carrossel de Campanhas */}
      <div className="relative mb-8 animate-slide-up">
        <div className="relative overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 h-64">
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

          {/* Botões de navegação */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-smooth"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-smooth"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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

              {/* Barra de progresso da validade (opcional) */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Disponível em todas as lojas</span>
                  <button className="text-blue-400 hover:text-blue-300 font-semibold transition-smooth">
                    Ver detalhes →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}