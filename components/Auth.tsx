
import React, { useState } from 'react';
import { Shield, Lock, Mail, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { storageService, getApiUrl } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const apiUrl = getApiUrl();
    if (!apiUrl) {
      setError('ERRO DE CONFIGURAÇÃO: URL da Planilha não encontrada.');
      return;
    }

    setIsLoading(true);

    try {
      const users = await storageService.getUsers();

      // Tentar encontrar usuário na planilha
      const foundUser = users.find(u => {
        const uEmail = String(u["E-MAIL"] || u.email || '').toLowerCase().trim();
        const uPass = String(u.SENHA || u.senha || '123456').trim();
        return uEmail === email.toLowerCase().trim() && uPass === password.trim();
      });

      if (foundUser) {
        if (foundUser.status === 'inativo') {
          setError('ACESSO BLOQUEADO: Seu usuário está inativo.');
        } else {
          onLogin(foundUser);
        }
      } else {
        // Fallback para admin padrão caso a planilha esteja vazia
        // SEGURANÇA: Credenciais hardcoded desabilitadas. Use a planilha para gerenciar usuários.
        // if (email.toLowerCase() === 'admin@empresa.com' && password === 'admin') {
        //    onLogin({
        //      id: '1', ID: '1', USUÁRIO: 'Admin Master', name: 'Admin Master',
        //      "E-MAIL": 'admin@empresa.com', email: 'admin@empresa.com',
        //      PAPEL: 'admin', role: 'admin', status: 'ativo', SENHA: 'admin', senha: 'admin'
        //    });
        // } else {
        setError('ACESSO NEGADO: Usuário não encontrado ou senha incorreta.');
        // }
      }
    } catch (err) {
      setError('FALHA NA CONEXÃO: Verifique a URL do Script e a permissão "Qualquer pessoa".');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#080d1a] overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-blue-500 mb-6 shadow-2xl shadow-blue-500/10">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            Portal de Logística Follow-UP
          </h1>
          <p className="mt-3 text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
            Controle de Fluxo Aéreo v2.1
          </p>
        </div>

        <div className="bg-[#111827]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] border border-slate-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="text-[11px] font-black uppercase tracking-wider leading-tight">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-medium placeholder:text-slate-700"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha Privada</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-medium placeholder:text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-[0.2em]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Sincronizando...
                </span>
              ) : (
                <>
                  Entrar no Sistema
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center space-y-2">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">
            Google Sheets Enterprise Database
          </p>
          <div className="flex justify-center gap-4 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
