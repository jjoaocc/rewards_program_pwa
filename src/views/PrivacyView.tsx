import { ArrowLeft } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

export function PrivacyView({ onBack }: PrivacyViewProps) {
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
        <h2 className="text-xl font-bold text-white">Política de Privacidade</h2>
      </div>

      {/* Conteúdo */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-slide-up">
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-white mb-2">1. Informações que Coletamos</h3>
            <p className="text-xs text-slate-400 mb-2">
              Coletamos as seguintes informações quando você se cadastra e utiliza nosso programa de recompensas:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
              <li>Dados pessoais: nome completo, CPF/CNPJ, data de nascimento ou fundação</li>
              <li>Dados de contato: e-mail, telefone fixo e celular</li>
              <li>Endereço completo: CEP, rua, número, complemento, bairro, cidade e estado</li>
              <li>Histórico de transações e compras realizadas</li>
              <li>Informações de uso do aplicativo</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">2. Como Utilizamos Suas Informações</h3>
            <p className="text-xs text-slate-400 mb-2">
              Utilizamos seus dados para:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
              <li>Gerenciar sua participação no programa de recompensas</li>
              <li>Processar suas transações e acúmulo de créditos</li>
              <li>Comunicar informações sobre seu saldo e benefícios</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Enviar comunicações promocionais (quando autorizado)</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">3. Compartilhamento de Dados</h3>
            <p className="text-xs text-slate-400">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. 
              Podemos compartilhar seus dados apenas com: (a) lojas participantes do programa, para validação de compras e resgates; 
              (b) prestadores de serviços que nos auxiliam na operação do programa; (c) autoridades competentes, quando exigido por lei.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">4. Segurança dos Dados</h3>
            <p className="text-xs text-slate-400">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra 
              acesso não autorizado, perda, alteração ou divulgação. No entanto, nenhum sistema é completamente seguro, 
              e não podemos garantir a segurança absoluta de seus dados.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">5. Seus Direitos (LGPD)</h3>
            <p className="text-xs text-slate-400 mb-2">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Revogar o consentimento para tratamento de dados</li>
              <li>Obter informações sobre compartilhamento de dados</li>
            </ul>
            <p className="text-xs text-slate-400 mt-2">
              Para exercer seus direitos, entre em contato através do e-mail: privacidade@rewardsapp.com.br
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">6. Cookies e Tecnologias Similares</h3>
            <p className="text-xs text-slate-400">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do aplicativo e 
              personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do seu dispositivo.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">7. Retenção de Dados</h3>
            <p className="text-xs text-slate-400">
              Manteremos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, 
              ou conforme exigido por lei. Após o término de sua participação no programa, seus dados poderão ser mantidos 
              pelo prazo legal de prescrição para eventuais questões jurídicas.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">8. Alterações nesta Política</h3>
            <p className="text-xs text-slate-400">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas 
              através do aplicativo ou por e-mail. Recomendamos que você revise esta política regularmente.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">9. Contato</h3>
            <p className="text-xs text-slate-400">
              Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato:
              <br />
              E-mail: privacidade@rewardsapp.com.br
              <br />
              Telefone: (47) 3333-4444
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