import type { Customer } from '../../types';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
  'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface AddressSectionProps {
  customer: Customer;
  editedCustomer: Customer;
  isEditing: boolean;
  onChange: (updates: Partial<Customer['address']>) => void;
}

export function AddressSection({ customer, editedCustomer, isEditing, onChange }: AddressSectionProps) {
  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 animate-slide-up"
      style={{ animationDelay: '375ms' }}
    >
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
              onChange={(e) => onChange({ cep: e.target.value.replace(/\D/g, '') })}
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
                onChange={(e) => onChange({ street: e.target.value })}
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
                onChange={(e) => onChange({ number: e.target.value.replace(/\D/g, '') })}
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
              onChange={(e) => onChange({ complement: e.target.value })}
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
              onChange={(e) => onChange({ neighborhood: e.target.value })}
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
                onChange={(e) => onChange({ city: e.target.value })}
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
                onChange={(e) => onChange({ state: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-smooth"
              >
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-slate-200 font-semibold">{customer.address.state}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
