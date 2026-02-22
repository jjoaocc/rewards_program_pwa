import { ArrowLeft, MessageCircle, Mail, Phone } from 'lucide-react';

interface HelpCenterViewProps {
  onBack: () => void;
}

export function HelpCenterView({ onBack }: HelpCenterViewProps) {
  return (
    <main className="pt-4 pb-8">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-smooth"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Central de Ajuda</h2>
      </div>

      {/* Perguntas Frequentes */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-4 animate-slide-up">
        <h3 className="text-sm font-bold text-blue-400 mb-4">Perguntas Frequentes</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Como funciona o programa de recompensas?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A cada compra realizada em nossas lojas participantes, você acumula 5% do valor em créditos. 
              Esses créditos podem ser utilizados para pagar suas próximas compras diretamente no caixa.
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Os créditos têm validade?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Não! Seus créditos não possuem prazo de validade e ficam disponíveis em sua conta até que você decida utilizá-los.
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Como utilizo meus créditos?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No momento do pagamento em qualquer loja participante, basta informar ao caixa que deseja usar seus créditos. 
              Informe seu CPF/CNPJ e o valor será descontado automaticamente.
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Posso acumular créditos em todas as compras?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sim! Todas as compras em lojas participantes geram créditos automaticamente, desde que você informe seu CPF/CNPJ no momento da compra.
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Como atualizo meus dados cadastrais?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acesse a aba "Perfil" no aplicativo e clique em "Editar". Você pode atualizar seus dados de contato e endereço a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-sm font-bold text-blue-400 mb-4">Fale Conosco</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <MessageCircle size={18} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">WhatsApp</p>
              <p className="text-sm text-slate-200 font-semibold">(47) 99999-9999</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <Mail size={18} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-200 font-semibold">suporte@rewardsapp.com.br</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <Phone size={18} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Telefone</p>
              <p className="text-sm text-slate-200 font-semibold">(47) 3333-4444</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Horário de atendimento: Segunda a Sexta, das 8h às 18h
        </p>
      </div>
    </main>
  );
}