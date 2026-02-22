import { useState } from 'react';
import { 
  Edit2, 
  Save, 
  X, 
  TrendingUp, 
  Award, 
  Calendar,
  HelpCircle,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react';
import type { Customer, ActivePage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, ApiError } from '../lib/api-client';

interface ProfileViewProps {
  customer: Customer;
  onNavigate: (page: ActivePage) => void;
  onUpdate: () => void;
}

export function ProfileView({ customer, onNavigate, onUpdate}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const { logout } = useAuth(); 

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await apiClient.patch('/customers/me', {
        name: editedCustomer.name,
        phone: editedCustomer.phone,
        mobile: editedCustomer.secondaryPhone,
        birth_date: editedCustomer.birthDate ?? null,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar dados.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const memberSinceDate = new Date(customer.stats.memberSince);
  memberSinceDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const memberDays = Math.max(0, Math.floor((today.getTime() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <main className="pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white animate-fade-in">Meu Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
          >
            <Edit2 size={16} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-smooth font-semibold text-sm"
            >
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>

            {/* Adiciona abaixo dos botões, se houver erro: */}
            {saveError && (
              <p className="text-xs text-rose-400 mt-2 text-right">{saveError}</p>
            )}
          </div>
        )}
      </div>

      {/* Cards de Estatísticas - ESCONDE NO MODO EDIÇÃO */}
      {!isEditing && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="animate-slide-up bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Total Acumulado</span>
            </div>
            <p className="text-2xl font-black text-white">
              R$ {formatCurrency(customer.stats.totalEarned)}
            </p>
          </div>

          <div className="animate-slide-up bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-2xl p-4" style={{ animationDelay: '75ms' }}>
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-rose-400" />
              <span className="text-xs text-rose-400 font-semibold">Total Resgatado</span>
            </div>
            <p className="text-2xl font-black text-white">
              R$ {formatCurrency(customer.stats.totalRedeemed)}
            </p>
          </div>

          <div className="animate-slide-up col-span-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-4" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span className="text-xs text-blue-400 font-semibold">Membro desde</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {formatDate(customer.stats.memberSince)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {memberDays} {memberDays === 1 ? 'dia' : 'dias'} economizando com a gente! 🎉
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Dados */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up" style={{ animationDelay: '225ms' }}>
        <h3 className="text-sm font-bold text-slate-200 mb-4">Dados Pessoais</h3>
        
        <div className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Nome Completo</label>
            {isEditing ? (
              <input
                type="text"
                value={editedCustomer.name}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.name}</p>
            )}
          </div>

          {/* CPF/CNPJ (não editável) */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">
              {customer.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
            </label>
            <p className="text-slate-200 font-semibold font-mono">{customer.document}</p>
            <p className="text-xs text-slate-500 mt-1">Não é possível alterar este campo</p>
          </div>

          {/* Data de Nascimento / Fundação */}
          {customer.documentType === 'cpf' ? (
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Data de Nascimento</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedCustomer.birthDate || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, birthDate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              ) : (
                <p className="text-slate-200 font-semibold">
                  {customer.birthDate ? formatDate(customer.birthDate) : 'Não informado'}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Data de Fundação</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedCustomer.companyFoundedDate || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, companyFoundedDate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              ) : (
                <p className="text-slate-200 font-semibold">
                  {customer.companyFoundedDate ? formatDate(customer.companyFoundedDate) : 'Não informado'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contatos */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-sm font-bold text-slate-200 mb-4">Contatos</h3>
        
        <div className="space-y-4">
          {/* Email Principal */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Principal</label>
            {isEditing ? (
              <input
                type="email"
                value={editedCustomer.email}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.email}</p>
            )}
          </div>

          {/* Email Secundário */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Secundário (opcional)</label>
            {isEditing ? (
              <input
                type="email"
                value={editedCustomer.secondaryEmail || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, secondaryEmail: e.target.value })}
                placeholder="email@exemplo.com"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.secondaryEmail || 'Não informado'}</p>
            )}
          </div>

          {/* Telefone Principal */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Telefone Principal</label>
            {isEditing ? (
              <input
                type="tel"
                inputMode="numeric"
                value={editedCustomer.phone}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setEditedCustomer({ ...editedCustomer, phone: numericValue });
                }}
                placeholder="47999999999"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.phone}</p>
            )}
          </div>

          {/* Telefone Secundário */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Telefone Secundário (opcional)</label>
            {isEditing ? (
              <input
                type="tel"
                inputMode="numeric"
                value={editedCustomer.secondaryPhone || ''}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setEditedCustomer({ ...editedCustomer, secondaryPhone: numericValue });
                }}
                placeholder="47988888888"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.secondaryPhone || 'Não informado'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up" style={{ animationDelay: '375ms' }}>
        <h3 className="text-sm font-bold text-slate-200 mb-4">Endereço</h3>
        
        <div className="space-y-4">
          {/* CEP */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">CEP</label>
            {isEditing ? (
              <input
                type="text"
                inputMode="numeric"
                value={editedCustomer.address.cep}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setEditedCustomer({ 
                    ...editedCustomer, 
                    address: { ...editedCustomer.address, cep: numericValue }
                  });
                }}
                placeholder="89201400"
                maxLength={8}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.address.cep}</p>
            )}
          </div>

          {/* Rua e Número */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Rua</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCustomer.address.street}
                  onChange={(e) => setEditedCustomer({ 
                    ...editedCustomer, 
                    address: { ...editedCustomer.address, street: e.target.value }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              ) : (
                <p className="text-slate-200 font-semibold">{customer.address.street}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Número</label>
              {isEditing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={editedCustomer.address.number}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setEditedCustomer({ 
                      ...editedCustomer, 
                      address: { ...editedCustomer.address, number: numericValue }
                    });
                  }}
                  placeholder="1500"
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              ) : (
                <p className="text-slate-200 font-semibold">{customer.address.number}</p>
              )}
            </div>
          </div>

          {/* Complemento */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Complemento (opcional)</label>
            {isEditing ? (
              <input
                type="text"
                value={editedCustomer.address.complement || ''}
                onChange={(e) => setEditedCustomer({ 
                  ...editedCustomer, 
                  address: { ...editedCustomer.address, complement: e.target.value }
                })}
                placeholder="Apto, Bloco, etc."
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.address.complement || 'Não informado'}</p>
            )}
          </div>

          {/* Bairro */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Bairro</label>
            {isEditing ? (
              <input
                type="text"
                value={editedCustomer.address.neighborhood}
                onChange={(e) => setEditedCustomer({ 
                  ...editedCustomer, 
                  address: { ...editedCustomer.address, neighborhood: e.target.value }
                })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">{customer.address.neighborhood}</p>
            )}
          </div>

          {/* Cidade e UF */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Cidade</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCustomer.address.city}
                  onChange={(e) => setEditedCustomer({ 
                    ...editedCustomer, 
                    address: { ...editedCustomer.address, city: e.target.value }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                />
              ) : (
                <p className="text-slate-200 font-semibold">{customer.address.city}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">UF</label>
              {isEditing ? (
                <select
                  value={editedCustomer.address.state}
                  onChange={(e) => setEditedCustomer({ 
                    ...editedCustomer, 
                    address: { ...editedCustomer.address, state: e.target.value }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
                >
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              ) : (
                <p className="text-slate-200 font-semibold">{customer.address.state}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção Ajuda & Legal */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '450ms' }}>
        <h3 className="text-sm font-bold text-slate-200 mb-4">Ajuda & Legal</h3>
        
        <div className="space-y-2">
          <button 
            onClick={() => onNavigate('ajuda')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-smooth group"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-slate-400 group-hover:text-blue-400 transition-smooth" />
              <span className="text-sm text-slate-200 font-medium">Central de Ajuda</span>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-smooth" />
          </button>

          <button 
            onClick={() => onNavigate('termos')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-smooth group"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-slate-400 group-hover:text-blue-400 transition-smooth" />
              <span className="text-sm text-slate-200 font-medium">Termos de Uso</span>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-smooth" />
          </button>

          <button 
            onClick={() => onNavigate('privacidade')}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-smooth group"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-slate-400 group-hover:text-blue-400 transition-smooth" />
              <span className="text-sm text-slate-200 font-medium">Política de Privacidade</span>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-smooth" />
          </button>
        </div>
      </div>

      {/* Botão Sair (no final) */}
      <button onClick={logout} className="w-full mt-6 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-smooth">
        Sair da Conta
      </button>
    </main>
  );
}