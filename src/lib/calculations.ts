export interface SimData {
  valorTerreno: number;
  valorConstrucao: number;
  prazoTotal: number;
  taxaAdm: number;
  mesContemplacao: number;
  seguroMensalPercent: number;
  mesesObra: number;
  valorVendaMercado: number;
  entradaVenda: number;
}

export interface SimResults {
  totalCredito: number;
  totalComTaxa: number;
  parcelaCheiaOriginal: number;
  meiaParcela: number;
  valorInvestidoAteContemplacao: number;
  saldoDevedorNaContemplacao: number;
  parcelaComSeguro: number;
  totalPagoNaObra: number;
  saldoDevedorPosObra: number;
  totalDesembolsado: number;
  totalMesesInvestindo: number;
  mediaParcelaInvestida: number;
  parcelasRestantes: number;
  valorFinanciadoBanco: number;
  parcelaEstimadaBanco: number;
  totalEstimadoPagoBanco: number;
  custoTotalAquisicaoConsorcio: number;
  lucroTotal: number;
  lucroMensalMedio: number;
}

export function calculate(data: SimData): SimResults {
  const totalCredito = data.valorTerreno + data.valorConstrucao;
  const totalComTaxa = totalCredito * (1 + data.taxaAdm);
  const parcelaCheiaOriginal = totalComTaxa / data.prazoTotal;
  const meiaParcela = parcelaCheiaOriginal / 2;

  const valorInvestidoAteContemplacao = data.mesContemplacao * meiaParcela;
  const saldoDevedorNaContemplacao = totalComTaxa - valorInvestidoAteContemplacao;
  const parcelaComSeguro = parcelaCheiaOriginal + saldoDevedorNaContemplacao * data.seguroMensalPercent;

  const totalPagoNaObra = data.mesesObra * parcelaComSeguro;
  const saldoDevedorPosObra = Math.max(0, saldoDevedorNaContemplacao - data.mesesObra * parcelaCheiaOriginal);

  const totalDesembolsado = valorInvestidoAteContemplacao + totalPagoNaObra;
  const totalMesesInvestindo = data.mesContemplacao + data.mesesObra;
  const mediaParcelaInvestida = totalDesembolsado / totalMesesInvestindo;

  const parcelasRestantes = Math.max(0, data.prazoTotal - data.mesContemplacao - data.mesesObra);
  const valorFinanciadoBanco = Math.max(0, data.valorVendaMercado - data.entradaVenda);

  const amortizacaoMensal = valorFinanciadoBanco / 360;
  const jurosMensaisIniciais = valorFinanciadoBanco * 0.0087;
  const parcelaEstimadaBanco = valorFinanciadoBanco > 0 ? amortizacaoMensal + jurosMensaisIniciais + 450 : 0;
  const totalEstimadoPagoBanco = valorFinanciadoBanco * 2.85;

  const custoTotalAquisicaoConsorcio = data.entradaVenda + saldoDevedorPosObra;
  const lucroTotal = data.entradaVenda - totalDesembolsado;
  const lucroMensalMedio = lucroTotal / totalMesesInvestindo;

  return {
    totalCredito, totalComTaxa, parcelaCheiaOriginal, meiaParcela,
    valorInvestidoAteContemplacao, saldoDevedorNaContemplacao, parcelaComSeguro,
    totalPagoNaObra, saldoDevedorPosObra, totalDesembolsado, totalMesesInvestindo,
    mediaParcelaInvestida, parcelasRestantes, valorFinanciadoBanco,
    parcelaEstimadaBanco, totalEstimadoPagoBanco, custoTotalAquisicaoConsorcio,
    lucroTotal, lucroMensalMedio,
  };
}

export interface VendaCartaData {
  valorCredito: number;
  valorParcela: number;
  taxaAdm: number;
  prazoTotal: number;
  mesContemplacao: number;
  valorVendaChave: number;
}

export interface VendaCartaResults {
  totalComTaxa: number;
  totalDesembolsado: number;
  saldoDevedorNaContemplacao: number;
  lucroLiquido: number;
  roiAlavancado: number;
  lucroMensalMedio: number;
  custoTotalComprador: number;
  parcelaEstimadaBanco: number;
  totalEstimadoPagoBanco: number;
  economiaTotalComprador: number;
}

export function calculateVendaCarta(data: VendaCartaData): VendaCartaResults {
  const totalComTaxa = data.valorCredito * (1 + data.taxaAdm);
  const totalDesembolsado = data.mesContemplacao * data.valorParcela;
  const saldoDevedorNaContemplacao = Math.max(0, totalComTaxa - totalDesembolsado);

  const lucroLiquido = data.valorVendaChave - totalDesembolsado;
  const roiAlavancado = totalDesembolsado > 0 ? (lucroLiquido / totalDesembolsado) * 100 : 0;
  const lucroMensalMedio = data.mesContemplacao > 0 ? lucroLiquido / data.mesContemplacao : 0;

  const custoTotalComprador = data.valorVendaChave + saldoDevedorNaContemplacao;
  const amortizacao = data.valorCredito / 360;
  const juros = data.valorCredito * 0.0087;
  const parcelaEstimadaBanco = amortizacao + juros + 450;
  const totalEstimadoPagoBanco = data.valorCredito * 2.85;
  const economiaTotalComprador = totalEstimadoPagoBanco - custoTotalComprador;

  return {
    totalComTaxa, totalDesembolsado, saldoDevedorNaContemplacao,
    lucroLiquido, roiAlavancado, lucroMensalMedio,
    custoTotalComprador, parcelaEstimadaBanco, totalEstimadoPagoBanco,
    economiaTotalComprador,
  };
}

export function contemplationProbability(
  month: number,
  prazoTotal: number,
  saudeGrupo: number,
  pontualidade: number
): number {
  const activeMembers = prazoTotal * saudeGrupo;
  const myEligibility = pontualidade >= 0.8 ? 1 : pontualidade * 0.6;
  const monthlyRate = myEligibility / activeMembers;
  return Math.min(0.99, 1 - Math.pow(1 - monthlyRate, month));
}

export const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
