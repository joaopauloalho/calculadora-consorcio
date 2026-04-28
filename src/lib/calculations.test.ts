import { describe, it, expect } from 'vitest';
import {
  aplicarReajusteINCC,
  calculate,
  calculateVendaCarta,
  calculateAluguel,
  calculateQuitacao,
  calcularCascata,
  calculateCartaAplicada,
  calculateQuickCalc,
  fmt,
  INCC_MEDIO_HISTORICO,
} from './calculations';

// ─── Utilitários ─────────────────────────────────���────────────────────────────

const near = (a: number, b: number, tol = 0.01) => Math.abs(a - b) < tol;

describe('aplicarReajusteINCC', () => {
  it('retorna o valor original com 0 meses', () => {
    expect(aplicarReajusteINCC(100_000, 4.57, 0)).toBe(100_000);
  });

  it('reajusta corretamente após 12 meses', () => {
    const result = aplicarReajusteINCC(100_000, 4.57, 12);
    expect(near(result, 104_570)).toBe(true);
  });

  it('aplica reajuste composto em 24 meses', () => {
    const result = aplicarReajusteINCC(100_000, 4.57, 24);
    expect(near(result, 100_000 * 1.0457 * 1.0457, 1)).toBe(true);
  });

  it('não reajusta em meses parciais (só anos completos)', () => {
    expect(aplicarReajusteINCC(100_000, 4.57, 11)).toBe(100_000);
    expect(aplicarReajusteINCC(100_000, 4.57, 6)).toBe(100_000);
  });

  it('aplica teto de 5% a.a. mesmo com taxa maior', () => {
    const comTeto = aplicarReajusteINCC(100_000, 5, 12);
    const semTeto = aplicarReajusteINCC(100_000, 10, 12);
    expect(comTeto).toBe(semTeto);
    expect(near(comTeto, 105_000)).toBe(true);
  });

  it('inccAnualPercent = 0 → valor não se altera', () => {
    expect(aplicarReajusteINCC(100_000, 0, 24)).toBe(100_000);
    expect(aplicarReajusteINCC(100_000, 0, 12)).toBe(100_000);
  });
});

// ─── calculateVendaCarta ──────────────────────────────────────────────────────

describe('calculateVendaCarta', () => {
  const base = {
    valorCredito: 100_000,
    valorParcela: 300,   // ≈ 100000*(1+0.20)/200/2
    taxaAdm: 0.20,
    prazoTotal: 200,
    mesContemplacao: 20,
    agioPercent: 20,
    inccAnual: 0,        // INCC zero para simplificar
  };

  it('calcula totalDesembolsado corretamente', () => {
    const r = calculateVendaCarta(base);
    // 20 meses × R$300 = R$6.000
    expect(near(r.totalDesembolsado, 6_000)).toBe(true);
  });

  it('valorVendaChave é derivado do agioPercent × valorCreditoAtualizado', () => {
    const r = calculateVendaCarta(base);
    // INCC=0 → valorCreditoAtualizado = valorCredito
    expect(near(r.valorVendaChave, 100_000 * 0.20)).toBe(true);
  });

  it('agioPercent=0 → valorVendaChave=0 e lucroLiquido negativo', () => {
    const r = calculateVendaCarta({ ...base, agioPercent: 0 });
    expect(r.valorVendaChave).toBe(0);
    expect(r.lucroLiquido).toBeLessThan(0);
  });

  it('valorCreditoAtualizado cresce com INCC positivo', () => {
    const semIncc = calculateVendaCarta({ ...base, inccAnual: 0 });
    const comIncc = calculateVendaCarta({ ...base, inccAnual: 4.57 });
    expect(comIncc.valorCreditoAtualizado).toBeGreaterThan(semIncc.valorCreditoAtualizado);
  });

  it('saldoDevedorNaContemplacao nunca é negativo', () => {
    // mesContemplacao muito grande → saldo deve ser zero
    const r = calculateVendaCarta({ ...base, mesContemplacao: 300, prazoTotal: 200 });
    expect(r.saldoDevedorNaContemplacao).toBeGreaterThanOrEqual(0);
  });

  it('lucroLiquido = valorVendaChave - totalDesembolsado', () => {
    const r = calculateVendaCarta(base);
    expect(near(r.lucroLiquido, r.valorVendaChave - r.totalDesembolsado)).toBe(true);
  });

  it('custoTotalComprador = valorVendaChave + saldoDevedorNaContemplacao', () => {
    const r = calculateVendaCarta(base);
    expect(near(r.custoTotalComprador, r.valorVendaChave + r.saldoDevedorNaContemplacao)).toBe(true);
  });
});

