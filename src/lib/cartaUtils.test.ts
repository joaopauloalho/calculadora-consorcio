import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calcValorCompra,
  labelTipo,
  labelStatus,
  labelStatusReserva,
  labelStatusSolicitacao,
} from './cartaUtils';

describe('formatCurrency', () => {
  it('formats number as BRL', () => {
    const result = formatCurrency(280000);
    // Check for BRL format (may have non-breaking space due to locale)
    expect(result).toMatch(/R\$\s280\.000,00/);
  });
});

describe('calcValorCompra', () => {
  it('calculates percentual of credito', () => {
    expect(calcValorCompra(280000, 36)).toBe(100800);
  });
  it('rounds to 2 decimal places', () => {
    expect(calcValorCompra(100000, 33.33)).toBe(33330);
  });
});

describe('labelTipo', () => {
  it('returns Imóvel for imovel', () => {
    expect(labelTipo('imovel')).toBe('Imóvel');
  });
  it('returns Veicular for veicular', () => {
    expect(labelTipo('veicular')).toBe('Veicular');
  });
});

describe('labelStatus', () => {
  it('maps disponivel', () => expect(labelStatus('disponivel')).toBe('Disponível'));
  it('maps reservada', () => expect(labelStatus('reservada')).toBe('Reservada'));
  it('maps vendida', () => expect(labelStatus('vendida')).toBe('Vendida'));
});

describe('labelStatusReserva', () => {
  it('maps pendente', () => expect(labelStatusReserva('pendente')).toBe('Pendente'));
  it('maps aprovada', () => expect(labelStatusReserva('aprovada')).toBe('Aprovada'));
  it('maps recusada', () => expect(labelStatusReserva('recusada')).toBe('Recusada'));
});

describe('labelStatusSolicitacao', () => {
  it('maps pendente', () => expect(labelStatusSolicitacao('pendente')).toBe('Pendente'));
  it('maps em_analise', () => expect(labelStatusSolicitacao('em_analise')).toBe('Em Análise'));
  it('maps atendida', () => expect(labelStatusSolicitacao('atendida')).toBe('Atendida'));
});
