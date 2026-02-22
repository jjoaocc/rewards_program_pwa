// src/views/LoginView.tsx (SUBSTITUIR ARQUIVO COMPLETO)

import { useState } from 'react';
import { Mail, Lock, LogIn, Trophy, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginView() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    const success = await login(identifier.trim(), password);
    
    if (!success) {
      setError('Usuário ou senha incorretos');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-lg shadow-blue-500/20 animate-scale-in">
          <Trophy size={40} className="text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Programa de Recompensas</h1>
        <p className="text-slate-400 text-sm font-medium">Acesse sua conta para continuar</p>
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          
          <div className="mb-4">
            <label htmlFor="identifier" className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
              <Mail size={14} />
              E-mail ou Código do Cliente
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="exemplo@email.com ou 7742"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
              <Lock size={14} />
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-shake">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle size={16} className="text-rose-400" />
                <p className="text-rose-400 text-xs font-semibold">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 rounded-xl transition-smooth shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-slate-400 text-center mb-2">
            <span className="font-bold text-slate-300">💡 Dados para teste:</span>
          </p>
          <div className="space-y-1 text-xs text-slate-500 text-center">
            <p>E-mail: <code className="text-blue-400 font-mono">joao.silva@email.com</code></p>
            <p>Código: <code className="text-blue-400 font-mono">7742</code></p>
            <p>Senha: <code className="text-blue-400 font-mono">tmx</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}