// ─── calculateAluguel ─────────────────────────────────────────────────────────

describe('calculateAluguel', () => {
  const base = {
    valorCredito: 500_000,
    taxaAdm: 0.23,
    prazoTotal: 220,
    mesContemplacao: 30,
    valorImovelFinal: 500_000,
    rendimentoPercent: 0.005,
    numOperacoes: 3,
    inccAnual: INCC_MEDIO_HISTORICO,
  };

  it('parcelaCheia = 2 × meiaParcela', () => {
    const r = calculateAluguel(base);
    expect(near(r.parcelaCheia, 2 * r.meiaParcela)).toBe(true);
  });

  it('rendaLiquidaMensal = rendaBrutaMensal × 0.95 (vacância 5%)', () => {
    const r = calculateAluguel(base);
    expect(near(r.rendaLiquidaMensal, r.rendaBrutaMensal * 0.95)).toBe(true);
  });

  it('rendaLiquidaMensal < rendaBrutaMensal', () => {
    const r = calculateAluguel(base);
    expect(r.rendaLiquidaMensal).toBeLessThan(r.rendaBrutaMensal);
  });

  it('patrimonioTotal = numOperacoes × valorImovelFinal', () => {
    const r = calculateAluguel(base);
    expect(near(r.patrimonioTotal, base.numOperacoes * base.valorImovelFinal)).toBe(true);
  });

  it('saldoDevedorNaContemplacao nunca é negativo', () => {
    const r = calculateAluguel({ ...base, mesContemplacao: 300 });
    expect(r.saldoDevedorNaContemplacao).toBeGreaterThanOrEqual(0);
  });

  it('operacoesFinanciaveis = 0 quando saldoLivreBasico negativo', () => {
    // rendimento muito baixo → saldo negativo
    const r = calculateAluguel({ ...base, rendimentoPercent: 0.0001 });
    expect(r.operacoesFinanciaveis).toBe(0);
  });
});

// ─── calculateQuitacao ────────────────────────────────────────────────────────

describe('calculateQuitacao', () => {
  const base = {
    saldoDevedorBanco: 200_000,
    parcelaBanco: 2_000,
    prazoRestanteBanco: 180,
    valorCredito: 250_000,
    taxaAdm: 0.23,
    prazoConsorcio: 180,
    mesContemplacao: 24,
  };

  it('creditoCobre = true quando valorCredito >= saldoDevedorBanco', () => {
    const r = calculateQuitacao(base);
    expect(r.creditoCobre).toBe(true);
  });

  it('creditoCobre = false quando valorCredito < saldoDevedorBanco', () => {
    const r = calculateQuitacao({ ...base, valorCredito: 150_000 });
    expect(r.creditoCobre).toBe(false);
  });

  it('custoTotalBanco = parcelaBanco × prazoRestanteBanco', () => {
    const r = calculateQuitacao(base);
    expect(near(r.custoTotalBanco, base.parcelaBanco * base.prazoRestanteBanco)).toBe(true);
  });

  it('economiaNominal = custoTotalBanco - custoTotalConsorcio', () => {
    const r = calculateQuitacao(base);
    expect(near(r.economiaNominal, r.custoTotalBanco - r.custoTotalConsorcio)).toBe(true);
  });

  it('meiaParcela = parcelaCheiaConsorcio / 2', () => {
    const r = calculateQuitacao(base);
    expect(near(r.meiaParcela, r.parcelaCheiaConsorcio / 2)).toBe(true);
  });

  it('excedenteCreditoSaldo >= 0', () => {
    const r = calculateQuitacao(base);
    expect(r.excedenteCreditoSaldo).toBeGreaterThanOrEqual(0);
  });

  it('mesContemplacao = 0 → saldoDevedorConsorcioContemplacao = totalComTaxaConsorcio', () => {
    const r = calculateQuitacao({ ...base, mesContemplacao: 0 });
    expect(near(r.saldoDevedorConsorcioContemplacao, r.totalComTaxaConsorcio)).toBe(true);
  });

  it('saldoDevedorBanco = 0 → creditoCobre = true e jurosTotaisBanco = custoTotalBanco', () => {
    const r = calculateQuitacao({ ...base, saldoDevedorBanco: 0 });
    expect(r.creditoCobre).toBe(true);
    expect(near(r.jurosTotaisBanco, r.custoTotalBanco)).toBe(true);
  });
});

// ─── calcularCascata ──────────────────────────────────────────────────────────

