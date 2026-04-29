import { fmt } from './calculations';
import type {
  QuickCalcData, QuickCalcResults,
  SimData, SimResults,
  VendaCartaData, VendaCartaResults,
  AluguelData, AluguelResults,
  CartaAplicadaData, CartaAplicadaResults,
  QuitacaoData, QuitacaoResults,
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

export function buildQuickCalcMsg(data: QuickCalcData, r: QuickCalcResults): string {
  const tipo = data.assetType === 'imovel' ? 'Imóvel' : 'Veículo';
  return [
    `*📊 Simulação de Consórcio — ${tipo}*`,
    SEP,
    `Crédito: *${fmt(data.valorCredito)}* | Prazo: *${data.prazoTotal} meses*`,
    `Parcela: *${fmt(r.parcelaEfetivaPreContemp)}/mês*`,
    `Total a pagar: *${fmt(r.totalComTaxa)}*`,
    `Crédito na contemplação (mês ${data.mesContemplacao}): *${fmt(r.creditoAtualizado)}*`,
    SEP,
    FOOTER,
  ].join('\n');
}

export function buildLanceMsg(params: {
  valorCredito: number;
  prazoTotal: number;
  tipoLance: 'livre' | 'embutido';
  lanceTotalPercent: number;
  lanceTotal: number;
  creditoLiquido: number;
  saldoDevedor: number;
  parcela: number;
}): string {
  const tipo = params.tipoLance === 'livre' ? 'Lance Livre' : 'Lance Embutido';
  return [
    `*🎯 Calculadora de Lance*`,
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

export function buildCompraConstrucaoMsg(data: SimData, r: SimResults): string {
  return [
    `*🏗️ Compra e Construção*`,
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
    `*🔄 Giro de Carta Contemplada*`,
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
    `*🏠 Aluguel com Consórcio*`,
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
    `*💰 Carta Aplicada no CDI — ${tipo}*`,
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
    `*🏦 Quitação de Financiamento*`,
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
    `*🏆 Simulador de Lance Ello*`,
    SEP,
    `Crédito: *${fmt(params.valorCredito)}* | Meses em dia: *${params.mesesEmDia}*`,
  ];
  if (melhor) {
    linhas.push(`Melhor lance disponível: *${melhor.nome}*`);
    linhas.push(`Lance: *${melhor.percentLance}%* (*${fmt(melhor.valorLance)}*)`);
    linhas.push(`Crédito efetivo: *${fmt(melhor.creditoEfetivo)}*`);
  } else {
    linhas.push(`Nenhum lance disponível com os meses em dia informados.`);
  }
  linhas.push(SEP, FOOTER);
  return linhas.join('\n');
}
