import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  RotateCw,
  Menu
} from 'lucide-react';

import { User } from '../types';
import { storageService } from '../services/storageService';
import UserModal from './UserModal';

interface UsersViewProps {
  theme: 'dark' | 'light';
  onMobileMenuToggle?: () => void;
}

const UsersView: React.FC<UsersViewProps> = ({ theme, onMobileMenuToggle }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  const isDark = theme === 'dark';

  useEffect(() => {
    loadUsers();
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

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="p-4 md:p-6 pb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className={`lg:hidden p-2 rounded-lg ${isDark
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              <Menu size={20} />
            </button>
          )}

          <div>
            <h1 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Usuários
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              <UserIcon size={12} className="text-blue-500" />
              <span>Gerenciamento de Acesso</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 md:px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 custom-scrollbar">
        <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border overflow-hidden shadow-xl`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RotateCw size={32} className="animate-spin text-blue-500 mb-4" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Carregando...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <UserIcon size={48} className="mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Nenhum usuário cadastrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-[10px] font-bold">
                <thead className={`${isDark ? 'bg-[#0f172a]/80 text-slate-500' : 'bg-slate-50 text-slate-600'} uppercase border-b`}>
                  <tr>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">E-mail</th>
                    <th className="px-5 py-4">Papel</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-slate-800' : 'divide-y divide-slate-100'}>
                  {users.map(user => (
                    <tr key={user.id} className={isDark ? 'hover:bg-blue-600/5' : 'hover:bg-slate-100/50'}>
                      <td className="px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
                          {(user.name || '').charAt(0).toUpperCase()}
                        </div>
                        <span className="uppercase">{user.name || '-'}</span>
                      </td>
                      <td className="px-5 py-4">{user.email || '-'}</td>
                      <td className="px-5 py-4 uppercase">{user.role || 'user'}</td>
                      <td className="px-5 py-4">{user.status || 'ativo'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(user)}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(user.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

export default UsersView;