describe('calcularCascata', () => {
  const base = {
    meiaParcela: 1_000,
    credito: 500_000,
    aluguelMensal: 2_500,
    parcelaCheia: 2_000,
  };

  it('retorna 1 ciclo quando numCiclos=1', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 1);
    expect(result).toHaveLength(1);
    expect(result[0].numero).toBe(1);
  });

  it('primeiro ciclo preserva os valores base', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 1);
    expect(result[0].meiaParcela).toBe(base.meiaParcela);
    expect(result[0].credito).toBe(base.credito);
    expect(result[0].aluguelMensal).toBe(base.aluguelMensal);
  });

  it('retorna N ciclos quando numCiclos=N', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 4);
    expect(result).toHaveLength(4);
  });

  it('meiaParcela nunca é negativa (BUG 3 guard)', () => {
    // Saldo muito negativo → meiaParcela deve ser clampada em 0
    const negBase = { meiaParcela: 100, credito: 50_000, aluguelMensal: 100, parcelaCheia: 5_000 };
    const result = calcularCascata(negBase, 220, 0.23, 1, 0.005, 3);
    result.forEach((c) => expect(c.meiaParcela).toBeGreaterThanOrEqual(0));
  });

  it('ciclo 2+ usa soma dos saldos anteriores para calcular meiaParcela', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 2);
    const saldo1 = result[0].saldo;
    const expectedMeia2 = Math.max(0, base.meiaParcela + saldo1);
    expect(near(result[1].meiaParcela, expectedMeia2)).toBe(true);
  });

  it('numCiclos = 0 → retorna o ciclo base (comportamento atual)', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 0);
    expect(result).toHaveLength(1);
    expect(result[0].numero).toBe(1);
  });

  it('numCiclos = 3 → retorna 3 ciclos com numeros sequenciais', () => {
    const result = calcularCascata(base, 220, 0.23, 1, 0.005, 3);
    expect(result).toHaveLength(3);
    expect(result.map((c) => c.numero)).toEqual([1, 2, 3]);
  });
});

// ─── calculateCartaAplicada ───────────────────────────────────────────────────

describe('calculateCartaAplicada', () => {
  const baseImovel = {
    assetType: 'imovel' as const,
    valorCredito: 300_000,
    prazoTotal: 220,
    mesContemplacao: 24,
    selicAnual: 10.5,
    paymentMode: 'meia' as const,
    comSeguro: false,
    mesAnalise: 12,
  };

  it('taxaAdm = 0.23 para imóvel', () => {
    const r = calculateCartaAplicada(baseImovel);
    expect(r.taxaAdm).toBe(0.23);
  });

  it('taxaAdm = 0.085 para veículo ≤ 48 meses', () => {
    const r = calculateCartaAplicada({ ...baseImovel, assetType: 'veiculo', prazoTotal: 48 });
    expect(r.taxaAdm).toBe(0.085);
  });

  it('taxaAdm = 0.16 para veículo > 48 meses', () => {
    const r = calculateCartaAplicada({ ...baseImovel, assetType: 'veiculo', prazoTotal: 100 });
    expect(r.taxaAdm).toBe(0.16);
  });

  it('saldoLiquido = creditoNoMesAnalise - totalPagoGeral', () => {
    const r = calculateCartaAplicada(baseImovel);
    expect(near(r.saldoLiquido, r.creditoNoMesAnalise - r.totalPagoGeral)).toBe(true);
  });

  it('crédito cresce com INCC/IPCA ao longo do tempo', () => {
    const r1 = calculateCartaAplicada({ ...baseImovel, mesAnalise: 12 });
    const r2 = calculateCartaAplicada({ ...baseImovel, mesAnalise: 60 });
    expect(r2.creditoNoMesAnalise).toBeGreaterThan(r1.creditoNoMesAnalise);
  });
});

// ─── calculateQuickCalc ───────────────────────────────────────────────────────

