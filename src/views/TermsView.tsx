import { ArrowLeft } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export function TermsView({ onBack }: TermsViewProps) {
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
        <h2 className="text-xl font-bold text-white">Termos de Uso</h2>
      </div>

      {/* Conteúdo */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-slide-up">
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2">1. Aceitação dos Termos</h3>
            <p className="text-xs text-slate-400">
              Ao acessar e utilizar este aplicativo de programa de recompensas, você concorda com os presentes Termos de Uso. 
              Caso não concorde com qualquer disposição aqui estabelecida, você não deve utilizar nossos serviços.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">2. Elegibilidade</h3>
            <p className="text-xs text-slate-400">
              O programa de recompensas está disponível para pessoas físicas maiores de 18 anos ou pessoas jurídicas devidamente constituídas. 
              É necessário possuir CPF ou CNPJ válido para participar do programa.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">3. Cadastro e Conta</h3>
            <p className="text-xs text-slate-400">
              Para participar do programa, você deve fornecer informações verdadeiras, precisas e atualizadas. 
              É de sua responsabilidade manter seus dados cadastrais atualizados. Você é responsável por manter a confidencialidade 
              de suas credenciais de acesso.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">4. Acúmulo de Créditos</h3>
            <p className="text-xs text-slate-400">
              Os créditos são acumulados automaticamente a cada compra realizada em lojas participantes, mediante apresentação 
              do CPF/CNPJ cadastrado. O percentual de crédito pode variar conforme campanhas promocionais vigentes. 
              Os créditos não possuem prazo de validade.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">5. Utilização de Créditos</h3>
            <p className="text-xs text-slate-400">
              Os créditos acumulados podem ser utilizados como desconto em compras futuras nas lojas participantes. 
              Os créditos não podem ser transferidos, trocados por dinheiro ou utilizados em conjunto com outras promoções, 
              salvo disposição expressa em contrário.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">6. Suspensão e Cancelamento</h3>
            <p className="text-xs text-slate-400">
              Reservamo-nos o direito de suspender ou cancelar sua participação no programa em caso de violação destes Termos, 
              fraude, ou qualquer atividade que consideremos prejudicial ao programa ou a outros participantes.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">7. Modificações</h3>
            <p className="text-xs text-slate-400">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor 
              imediatamente após sua publicação no aplicativo. O uso continuado do serviço após as modificações constitui 
              sua aceitação dos novos termos.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">8. Lei Aplicável</h3>
            <p className="text-xs text-slate-400">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
              Quaisquer disputas relacionadas a estes termos serão submetidas à jurisdição exclusiva do foro da comarca de Joinville/SC.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 italic">
              Última atualização: 08 de fevereiro de 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}