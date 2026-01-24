
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Download,
  Package,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  FileText,
  FileBox,
  ChevronDown,
  Menu
} from 'lucide-react';
import { AWBRecord, AWBStatus, FilterState, User } from '../types';
import { storageService, getApiUrl, formatDate } from '../services/storageService';
import AWBModal from './AWBModal';

interface DashboardProps {
  filters: FilterState;
  onClearFilters: () => void;
  theme: 'dark' | 'light';
  onGoToSettings: () => void;
  onMobileMenuToggle?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ filters, onClearFilters, theme, onGoToSettings, onMobileMenuToggle }) => {
  const [records, setRecords] = useState<AWBRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AWBRecord | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeDocMenu, setActiveDocMenu] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    if (!getApiUrl()) return;
    setLoading(true);
    try {
      const data = await storageService.getRecords();
      setRecords(data);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // FILTRO CORRIGIDO: Normaliza status para comparação direta com o enum
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch =
        (r.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.awbNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.nfs || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.material || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(r.status);
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, filters.statuses]);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (confirm('Confirmar exclusão definitiva na Planilha?')) {
      setLoading(true);
      await storageService.deleteRecord(id);
      setTimeout(loadData, 1500);
    }
  };

  const handleEdit = (record: AWBRecord) => {
    if (!isAdmin) return;
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const exportExcel = useCallback(() => {
    const headers = "Fornecedor;Saida;NFs;AWB;Status;Chegada;Marca;Material;Observacao;Rastreio;Documentos\n";
    const rows = filteredRecords.map(r => `${r.fornecedor};${formatDate(r.saida)};${r.nfs};${r.awbNumber};${r.status};${formatDate(r.chegada)};${r.marca};${r.material};${r.observacao};${r.rastreio};${r.documentos}`).join("\n");
    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rastreamento_awb_${new Date().getTime()}.csv`;
    a.click();
  }, [filteredRecords]);

  useEffect(() => {
    // Listener para exportação de dados
    const handleExportEvent = () => {
      exportExcel();
    };
    
    window.addEventListener('export-data', handleExportEvent);
    
    return () => {
      window.removeEventListener('export-data', handleExportEvent);
    };
  }, [exportExcel]);

  const handlePrintPdf = () => {
    window.print();
  };

  const getStatusColor = (status: AWBStatus) => {
    switch (status) {
      case AWBStatus.EM_TRANSITO: return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case AWBStatus.DISPONIVEL: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
      case AWBStatus.ENTREGUE: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case AWBStatus.ATRASADO: return 'bg-red-500/10 border-red-500/30 text-red-400';
      case AWBStatus.OK: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <header className="p-4 md:p-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileMenuToggle}
            className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'} transition-all`}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>Logística Inteligente</h1>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Monitoramento PCP</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print flex-wrap">
          <button onClick={loadData} className={`flex items-center gap-2 px-3 md:px-4 py-2 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400 border-slate-800 hover:bg-slate-800' : 'text-slate-600 border-slate-200 hover:bg-slate-100'} border rounded-xl transition-all`}>
            <RotateCw size={12} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Atualizar</span>
          </button>
          {isAdmin && (
            <button onClick={() => { setEditingRecord(undefined); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 md:px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
              <Plus size={14} /> <span className="hidden sm:inline">Novo AWB</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-6 custom-scrollbar">
        <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-[24px] border overflow-hidden shadow-2xl backdrop-blur-md table-container`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex flex-col md:flex-row md:items-center justify-between gap-4 no-print`}>
            <div className="relative group">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar registros..."
                className={`${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold w-full md:w-64 focus:outline-none focus:border-blue-500 transition-all uppercase tracking-wider`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r border-slate-700/50 pr-2 mr-1">
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`} title="Tabela"><List size={16} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`} title="Cards"><LayoutGrid size={16} /></button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrintPdf} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} text-[10px] font-black uppercase tracking-widest transition-all shadow-md`}>
                  <Download size={14} /> PDF
                </button>
                <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md">
                  <FileSpreadsheet size={14} /> EXCEL
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24"><RotateCw size={32} className="animate-spin text-blue-500 mb-4" /><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sincronizando...</p></div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 italic"><Package size={48} className="mb-4 opacity-10" /><p className="text-[10px] font-black uppercase tracking-widest">Sem dados para exibir</p></div>
            ) : viewMode === 'table' ? (
              <table className="w-full text-left whitespace-nowrap min-w-[1300px] border-collapse">
                <thead className={`${isDark ? 'bg-[#0f172a]/80 text-slate-500' : 'bg-slate-50 text-slate-600'} text-[9px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <tr>
                    <th className="px-5 py-5">Fornecedor</th>
                    <th className="px-5 py-5">Saída</th>
                    <th className="px-5 py-5">NF's</th>
                    <th className="px-5 py-5">AWB</th>
                    <th className="px-5 py-5">Status</th>
                    <th className="px-5 py-5">Chegada</th>
                    <th className="px-5 py-5">Marca</th>
                    <th className="px-5 py-5">Material</th>
                    <th className="px-5 py-5">Obs</th>
                    <th className="px-5 py-5 text-center">Rastreio</th>
                    <th className="px-5 py-5 text-center">Docs</th>
                    <th className="px-5 py-5 text-right no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className={`${isDark ? 'hover:bg-blue-600/5' : 'hover:bg-slate-100/50'} transition-colors group text-[10px] font-bold`}>
                      <td className={`px-5 py-4 uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.fornecedor || '-'}</td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(record.saida)}</td>
                      <td className="px-5 py-4 text-slate-500">{record.nfs || '-'}</td>
                      <td className="px-5 py-4 font-mono text-blue-400 font-black">{record.awbNumber || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border status-badge ${getStatusColor(record.status)}`}>{record.status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(record.chegada)}</td>
                      <td className="px-5 py-4 uppercase text-slate-400">{record.marca || '-'}</td>
                      <td className="px-5 py-4 text-slate-500 truncate max-w-[120px]">{record.material || '-'}</td>
                      <td className="px-5 py-4 text-slate-500 truncate max-w-[120px]" title={record.observacao}>{record.observacao || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        {record.rastreio ? (
                          <a href={record.rastreio} target="_blank" rel="noopener noreferrer" className="inline-flex p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 no-print">
                            <ExternalLink size={12} />
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-4 text-center relative overflow-visible">
                        {record.documentos ? (
                          <div className="relative inline-block no-print">
                            <button
                              onClick={() => setActiveDocMenu(activeDocMenu === record.id ? null : record.id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-sm flex items-center gap-1"
                            >
                              <FileText size={12} />
                              <ChevronDown size={8} />
                            </button>
                            {activeDocMenu === record.id && (
                              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 rounded-xl shadow-2xl border z-[100] p-1.5 overflow-hidden ${isDark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5">
                                  {record.documentos.split('|').map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-1.5 rounded-md text-[9px] font-bold ${isDark ? 'hover:bg-slate-800 text-emerald-400' : 'hover:bg-slate-50 text-emerald-600'} transition-all`}>
                                      <FileBox size={12} /> Doc {i + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEdit(record)} className="p-1.5 hover:bg-blue-500/10 rounded-md text-slate-400 hover:text-blue-400"><Edit size={14} /></button>
                              <button onClick={() => handleDelete(record.ID || record.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecords.map((record) => (
                  <div key={record.id} className={`${isDark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'} border rounded-[20px] p-5 shadow-lg group hover:border-blue-500/50 transition-all flex flex-col`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10"><Package size={20} /></div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border status-badge ${getStatusColor(record.status)}`}>{record.status}</span>
                    </div>
                    <h3 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase mb-1 truncate`}>{record.fornecedor}</h3>
                    <p className="text-[10px] text-blue-400 font-mono font-black mb-4">{record.awbNumber}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500"><span>Saída</span><span className="text-slate-400">{formatDate(record.saida)}</span></div>
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500"><span>Marca</span><span className="text-slate-400">{record.marca}</span></div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800/20 no-print">
                      {record.rastreio && (
                        <a href={record.rastreio} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600/10 text-blue-500 text-[9px] font-black uppercase transition-all">
                          <ExternalLink size={12} /> Link
                        </a>
                      )}
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(record)} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"><Edit size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AWBModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); setTimeout(loadData, 1000); }} editingRecord={editingRecord} theme={theme} />
    </div>
  );
};

export default Dashboard;
