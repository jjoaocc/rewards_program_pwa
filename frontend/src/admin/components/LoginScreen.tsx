import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (secret: string) => void;
  isLoggingIn: boolean;
  error: string | null;
}

export function LoginScreen({ onLogin, isLoggingIn, error }: LoginScreenProps) {
  const [secret, setSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = secret.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 animate-fade-in">
        <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center mb-5 text-2xl">🔐</div>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Painel Admin</h1>
        <p className="text-sm text-slate-500 mb-7">Push Notifications — Rewards Program</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-secret" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Senha de administrador
          </label>
          <input
            id="admin-secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Digite a chave secreta"
            disabled={isLoggingIn}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-smooth"
          >
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-950 border border-rose-900 text-rose-400 text-xs font-semibold rounded-xl animate-shake">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
