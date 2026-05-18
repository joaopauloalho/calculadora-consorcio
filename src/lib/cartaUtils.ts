import type { CartaContemplada, Reserva, Solicitacao } from './supabaseTypes';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcValorCompra(credito: number, percentual: number): number {
  return Math.round(credito * percentual / 100 * 100) / 100;
}

export function labelTipo(tipo: CartaContemplada['tipo']): string {
  return tipo === 'imovel' ? 'Imóvel' : 'Veicular';
}

export function labelStatus(status: CartaContemplada['status']): string {
  const map: Record<CartaContemplada['status'], string> = {
    disponivel: 'Disponível',
    reservada: 'Reservada',
    vendida: 'Vendida',
  };
  return map[status];
}

export function labelStatusReserva(status: Reserva['status']): string {
  const map: Record<Reserva['status'], string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    recusada: 'Recusada',
  };
  return map[status];
}

export function labelStatusSolicitacao(status: Solicitacao['status']): string {
  const map: Record<Solicitacao['status'], string> = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    atendida: 'Atendida',
  };
  return map[status];
}
