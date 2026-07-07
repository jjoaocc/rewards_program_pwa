import type { Customer } from '../../types';

interface ContactsSectionProps {
  customer: Customer;
  editedCustomer: Customer;
  isEditing: boolean;
  onChange: (updates: Partial<Customer>) => void;
}

export function ContactsSection({ customer, editedCustomer, isEditing, onChange }: ContactsSectionProps) {
  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up"
      style={{ animationDelay: '300ms' }}
    >
      <h3 className="text-sm font-bold text-slate-200 mb-4">Contatos</h3>

      <div className="space-y-4">
        {/* Email Principal */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Principal</label>
          {isEditing ? (
            <input
              type="email"
              value={editedCustomer.email}
              onChange={(e) => onChange({ email: e.target.value })}
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
              onChange={(e) => onChange({ secondaryEmail: e.target.value })}
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
              onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, '') })}
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
              onChange={(e) => onChange({ secondaryPhone: e.target.value.replace(/\D/g, '') })}
              placeholder="47988888888"
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
            />
          ) : (
            <p className="text-slate-200 font-semibold">{customer.secondaryPhone || 'Não informado'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
