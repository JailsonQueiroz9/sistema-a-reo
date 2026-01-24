
import React, { useState, useEffect } from 'react';
import { Activity, Package, AlertTriangle, CheckCircle, Clock, RotateCw, Menu } from 'lucide-react';
import { AWBRecord, AWBStatus } from '../types';
import { storageService, formatDate, getApiUrl } from '../services/storageService';

interface StatusViewProps {
  theme: 'dark' | 'light';
  onMobileMenuToggle?: () => void;
}

const StatusView: React.FC<StatusViewProps> = ({ theme, onMobileMenuToggle }) => {
  const [records, setRecords] = useState<AWBRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AWBStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

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

  const getStatusIcon = (status: AWBStatus) => {
    switch (status) {
      case AWBStatus.EM_TRANSITO:
        return <Clock size={16} className="text-yellow-500" />;
      case AWBStatus.DISPONIVEL:
        return <CheckCircle size={16} className="text-emerald-500" />;
      case AWBStatus.ENTREGUE:
        return <Package size={16} className="text-blue-500" />;
      case AWBStatus.ATRASADO:
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Activity size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: AWBStatus) => {
    switch (status) {
      case AWBStatus.EM_TRANSITO: return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case AWBStatus.DISPONIVEL: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
      case AWBStatus.ENTREGUE: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case AWBStatus.ATRASADO: return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const filteredRecords = selectedStatus === 'all' 
    ? records 
    : records.filter(r => r.status === selectedStatus);

  const statusCounts = Object.values(AWBStatus).map(status => ({
    status,
    count: records.filter(r => r.status === status).length
  }));

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
            <h1 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>Status</h1>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              <Activity size={12} className="text-blue-500" />
              <span>Monitoramento de Status</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-6 custom-scrollbar">
        {/* Filtros de Status */}
        <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-[24px] border overflow-hidden shadow-2xl backdrop-blur-md`}>
          <div className="p-6">
            <h2 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Filtros</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : `${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                }`}
              >
                Todos ({records.length})
              </button>
              {statusCounts.map(({ status, count }) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : `${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                  }`}
                >
                  {getStatusIcon(status)}
                  {status} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className={`${isDark ? 'bg-[#1e293b]/60 border-slate-800' : 'bg-white border-slate-200'} rounded-[24px] border overflow-hidden shadow-2xl backdrop-blur-md`}>
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <RotateCw size={32} className="animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Carregando...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 italic">
                <Package size={48} className="mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem registros para exibir</p>
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap min-w-[1000px] border-collapse">
                <thead className={`${isDark ? 'bg-[#0f172a]/80 text-slate-500' : 'bg-slate-50 text-slate-600'} text-[9px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <tr>
                    <th className="px-5 py-5">AWB</th>
                    <th className="px-5 py-5">Fornecedor</th>
                    <th className="px-5 py-5">Status</th>
                    <th className="px-5 py-5">Saída</th>
                    <th className="px-5 py-5">Chegada</th>
                    <th className="px-5 py-5">Marca</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className={`${isDark ? 'hover:bg-blue-600/5' : 'hover:bg-slate-100/50'} transition-colors text-[10px] font-bold`}>
                      <td className={`px-5 py-4 font-mono text-blue-400 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.awbNumber || '-'}</td>
                      <td className={`px-5 py-4 uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.fornecedor || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border status-badge ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(record.saida)}</td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(record.chegada)}</td>
                      <td className={`px-5 py-4 uppercase text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.marca || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatusView;
