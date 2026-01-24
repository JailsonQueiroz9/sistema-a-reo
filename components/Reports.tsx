
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, Clock, AlertTriangle, 
  Download, ArrowLeft, Box, FileText, BarChart3, PieChart as PieIcon,
  Activity, Menu
} from 'lucide-react';
import { AWBRecord, AWBStatus } from '../types';
import { storageService, formatDate } from '../services/storageService';

interface ReportsProps {
  theme: 'dark' | 'light';
  onBack: () => void;
  onMobileMenuToggle?: () => void;
}

const Reports: React.FC<ReportsProps> = ({ theme, onBack, onMobileMenuToggle }) => {
  const [records, setRecords] = useState<AWBRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await storageService.getRecords();
      setRecords(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    return records.filter(r => {
      if (!r.saida) return false;
      const recordDate = new Date(r.saida);
      return recordDate >= cutoff;
    });
  }, [records, period]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const delivered = filteredData.filter(r => r.status === AWBStatus.ENTREGUE).length;
    const delays = filteredData.filter(r => r.status === AWBStatus.ATRASADO).length;
    const efficiency = total > 0 ? Math.round((delivered / total) * 100) : 0;

    const statusData = Object.values(AWBStatus).map(status => ({
      name: status.toUpperCase(),
      value: filteredData.filter(r => r.status === status).length
    })).filter(s => s.value > 0);

    const brandMap: Record<string, number> = {};
    filteredData.forEach(r => {
      const brand = r.marca || 'Não Informado';
      brandMap[brand] = (brandMap[brand] || 0) + 1;
    });
    const brandData = Object.entries(brandMap)
      .map(([name, value]) => ({ name: name.toUpperCase(), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const timelineCounts: Record<string, number> = {};
    filteredData.forEach(r => {
      if (r.saida) {
        const formatted = formatDate(r.saida);
        timelineCounts[formatted] = (timelineCounts[formatted] || 0) + 1;
      }
    });
    const timelineData = Object.entries(timelineCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [d1, m1] = a.date.split('/').map(Number);
        const [d2, m2] = b.date.split('/').map(Number);
        return m1 !== m2 ? m1 - m2 : d1 - d2;
      });

    const materialMap: Record<string, number> = {};
    filteredData.forEach(r => {
      const mat = r.material || 'Outros';
      materialMap[mat] = (materialMap[mat] || 0) + 1;
    });
    const materialData = Object.entries(materialMap)
      .map(([name, value]) => ({ name: name.toUpperCase(), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { total, efficiency, delays, statusData, timelineData, brandData, materialData };
  }, [filteredData]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const chartTheme = {
    tooltip: { 
      backgroundColor: '#1e293b', 
      border: '1px solid #334155', 
      borderRadius: '8px', 
      fontSize: '12px',
      padding: '10px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    },
    itemStyle: { color: '#f8fafc', fontWeight: 'bold' },
    labelStyle: { color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold', fontSize: '10px' },
    grid: { strokeDasharray: "3 3", vertical: false, stroke: "#334155", opacity: 0.2 },
    axis: { fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b1120]">
        <div className="flex flex-col items-center gap-4">
          <Activity size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Processando Dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[#0b1120]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col items-center md:items-start space-y-6">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 rounded-[24px] border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/10">
                  <FileText size={32} className="md:w-10 md:h-10" />
               </div>
               <div className="text-center md:text-left space-y-2">
                 <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                    RELATÓRIOS ANALÍTICOS
                 </h1>
                 <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="h-[1px] w-8 bg-blue-500/50" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">Business Intelligence Logistics</p>
                    <div className="h-[1px] w-8 bg-blue-500/50" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-4 md:p-8 bg-[#1e293b]/30 border border-slate-800/50 rounded-[32px] backdrop-blur-xl shadow-2xl">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8">
              <button onClick={onBack} className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="p-2 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors">
                  <ArrowLeft size={16} />
                </div>
                <span className="hidden sm:inline">Voltar ao Início</span>
                <span className="sm:hidden">Voltar</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                 <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">PERÍODO:</span>
                 <select 
                    value={period} 
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="appearance-none text-xs font-black px-4 md:px-6 py-2 md:py-2.5 rounded-2xl border border-slate-700 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-lg hover:border-slate-500 w-full sm:w-auto"
                  >
                    <option value={7}>ÚLTIMOS 07 DIAS</option>
                    <option value={30}>ÚLTIMOS 30 DIAS</option>
                    <option value={90}>ÚLTIMOS 90 DIAS</option>
                    <option value={365}>HISTÓRICO ANUAL</option>
                  </select>
              </div>
           </div>
           <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-blue-600/20 active:scale-95">
              <Download size={18} /> Gerar PDF Analítico
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="VOLUME TOTAL" value={stats.total} icon={Box} color="text-blue-500" bg="bg-blue-500/10" />
          <StatCard label="EFICIÊNCIA" value={`${stats.efficiency}%`} icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard label="ATRASOS" value={stats.delays} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" />
          <StatCard label="TEMPO MÉDIO" value="4.2d" icon={Clock} color="text-yellow-500" bg="bg-yellow-500/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <ChartContainer title="DISTRIBUIÇÃO POR STATUS" icon={<PieIcon size={18} />}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={8} dataKey="value" stroke="none">
                  {stats.statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={chartTheme.tooltip} 
                  itemStyle={chartTheme.itemStyle}
                  labelStyle={chartTheme.labelStyle}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', paddingTop: '30px', letterSpacing: '1px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="RANKING DE VOLUME POR MARCA" icon={<BarChart3 size={18} />}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical" data={stats.brandData} margin={{ left: 30, right: 30 }}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={chartTheme.axis} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={chartTheme.tooltip} 
                  itemStyle={chartTheme.itemStyle}
                  labelStyle={chartTheme.labelStyle}
                  cursor={{ fill: '#334155', opacity: 0.1 }} 
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {stats.brandData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="FLUXO DE MOVIMENTAÇÃO DIÁRIA" icon={<Activity size={18} />}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis dataKey="date" tick={chartTheme.axis} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={chartTheme.axis} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={chartTheme.tooltip} 
                  itemStyle={chartTheme.itemStyle}
                  labelStyle={chartTheme.labelStyle}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="ANÁLISE POR CATEGORIA DE MATERIAL" icon={<Box size={18} />}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.materialData}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis dataKey="name" tick={chartTheme.axis} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={chartTheme.axis} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={chartTheme.tooltip} 
                  itemStyle={chartTheme.itemStyle}
                  labelStyle={chartTheme.labelStyle}
                  cursor={{ fill: '#334155', opacity: 0.1 }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                  {stats.materialData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-[#1e293b]/40 border border-slate-800/60 p-10 rounded-[40px] shadow-2xl hover:bg-[#1e293b]/60 hover:translate-y-[-6px] transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full blur-[80px] -mr-16 -mt-16 opacity-50`} />
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      <Icon className={color} size={28} />
    </div>
    <div className="space-y-2 relative z-10">
      <p className={`text-5xl font-black ${color} tracking-tighter italic`}>{value}</p>
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{label}</p>
    </div>
  </div>
);

const ChartContainer = ({ children, title, icon }: any) => (
  <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-[48px] p-10 flex flex-col shadow-2xl ChartContainer hover:border-slate-700/80 transition-colors duration-500">
    <div className="flex items-center gap-4 mb-10">
      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner">
        {icon}
      </div>
      <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">{title}</h3>
    </div>
    <div className="flex-1 w-full min-h-[320px]">
      {children}
    </div>
  </div>
);

export default Reports;
