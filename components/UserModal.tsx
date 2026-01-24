
import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail, Shield, ToggleLeft, Lock, RotateCw } from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  editingUser?: User;
  theme: 'dark' | 'light';
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, theme }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    senha: '',
    role: 'user',
    status: 'ativo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setFormData({
        ...editingUser,
        name: editingUser.name || editingUser.USUÁRIO,
        email: editingUser.email || editingUser['E-MAIL'],
        senha: editingUser.senha || editingUser.SENHA
      });
    } else {
      setFormData({
        name: '',
        email: '',
        senha: '',
        role: 'user',
        status: 'ativo'
      });
    }
    setError('');
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const id = editingUser?.id || editingUser?.ID || Math.random().toString(36).substring(2, 11);
    const name = formData.name || '';
    const email = formData.email || '';
    const senha = formData.senha || '';
    const role = (formData.role as 'admin' | 'user') || 'user';
    const status = (formData.status as 'ativo' | 'inativo') || 'ativo';

    const userData: User = {
      id,
      name,
      email,
      senha,
      SENHA: senha,
      role,
      status,
      ID: id,
      USUÁRIO: name,
      "E-MAIL": email,
      PAPEL: role === 'admin' ? 'admin' : 'user'
    };

    try {
      await storageService.saveUser(userData);
      onSave(userData);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setError('Falha na conexão com a planilha. Verifique a URL do Script.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className={`${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} w-full max-w-md rounded-[24px] border shadow-2xl overflow-hidden flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
          <div>
            <h2 className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingUser ? 'Acesso do Usuário' : 'Novo Usuário'}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão de Permissões</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <p className="text-[10px] font-bold text-red-500 uppercase bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <UserIcon size={12} /> Nome do Operador
            </label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all uppercase tracking-wider shadow-inner`}
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> E-mail Profissional
            </label>
            <input 
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all shadow-inner`}
              placeholder="joao.silva@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} /> Senha de Acesso
            </label>
            <input 
              required
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={`w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all shadow-inner`}
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} /> Papel
              </label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all shadow-inner cursor-pointer`}
              >
                <option value="user">Leitura</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ToggleLeft size={12} /> Estado
              </label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all shadow-inner cursor-pointer`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button 
              type="button"
              disabled={loading}
              onClick={onClose}
              className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${isDark ? 'text-slate-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
             >
               Cancelar
             </button>
             <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
               Salvar Acesso
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