describe('calculateQuickCalc', () => {
  const base = {
    assetType: 'imovel' as const,
    valorCredito: 200_000,
    prazoTotal: 220,
    comSeguro: false,
    paymentMode: 'meia' as const,
    mesContemplacao: 20,
    percentAgio: 25,
  };

  it('valorVenda = creditoAtualizado × (percentAgio/100)', () => {
    const r = calculateQuickCalc(base);
    expect(near(r.valorVenda, r.creditoAtualizado * (base.percentAgio / 100))).toBe(true);
  });

  it('lucroLiquido = valorVenda - totalInvestido', () => {
    const r = calculateQuickCalc(base);
    expect(near(r.lucroLiquido, r.valorVenda - r.totalInvestido)).toBe(true);
  });

  it('saldoDevedorContemplacao >= 0', () => {
    const r = calculateQuickCalc({ ...base, mesContemplacao: 300 });
    expect(r.saldoDevedorContemplacao).toBeGreaterThanOrEqual(0);
  });

  it('correcaoIndice = INCC para imóvel, IPCA para veículo', () => {
    const ri = calculateQuickCalc(base);
    const rv = calculateQuickCalc({ ...base, assetType: 'veiculo', prazoTotal: 48 });
    expect(ri.correcaoIndice).toBe('INCC');
    expect(rv.correcaoIndice).toBe('IPCA');
  });

  it('valorCredito = 0 → resultados monetários são zero', () => {
    const r = calculateQuickCalc({ ...base, valorCredito: 0 });
    expect(r.totalComTaxa).toBe(0);
    expect(r.parcelaCheiaOriginal).toBe(0);
    expect(r.totalInvestido).toBe(0);
    expect(r.valorVenda).toBe(0);
    expect(r.lucroLiquido).toBe(0);
  });
});

// ─── calculate (CompraeConstrucao) ───────────────────────────────────────────

describe('calculate', () => {
  const base = {
    valorTerreno: 200_000,
    valorConstrucao: 800_000,
    prazoTotal: 220,
    taxaAdm: 0.23,
    mesContemplacao: 30,
    seguroMensalPercent: 0.000555,
    mesesObra: 12,
    valorVendaMercado: 1_700_000,
    entradaVenda: 800_000,
    inccAnual: INCC_MEDIO_HISTORICO,
  };

  it('totalCredito = valorTerreno + valorConstrucao', () => {
    const r = calculate(base);
    expect(near(r.totalCredito, base.valorTerreno + base.valorConstrucao)).toBe(true);
  });

  it('meiaParcela = parcelaCheiaOriginal / 2', () => {
    const r = calculate(base);
    expect(near(r.meiaParcela, r.parcelaCheiaOriginal / 2)).toBe(true);
  });

  it('totalMesesInvestindo = mesContemplacao + mesesObra', () => {
    const r = calculate(base);
    expect(r.totalMesesInvestindo).toBe(base.mesContemplacao + base.mesesObra);
  });

  it('totalDesembolsado = valorInvestidoAteContemplacao + totalPagoNaObra', () => {
    const r = calculate(base);
    expect(near(r.totalDesembolsado, r.valorInvestidoAteContemplacao + r.totalPagoNaObra)).toBe(true);
  });

  it('lucroTotal = entradaVenda - totalDesembolsado', () => {
    const r = calculate(base);
    expect(near(r.lucroTotal, base.entradaVenda - r.totalDesembolsado)).toBe(true);
  });

  it('mesContemplacao = 0 → valorInvestidoAteContemplacao = 0', () => {
    const r = calculate({ ...base, mesContemplacao: 0 });
    expect(r.valorInvestidoAteContemplacao).toBe(0);
    expect(r.totalMesesInvestindo).toBe(base.mesesObra);
  });

  it('valorTerreno = 0 → totalCredito = valorConstrucao', () => {
    const r = calculate({ ...base, valorTerreno: 0 });
    expect(near(r.totalCredito, base.valorConstrucao)).toBe(true);
  });

  it('entradaVenda = totalDesembolsado → lucroTotal ≈ 0', () => {
    const rBase = calculate(base);
    const r = calculate({ ...base, entradaVenda: rBase.totalDesembolsado });
    expect(near(r.lucroTotal, 0, 1)).toBe(true);
  });

  it('prazoTotal = 1 → não divide por zero', () => {
    const r = calculate({ ...base, prazoTotal: 1, mesContemplacao: 0, mesesObra: 0 });
    expect(isFinite(r.parcelaCheiaOriginal)).toBe(true);
    expect(isFinite(r.meiaParcela)).toBe(true);
    expect(r.mesesRestantesAposContemplacao).toBeGreaterThanOrEqual(1);
  });
});

// ─── fmt ─────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('formata zero como R$ 0,00', () => {
    expect(fmt(0)).toMatch(/R\$\s*0[,.]?00/);
  });

  it('formata número positivo com separador de milhares', () => {
    const s = fmt(1_000_000);
    expect(s).toContain('1');
    expect(s).toContain('000');
  });

  it('formata número negativo', () => {
    const s = fmt(-500);
    expect(s).toContain('-');
  });
});
