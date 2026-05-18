export interface CartaContemplada {
  id: string;
  created_at: string;
  created_by: string | null;
  tipo: 'imovel' | 'veicular';
  valor_credito: number;
  percentual_compra: number;
  valor_compra: number;
  prazo_restante: number;
  parcela_mensal: number | null;
  administradora: string;
  descricao: string | null;
  status: 'disponivel' | 'reservada' | 'vendida';
}

export interface Cliente {
  id: string;
  created_at: string;
  nome: string;
  telefone: string | null;
}

export interface Profile {
  id: string;
  role: 'master' | 'vendedor' | 'cliente';
  nome?: string;
  email?: string;
}

export interface Reserva {
  id: string;
  created_at: string;
  carta_id: string;
  cliente_id: string;
  mensagem: string | null;
  status: 'pendente' | 'aprovada' | 'recusada';
  cartas_contempladas?: CartaContemplada;
  clientes?: Cliente;
}

export interface Solicitacao {
  id: string;
  created_at: string;
  cliente_id: string;
  tipo: 'imovel' | 'veicular' | 'ambos';
  valor_credito_min: number | null;
  valor_credito_max: number | null;
  percentual_maximo: number | null;
  prazo_maximo: number | null;
  observacoes: string | null;
  status: 'pendente' | 'em_analise' | 'atendida';
  clientes?: Cliente;
}

export interface CartaFiltros {
  tipo?: 'imovel' | 'veicular';
  valorCreditoMin?: number;
  valorCreditoMax?: number;
  percentualMaximo?: number;
  prazoMaximo?: number;
}
