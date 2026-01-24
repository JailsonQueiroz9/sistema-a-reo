import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  RotateCw,
  Globe,
  AlertCircle,
  Save
} from 'lucide-react';

import { User } from '../types';
import {
  storageService,
  getApiUrl,
  setApiUrl as saveApiUrl
} from '../services/storageService';
import UserModal from './UserModal';

interface SettingsProps {
  theme: 'dark' | 'light';
}

const Settings: React.FC<SettingsProps> = ({ theme }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [apiUrlState, setApiUrlState] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'api'>('users');

  const isDark = theme === 'dark';

  useEffect(() => {
    loadUsers();
    const url = getApiUrl();
    setApiUrlState(url || '');
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await storageService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    if (window.confirm('Confirmar exclusão do usuário?')) {
      setLoading(true);
      try {
        await storageService.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
    await loadUsers();
  };

  const handleApiSave = async () => {
    setLoading(true);
    try {
      saveApiUrl(apiUrlState);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações da API:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="p-6 pb-2">
        <h1 className={`text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>
          Configurações
        </h1>
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
          <SettingsIcon size={12} className="text-blue-500" />
          <span>Controle de Usuários e Integrações</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pb-2">
        <div className={`flex gap-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'users'
                ? 'text-blue-500 border-blue-500'
                : 'text-slate-400 border-transparent'
              }`}
          >
            <div className="flex items-center gap-2">
              <UserIcon size={14} />
              Usuários
            </div>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'api'
                ? 'text-blue-500 border-blue-500'
                : 'text-slate-400 border-transparent'
              }`}
          >
            <div className="flex items-center gap-2">
              <Globe size={14} />
              API
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {activeTab === 'users' && (
          <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border`}>
            <div className="p-6 flex justify-between items-center border-b border-slate-700">
              <h2 className="text-sm font-black uppercase tracking-wider">Gerenciamento de Usuários</h2>
              <button
                onClick={() => {
                  setEditingUser(undefined);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase bg-blue-600 text-white rounded-xl"
              >
                <Plus size={14} /> Novo
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <RotateCw className="animate-spin text-blue-500" />
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-400 uppercase">
                  <tr>
                    <th className="p-4 text-left">Nome</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Papel</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-t border-slate-700">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4 uppercase">{user.role}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(user)}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(user.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'api' && (
          <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border p-6`}>
            <label className="text-xs font-black uppercase flex items-center gap-2 mb-2">
              <Globe size={12} /> URL Google Apps Script
            </label>
            <input
              value={apiUrlState}
              onChange={e => setApiUrlState(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs"
            />

            {saved && (
              <p className="mt-3 text-emerald-500 text-xs font-black uppercase">
                Configurações salvas!
              </p>
            )}

            <button
              onClick={handleApiSave}
              disabled={loading}
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase rounded-xl"
            >
              {loading ? <RotateCw size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar
            </button>
          </div>
        )}
      </main>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(undefined);
        }}
        onSave={handleSave}
        editingUser={editingUser}
        theme={theme}
      />
    </div>
  );
};

export default Settings;
