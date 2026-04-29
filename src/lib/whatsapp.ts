import { fmt } from './calculations';
import type {
  AluguelData, AluguelResults,
  CartaAplicadaData, CartaAplicadaResults,
  FinanciamentoResults,
  QuickCalcData, QuickCalcResults,
  QuitacaoData, QuitacaoResults,
  SimData, SimResults,
  VendaCartaData, VendaCartaResults,
} from './calculations';

export function openWhatsApp(message: string): void {
  if (navigator.share) {
    navigator.share({ text: message }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }
}

const SEP = '━━━━━━━━━━━━━━';
const FOOTER = '_Simulação Consórcio_';

export function buildQuickCalcMsg(
  data: QuickCalcData,
  r: QuickCalcResults,
  lance?: { totalRecursos: number; percentLance: number },
  financiamento?: FinanciamentoResults,
): string {
  const tipo = data.assetType === 'imovel' ? 'Imóvel' : 'Veículo';
  const lines = [
    `*Simulação de Consórcio - ${tipo}*`,
    SEP,
    `Crédito: *${fmt(data.valorCredito)}* | Prazo: *${data.prazoTotal} meses*`,
    `Parcela: *${fmt(r.parcelaEfetivaPreContemp)}/mês*`,
    `Total a pagar: *${fmt(r.totalComTaxa)}*`,
    `Crédito na contemplação (mês ${data.mesContemplacao}): *${fmt(r.creditoAtualizado)}*`,
  ];

  if (lance) {
    lines.push(`Recursos p/ lance: *${fmt(lance.totalRecursos)}* (~*${lance.percentLance.toFixed(1)}%*)`);
  }

  if (financiamento) {
    lines.push(
      `Financiamento: *${fmt(financiamento.totalPago)} total* (${fmt(financiamento.totalJuros)} de juros)`,
      `Consórcio: *${fmt(r.totalComTaxa)} total*`,
      `Economia: *${fmt(financiamento.totalPago - r.totalComTaxa)}*`,
    );
  }

  lines.push(SEP, FOOTER);
  return lines.join('\n');
}

export interface LanceMsgData {
  valorCredito: number;
  prazoTotal: number;
  tipoLance: 'livre' | 'embutido';
  lanceTotalPercent: number;
  lanceTotal: number;
  creditoLiquido: number;
  saldoDevedor: number;
  parcela: number;
}

export function buildLanceMsg(params: LanceMsgData): string {
  const tipo = params.tipoLance === 'livre' ? 'Lance Livre' : 'Lance Embutido';
  return [
    `*Calculadora de Lance*`,
    SEP,
    `Crédito: *${fmt(params.valorCredito)}* | Prazo: *${params.prazoTotal} meses*`,
    `Tipo: *${tipo}* | Lance: *${params.lanceTotalPercent.toFixed(0)}%* (*${fmt(params.lanceTotal)}*)`,
    `Crédito líquido: *${fmt(params.creditoLiquido)}*`,
    `Saldo devedor pós-lance: *${fmt(params.saldoDevedor)}*`,
    `Parcela pós-contemplação: *${fmt(params.parcela)}/mês*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildLanceComparacaoMsg(dataA: LanceMsgData, dataB: LanceMsgData): string {
  return [
    `*Comparação de Lance*`,
    SEP,
    `           CENÁRIO A    CENÁRIO B`,
    `Lance:     *${dataA.lanceTotalPercent.toFixed(0)}%*        *${dataB.lanceTotalPercent.toFixed(0)}%*`,
    `Líquido:   *${fmt(dataA.creditoLiquido)}*     *${fmt(dataB.creditoLiquido)}*`,
    `Saldo:     *${fmt(dataA.saldoDevedor)}*     *${fmt(dataB.saldoDevedor)}*`,
    `Parcela:   *${fmt(dataA.parcela)}*    *${fmt(dataB.parcela)}*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildCompraConstrucaoMsg(data: SimData, r: SimResults): string {
  return [
    `*Compra e Construção*`,
    SEP,
    `Crédito: *${fmt(r.totalCredito)}* | Prazo: *${data.prazoTotal} meses*`,
    `Investido até contemplação: *${fmt(r.valorInvestidoAteContemplacao)}*`,
    `Lucro total estimado: *${fmt(r.lucroTotal)}*`,
    `Rentabilidade: *${r.rentabilidadeMensal.toFixed(2)}% a.m.*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildVendaCartaMsg(data: VendaCartaData, r: VendaCartaResults): string {
  return [
    `*Giro de Carta Contemplada*`,
    SEP,
    `Crédito: *${fmt(data.valorCredito)}* | Ágio: *${data.agioPercent}%*`,
    `Desembolso total: *${fmt(r.totalDesembolsado)}*`,
    `Lucro líquido: *${fmt(r.lucroLiquido)}*`,
    `Rentabilidade: *${r.rentabilidadeMensal.toFixed(2)}% a.m.*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildAluguelMsg(data: AluguelData, r: AluguelResults): string {
  return [
    `*Aluguel com Consórcio*`,
    SEP,
    `Crédito: *${fmt(data.valorCredito)}* | Prazo: *${data.prazoTotal} meses*`,
    `Parcela (meia): *${fmt(r.meiaParcela)}/mês*`,
    `Aluguel mensal: *${fmt(r.aluguelMensal)}*`,
    `Saldo livre: *${fmt(r.saldoLivreBasico)}/mês*`,
    `Patrimônio total (${data.numOperacoes} imóveis): *${fmt(r.patrimonioTotal)}*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildCartaAplicadaMsg(data: CartaAplicadaData, r: CartaAplicadaResults): string {
  const tipo = data.assetType === 'imovel' ? 'Imóvel' : 'Veículo';
  return [
    `*Carta Aplicada no CDI - ${tipo}*`,
    SEP,
    `Crédito: *${fmt(data.valorCredito)}* | Prazo: *${data.prazoTotal} meses*`,
    `Parcela efetiva: *${fmt(r.parcelaEfetivaPreContemp)}/mês*`,
    `Crédito na contemplação: *${fmt(r.creditoNaContemplacao)}*`,
    `Saldo líquido após ${data.mesAnalise} meses: *${fmt(r.saldoLiquido)}*`,
    `Rentabilidade: *${r.rentabilidadeMensal.toFixed(2)}% a.m.*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildQuitacaoMsg(_data: QuitacaoData, r: QuitacaoResults): string {
  return [
    `*Quitação de Financiamento*`,
    SEP,
    `Custo total no banco: *${fmt(r.custoTotalBanco)}*`,
    `Custo total no consórcio: *${fmt(r.custoTotalConsorcio)}*`,
    `Economia nominal: *${fmt(r.economiaNominal)}*`,
    `Tempo de dívida eliminado: *${r.tempoEliminado} meses*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildSimuladorLanceMsg(params: {
  valorCredito: number;
  mesesEmDia: number;
  elegiveis: Array<{
    nome: string;
    percentLance: number;
    valorLance: number;
    creditoEfetivo: number;
    elegivel: boolean;
  }>;
}): string {
  const elegiveis = params.elegiveis.filter((e) => e.elegivel);
  const melhor = elegiveis.length > 0 ? elegiveis[elegiveis.length - 1] : null;
  const linhas = [
    `*Simulador de Lance Ello*`,
    SEP,
    `Crédito: *${fmt(params.valorCredito)}* | Meses em dia: *${params.mesesEmDia}*`,
  ];

  if (melhor) {
    linhas.push(`Melhor lance disponível: *${melhor.nome}*`);
    linhas.push(`Lance: *${melhor.percentLance}%* (*${fmt(melhor.valorLance)}*)`);
    linhas.push(`Crédito efetivo: *${fmt(melhor.creditoEfetivo)}*`);
  } else {
    linhas.push('Nenhum lance disponível com os meses em dia informados.');
  }

  linhas.push(SEP, FOOTER);
  return linhas.join('\n');
}
