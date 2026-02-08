import type { Customer } from '../types';

export function ProfileView({ customer }: { customer: Customer }) {
  return (
    <main className="pt-4">
      <h2 className="text-xl font-bold mb-6 text-white text-center">Meu Perfil</h2>
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
        <div>
          <p className="text-slate-500 text-xs uppercase font-bold">E-mail</p>
          <p className="text-slate-200">{customer.email}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase font-bold">Telefone</p>
          <p className="text-slate-200">{customer.phone}</p>
        </div>
        <div className="pt-4 border-t border-slate-700">
          <p className="text-rose-400 text-sm font-bold text-center">Sair da Conta</p>
        </div>
      </div>
    </main>
  );
}