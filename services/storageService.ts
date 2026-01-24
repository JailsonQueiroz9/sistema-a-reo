
import { AWBRecord, User, AWBStatus } from '../types';

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbw8oPODBtBwUuQr9iMZhWCKBOIq9qxtHF7rDGT7qI072i7lAr2JTBwZBPXhbJFivV2J/exec";
// Tenta pegar de variável de ambiente (Vite/CreateReactApp) ou usa o padrão
const ENV_API_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL;
let API_URL = localStorage.getItem('gs_api_url') || ENV_API_URL || DEFAULT_API_URL;

export const setApiUrl = (url: string) => {
  API_URL = url;
  localStorage.setItem('gs_api_url', url);
};

export const getApiUrl = () => API_URL;

export const formatDate = (dateStr: any): string => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr);
  }
};

export const toInputDate = (dateStr: any): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const mapAwbToApp = (record: any): AWBRecord => {
  const id = String(record.ID || record.id || '');
  
  // Extrair links de PDF_1 a PDF_11
  const pdfLinks: string[] = [];
  for (let i = 1; i <= 11; i++) {
    const val = record[`PDF_${i}`];
    if (val && String(val).startsWith('http')) {
      pdfLinks.push(String(val));
    }
  }

  // Normalizar Status RIGOROSAMENTE para bater com o Enum
  let rawStatus = (record.Status || record.status || '').toString().trim().toLowerCase();
  let finalStatus = AWBStatus.EM_TRANSITO;
  
  const statusEntries = Object.entries(AWBStatus);
  for (const [key, value] of statusEntries) {
    if (rawStatus === value.toLowerCase()) {
      finalStatus = value;
      break;
    }
    // Suporte para versões sem acento se necessário
    if (rawStatus === 'em transito' && value === 'Em Trânsito') {
      finalStatus = AWBStatus.EM_TRANSITO;
      break;
    }
  }

  return {
    ...record,
    ID: id,
    id: id,
    fornecedor: record.Fornecedor || record.fornecedor || '',
    saida: record.Saída || record.saida || '',
    nfs: record["NF's"] || record.nfs || '',
    awbNumber: record.AWB || record.awbNumber || '',
    status: finalStatus,
    chegada: record.Chegada || record.chegada || '',
    marca: record.Marca || record.marca || '',
    material: record.Material || record.material || '',
    observacao: record.Observação || record.observacao || '',
    rastreio: record.Rastreio || record.rastreio || '',
    documentos: pdfLinks.join('|')
  };
};

const mapUserToApp = (u: any): User => {
  const id = String(u.ID || u.id || '');
  return {
    ...u,
    ID: id,
    id: id,
    name: u.USUÁRIO || u.name || 'Usuário',
    email: u["E-MAIL"] || u.email || '',
    senha: u.SENHA || u.senha || '',
    role: (String(u.PAPEL || u.role || 'user')).toLowerCase().includes('admin') ? 'admin' : 'user',
    status: u.status || u.STATUS || 'ativo'
  };
};

export const storageService = {
  getRecords: async (): Promise<AWBRecord[]> => {
    const url_base = getApiUrl();
    if (!url_base) return [];
    try {
      const url = url_base.includes('?') ? `${url_base}&sheet=AWB` : `${url_base}?sheet=AWB`;
      const response = await fetch(url);
      const data = await response.json();
      return (Array.isArray(data) ? data : []).map(mapAwbToApp);
    } catch (error) {
      console.error("Erro ao buscar AWB:", error);
      return [];
    }
  },

  saveRecord: async (record: Partial<AWBRecord>): Promise<any> => {
    const url = getApiUrl();
    const payload = {
      ID: record.ID || record.id || Utilities_getUuid(),
      Fornecedor: record.Fornecedor || record.fornecedor || "",
      Saída: record.Saída || record.saida || "",
      "NF's": record["NF's"] || record.nfs || "",
      AWB: record.AWB || record.awbNumber || "",
      Status: record.Status || record.status || AWBStatus.EM_TRANSITO,
      Chegada: record.Chegada || record.chegada || "",
      Marca: record.Marca || record.marca || "",
      Material: record.Material || record.material || "",
      Observação: record.Observação || record.observacao || "",
      Rastreio: record.Rastreio || record.rastreio || "",
      Documentos: record.documentos || ""
    };

    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "SAVE", sheet: "AWB", data: payload })
    });
  },

  getUsers: async (): Promise<User[]> => {
    const url_base = getApiUrl();
    if (!url_base) return [];
    try {
      const url = url_base.includes('?') ? `${url_base}&sheet=CADASTRO%20USUÁRIO` : `${url_base}?sheet=CADASTRO%20USUÁRIO`;
      const response = await fetch(url);
      const data = await response.json();
      return (Array.isArray(data) ? data : []).map(mapUserToApp);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  },

  saveUser: async (user: Partial<User>): Promise<any> => {
    const url = getApiUrl();
    const payload = {
      ID: user.id || user.ID || Utilities_getUuid(),
      USUÁRIO: user.name || user.USUÁRIO,
      "E-MAIL": user.email || user["E-MAIL"],
      SENHA: user.senha || user.SENHA,
      PAPEL: user.role === 'admin' ? 'admin' : 'user',
      status: user.status
    };

    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "SAVE", sheet: "CADASTRO USUÁRIO", data: payload })
    });
  },

  deleteRecord: async (id: string): Promise<void> => {
    const url = getApiUrl();
    if (!url) return;
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "DELETE", sheet: "AWB", data: { id } })
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    const url = getApiUrl();
    if (!url) return;
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "DELETE", sheet: "CADASTRO USUÁRIO", data: { id } })
    });
  }
};

function Utilities_getUuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
