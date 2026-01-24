
export enum AWBStatus {
  EM_TRANSITO = 'Em Trânsito',
  DISPONIVEL = 'Disponível',
  COLETA_PARCIAL = 'Coletado Parcial',
  ENTREGUE = 'Entregue',
  ATRASADO = 'Atrasado',
  AGUARDANDO_AWB = 'Aguardando AWB',
  COLETA_ERRADA = 'Coleta Errada',
  OK = 'OK'
}

export type ViewType = 'dashboard' | 'reports' | 'settings' | 'status' | 'users';

export interface FilterState {
  statuses: AWBStatus[];
  period: 'hoje' | 'semana' | 'mes' | 'todos';
}

export interface AWBRecord {
  ID: string;
  Fornecedor: string;
  Saída: string;
  "NF's": string;
  AWB: string;
  Status: AWBStatus;
  Chegada: string;
  Marca: string;
  Material: string;
  Observação: string;
  Rastreio: string;
  Documentos: string;
  // Campos virtuais para o frontend
  id: string;
  fornecedor: string;
  saida: string;
  nfs: string;
  awbNumber: string;
  status: AWBStatus;
  chegada: string;
  marca: string;
  material: string;
  observacao: string;
  rastreio: string;
  documentos: string; // Campo que agrupa os PDFs
  // PDFs vindos da planilha
  PDF_1?: string;
  PDF_2?: string;
  PDF_3?: string;
  PDF_4?: string;
  PDF_5?: string;
  PDF_6?: string;
  PDF_7?: string;
  PDF_8?: string;
  PDF_9?: string;
  PDF_10?: string;
  PDF_11?: string;
}

export interface User {
  ID: string;
  USUÁRIO: string;
  "E-MAIL": string;
  SENHA: string;
  PAPEL: 'admin' | 'user';
  // Mapeamento frontend
  id: string;
  name: string;
  email: string;
  senha: string;
  role: 'admin' | 'user';
  status: 'ativo' | 'inativo';
}

export interface DashboardStats {
  total: number;
  emTransito: number;
  disponiveis: number;
  outros: number;
  trendTotal: number;
  atrasados: number;
  disponiveisLongos: number;
  coletasParciais: number;
}