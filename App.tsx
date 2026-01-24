import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import StatusView from './components/StatusView';
import UsersView from './components/UsersView';
import Sidebar from './components/Sidebar';
import AWBModal from './components/AWBModal';
import { User, FilterState, ViewType } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    period: 'todos'
  });
  const [isAWBModalOpen, setIsAWBModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const handleClearFilters = () => {
    setFilters({ statuses: [], period: 'todos' });
  };

  const handleNewShipment = () => {
    setEditingRecord(undefined);
    setIsAWBModalOpen(true);
  };

  const handleAWBModalSave = () => {
    setIsAWBModalOpen(false);
    setEditingRecord(undefined);
    // Recarregar dados se necessário
  };

  const handleExportData = () => {
    // Dispara evento para o Dashboard exportar
    window.dispatchEvent(new CustomEvent('export-data'));
  };

  const handleSyncData = () => {
    // Recarrega dados de todas as views
    window.location.reload();
  };

  const handleImportData = () => {
    alert('Funcionalidade de importação em desenvolvimento');
  };

  const handleBackupData = () => {
    alert('Funcionalidade de backup em desenvolvimento');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            filters={filters}
            onClearFilters={handleClearFilters}
            theme={theme}
            onGoToSettings={() => setCurrentView('settings')}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        );
      case 'reports':
        return (
          <Reports
            theme={theme}
            onBack={() => setCurrentView('dashboard')}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        );
      case 'settings':
        return <Settings theme={theme} onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />;
      case 'status':
        return <StatusView theme={theme} onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />;
      case 'users':
        return <UsersView theme={theme} onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />;
      default:
        return (
          <Dashboard
            filters={filters}
            onClearFilters={handleClearFilters}
            theme={theme}
            onGoToSettings={() => setCurrentView('settings')}
          />
        );
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }


  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={setCurrentView}
        filters={filters}
        onFilterChange={setFilters}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNewShipment={handleNewShipment}
        onExportData={handleExportData}
        onSyncData={handleSyncData}
        onImportData={handleImportData}
        onBackupData={handleBackupData}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {renderView()}
      </div>
      <AWBModal
        isOpen={isAWBModalOpen}
        onClose={() => { setIsAWBModalOpen(false); setEditingRecord(undefined); }}
        onSave={handleAWBModalSave}
        editingRecord={editingRecord}
        theme={theme}
      />
    </div>
  );
};

export default App;