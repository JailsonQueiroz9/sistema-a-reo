import React, { useState, useEffect } from 'react';
import { X, Save, Truck, Calendar, FileText, Hash, Activity, MapPin, Box, Link as LinkIcon, Files, RotateCw } from 'lucide-react';
import { AWBRecord, AWBStatus } from './types';
import { storageService, toInputDate } from './services/storageService';

interface AWBModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    editingRecord?: AWBRecord;
    theme?: 'dark' | 'light';
}

const AWBModal: React.FC<AWBModalProps> = ({ isOpen, onClose, onSave, editingRecord, theme = 'dark' }) => {
    const [formData, setFormData] = useState<Partial<AWBRecord>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingRecord) {
            setFormData({ ...editingRecord });
        } else {
            setFormData({
                status: AWBStatus.EM_TRANSITO,
                saida: new Date().toISOString().split('T')[0]
            });
        }
    }, [editingRecord, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await storageService.saveRecord(formData);
            onSave();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar registro.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isDark = theme === 'dark';
    const inputClass = `w-full ${isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all uppercase tracking-wider shadow-inner`;
    const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className={`${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[24px] border shadow-2xl flex flex-col`}>

                <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between sticky top-0 ${isDark ? 'bg-[#1e293b]' : 'bg-white'} z-10`}>
                    <div>
                        <h2 className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {editingRecord ? 'Editar Registro AWB' : 'Novo Registro AWB'}
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Controle Logístico</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-1">
                        <label className={labelClass}><Truck size={12} /> Fornecedor</label>
                        <input name="fornecedor" value={formData.fornecedor || ''} onChange={handleChange} className={inputClass} required />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Hash size={12} /> AWB</label>
                        <input name="awbNumber" value={formData.awbNumber || ''} onChange={handleChange} className={inputClass} required />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><FileText size={12} /> NF's</label>
                        <input name="nfs" value={formData.nfs || ''} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Activity size={12} /> Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                            {Object.values(AWBStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Calendar size={12} /> Data Saída</label>
                        <input type="date" name="saida" value={toInputDate(formData.saida)} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Calendar size={12} /> Previsão/Chegada</label>
                        <input type="date" name="chegada" value={toInputDate(formData.chegada)} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Box size={12} /> Marca</label>
                        <input name="marca" value={formData.marca || ''} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}><Box size={12} /> Material</label>
                        <input name="material" value={formData.material || ''} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className={labelClass}><LinkIcon size={12} /> Link de Rastreio</label>
                        <input type="url" name="rastreio" value={formData.rastreio || ''} onChange={handleChange} className={inputClass} placeholder="https://..." />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className={labelClass}><Files size={12} /> Documentos (Links PDF separados por |)</label>
                        <input name="documentos" value={formData.documentos || ''} onChange={handleChange} className={inputClass} placeholder="http://doc1.pdf | http://doc2.pdf" />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className={labelClass}><MapPin size={12} /> Observações</label>
                        <textarea name="observacao" value={formData.observacao || ''} onChange={handleChange} className={`${inputClass} min-h-[100px] resize-none`} />
                    </div>

                    <div className="md:col-span-2 pt-4 flex gap-4">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={onClose}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${isDark ? 'text-slate-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
                            Salvar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AWBModal;