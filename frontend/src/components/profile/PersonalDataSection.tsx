import { formatDateLong } from '../../lib/format';
import type { Customer } from '../../types';

interface PersonalDataSectionProps {
  customer: Customer;
  editedCustomer: Customer;
  isEditing: boolean;
  onChange: (updates: Partial<Customer>) => void;
}

export function PersonalDataSection({ customer, editedCustomer, isEditing, onChange }: PersonalDataSectionProps) {
  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up"
      style={{ animationDelay: '225ms' }}
    >
      <h3 className="text-sm font-bold text-slate-200 mb-4">Dados Pessoais</h3>

      <div className="space-y-4">
        {/* Nome Completo */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Nome Completo</label>
          {isEditing ? (
            <input
              type="text"
              value={editedCustomer.name}
              onChange={(e) => onChange({ name: e.target.value })}
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
                onChange={(e) => onChange({ birthDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">
                {customer.birthDate ? formatDateLong(customer.birthDate) : 'Não informado'}
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
                onChange={(e) => onChange({ companyFoundedDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              />
            ) : (
              <p className="text-slate-200 font-semibold">
                {customer.companyFoundedDate ? formatDateLong(customer.companyFoundedDate) : 'Não informado'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
