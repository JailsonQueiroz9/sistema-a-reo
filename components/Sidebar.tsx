
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Moon, 
  Sun,
  LogOut,
  ChevronLeft,
  Filter,
  CheckSquare,
  Square,
  User as UserIcon,
  Activity,
  Plus,
  Download,
  RotateCw,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  Menu,
  X
} from 'lucide-react';
import { User, ViewType, FilterState, AWBStatus } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNewShipment: () => void;
  onExportData?: () => void;
  onSyncData?: () => void;
  onImportData?: () => void;
  onBackupData?: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  onLogout, 
  currentView, 
  onNavigate, 
  filters, 
  onFilterChange,
  theme,
  onToggleTheme,
  onNewShipment,
  onExportData,
  onSyncData,
  onImportData,
  onBackupData,
  mobileOpen = false,
  onMobileToggle
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState({ status: true });

  const handleNavigate = (view: ViewType) => {
    onNavigate(view);
    if (onMobileToggle && window.innerWidth < 1024) {
      onMobileToggle();
    }
  };

  const isAdmin = user.role === 'admin';

  const menuItems: { icon: React.ReactNode; label: string; view: ViewType; adminOnly?: boolean }[] = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', view: 'dashboard' },
    { icon: <FileText size={18} />, label: 'Relatório', view: 'reports' },
    { icon: <Settings size={18} />, label: 'Configuração', view: 'settings', adminOnly: true },
    { icon: <Activity size={18} />, label: 'Status', view: 'status' },
    { icon: <UserIcon size={18} />, label: 'Usuário', view: 'users', adminOnly: true },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const getUserInitials = (name: string | undefined) => {
    if (!name) return <UserIcon size={16} />;
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const toggleStatus = (status: AWBStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'} 
        border-r flex flex-col h-screen transition-all duration-300 
        ${collapsed ? 'w-20' : 'w-64'} 
        fixed lg:static z-50
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        no-print
      `}>
      <div className="p-4 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="text-blue-500 italic">AWB</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>System</span>
            <button className="ml-auto text-slate-500 hover:text-white transition-colors" onClick={() => setCollapsed(true)}>
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mx-auto text-blue-500 hover:scale-110 transition-transform">
             <ChevronRight size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar min-h-0">
        {/* Botão Novo Embarque */}
        {!collapsed && (
          <button
            onClick={onNewShipment}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 mb-4"
          >
            <Plus size={18} />
            <span className="font-bold text-[10px] uppercase tracking-widest">Novo Embarque</span>
          </button>
        )}
        {collapsed && (
          <button
            onClick={onNewShipment}
            className="w-full flex items-center justify-center p-3 rounded-xl transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 mb-4"
            title="Novo Embarque"
          >
            <Plus size={18} />
          </button>
        )}

        {filteredMenuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleNavigate(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              currentView === item.view 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`
            }`}
          >
            {item.icon}
            {!collapsed && <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>}
          </button>
        ))}

        {!collapsed && (
          <div className="mt-6 px-1 pb-4">
            <p className={`text-[9px] uppercase font-black ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} px-2 mb-2 tracking-[0.2em]`}>AÇÕES</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (onExportData) {
                    onExportData();
                  } else {
                    alert('Funcionalidade de exportação em desenvolvimento');
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Download size={14} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Exportar Dados</span>
              </button>
              
              <button
                onClick={() => {
                  if (onSyncData) {
                    onSyncData();
                  } else {
                    alert('Sincronização em andamento...');
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <RefreshCw size={14} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Sincronizar</span>
              </button>
              
              <button
                onClick={() => {
                  if (onImportData) {
                    onImportData();
                  } else {
                    alert('Funcionalidade de importação em desenvolvimento');
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Upload size={14} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Importar Dados</span>
              </button>
              
              <button
                onClick={() => {
                  onNavigate('reports');
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet size={14} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Relatório Completo</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    if (onBackupData) {
                      onBackupData();
                    } else {
                      alert('Funcionalidade de backup em desenvolvimento');
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                    theme === 'dark' 
                      ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' 
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <RotateCw size={14} className="text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Backup</span>
                </button>
              )}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="mt-6 px-1 pb-4">
            <p className={`text-[9px] uppercase font-black ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} px-2 mb-2 tracking-[0.2em]`}>Filtros</p>
            <div className="space-y-1">
              <div>
                <button 
                  onClick={() => setFiltersOpen(prev => ({ ...prev, status: !prev.status }))}
                  className={`w-full flex items-center justify-between px-2 py-1.5 transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Status</span>
                  </div>
                  {filtersOpen.status ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                
                {filtersOpen.status && (
                  <div className="mt-1 ml-3 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {Object.values(AWBStatus).map(s => (
                      <button 
                        key={s} 
                        onClick={() => toggleStatus(s)}
                        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors group ${filters.statuses.includes(s) ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500 hover:bg-slate-800/30'}`}
                      >
                        {filters.statuses.includes(s) ? (
                          <CheckSquare size={12} className="text-blue-500" />
                        ) : (
                          <Square size={12} className="text-slate-700" />
                        )}
                        <span className="text-[9px] font-bold uppercase truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className={`p-3 border-t shrink-0 ${theme === 'dark' ? 'border-slate-800 bg-[#080d1a]/50' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-lg shadow-blue-600/20">
            {getUserInitials(user.name || user.USUÁRIO)}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className={`text-[10px] font-black uppercase tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} truncate`}>{user.name || user.USUÁRIO}</p>
              <p className="text-[8px] text-slate-500 truncate font-mono tracking-tighter">{user.email || user['E-MAIL']}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={onToggleTheme}
              className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} transition-all p-1.5 rounded-lg hover:bg-slate-800/50`}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={onLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 transition-all border border-slate-800 hover:border-red-400/20 rounded-lg bg-slate-900/50 shadow-sm"
          >
            <LogOut size={12} />
            Encerrar Sessão
          </button>
        )}
        {collapsed && (
          <button 
            onClick={onLogout}
            className="mt-3 mx-auto flex items-center justify-center p-2 text-slate-500 hover:text-red-400 transition-all"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
