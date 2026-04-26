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
  mesesRestantesAposContemplacao: number;
  parcelaPosContemplacao: number;
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
  const mesesRestantesAposContemplacao = Math.max(1, data.prazoTotal - data.mesContemplacao);
  const parcelaPosContemplacao = saldoDevedorNaContemplacao / mesesRestantesAposContemplacao;
  const parcelaComSeguro = parcelaPosContemplacao + saldoDevedorNaContemplacao * data.seguroMensalPercent;

  const totalPagoNaObra = data.mesesObra * parcelaComSeguro;
  const saldoDevedorPosObra = Math.max(0, saldoDevedorNaContemplacao - data.mesesObra * parcelaPosContemplacao);

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
    mesesRestantesAposContemplacao, parcelaPosContemplacao,
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
  rentabilidadeMensal: number;
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

  // Capital médio empregado = totalDesembolsado/2 (aportes graduais: começa em 0, termina no total)
  const capitalMedioEmpregado = totalDesembolsado / 2;
  const rentabilidadeMensal = capitalMedioEmpregado > 0 && data.mesContemplacao > 0
    ? (lucroLiquido / capitalMedioEmpregado / data.mesContemplacao) * 100
    : 0;

  return {
    totalComTaxa, totalDesembolsado, saldoDevedorNaContemplacao,
    lucroLiquido, roiAlavancado, lucroMensalMedio,
    custoTotalComprador, parcelaEstimadaBanco, totalEstimadoPagoBanco,
    economiaTotalComprador, rentabilidadeMensal,
  };
}

export interface AluguelData {
  valorCredito: number;
  taxaAdm: number;
  prazoTotal: number;
  mesContemplacao: number;
  valorImovelFinal: number;
  rendimentoPercent: number;
  numOperacoes: number;
}

export interface AluguelResults {
  totalComTaxa: number;
  parcelaCheia: number;
  meiaParcela: number;
  totalDesembolsado: number;
  saldoDevedorNaContemplacao: number;
  aluguelMensal: number;
  saldoLivreBasico: number;
  saldoComReplicacao: number;
  operacoesFinanciaveis: number;
  patrimonioTotal: number;
  rendaBrutaMensal: number;
  rendaLiquidaMensal: number;
  totalInvestidoTodas: number;
}

export function calculateAluguel(data: AluguelData): AluguelResults {
  const totalComTaxa = data.valorCredito * (1 + data.taxaAdm);
  const parcelaCheia = totalComTaxa / data.prazoTotal;
  const meiaParcela = parcelaCheia / 2;
  const totalDesembolsado = data.mesContemplacao * meiaParcela;
  const saldoDevedorNaContemplacao = Math.max(0, totalComTaxa - totalDesembolsado);

  const aluguelMensal = data.valorImovelFinal * data.rendimentoPercent;
  // Incremento real pós-contemplação: meia parcela já era paga antes, só o acréscimo (meia→cheia) é novo custo
  const saldoLivreBasico = aluguelMensal - meiaParcela;
  const saldoComReplicacao = aluguelMensal - parcelaCheia - meiaParcela;
  const operacoesFinanciaveis = meiaParcela > 0
    ? Math.floor(Math.max(0, saldoLivreBasico) / meiaParcela)
    : 0;

  const patrimonioTotal = data.numOperacoes * data.valorImovelFinal;
  const rendaBrutaMensal = data.numOperacoes * aluguelMensal;
  const rendaLiquidaMensal = rendaBrutaMensal;
  const totalInvestidoTodas = data.numOperacoes * totalDesembolsado;

  return {
    totalComTaxa, parcelaCheia, meiaParcela,
    totalDesembolsado, saldoDevedorNaContemplacao,
    aluguelMensal, saldoLivreBasico, saldoComReplicacao,
    operacoesFinanciaveis, patrimonioTotal,
    rendaBrutaMensal, rendaLiquidaMensal, totalInvestidoTodas,
  };
}

export interface QuitacaoData {
  saldoDevedorBanco: number;
  parcelaBanco: number;
  prazoRestanteBanco: number;
  valorCredito: number;
  taxaAdm: number;
  prazoConsorcio: number;
  mesContemplacao: number;
  cetBanco?: number;   // CET banco % a.a. (opcional)
}

export interface QuitacaoResults {
  custoTotalBanco: number;
  jurosTotaisBanco: number;
  totalComTaxaConsorcio: number;
  parcelaCheiaConsorcio: number;
  meiaParcela: number;
  saldoDevedorConsorcioContemplacao: number;
  custoSobreposicaoMensal: number;
  totalOverlapBanco: number;
  totalOverlapConsorcio: number;
  parcelasRestantesConsorcio: number;
  custoAposContemplacao: number;
  custoTotalConsorcio: number;
  economiaNominal: number;
  mesesDividaBanco: number;
  mesesDividaConsorcio: number;
  tempoEliminado: number;
  creditoCobre: boolean;
}

export function calculateQuitacao(data: QuitacaoData): QuitacaoResults {
  const custoTotalBanco = data.parcelaBanco * data.prazoRestanteBanco;
  const jurosTotaisBanco = Math.max(0, custoTotalBanco - data.saldoDevedorBanco);

  const totalComTaxaConsorcio = data.valorCredito * (1 + data.taxaAdm);
  const parcelaCheiaConsorcio = totalComTaxaConsorcio / data.prazoConsorcio;
  const meiaParcela = parcelaCheiaConsorcio / 2;

  const saldoDevedorConsorcioContemplacao = Math.max(0, totalComTaxaConsorcio - data.mesContemplacao * meiaParcela);

  const custoSobreposicaoMensal = data.parcelaBanco + meiaParcela;
  const totalOverlapBanco = data.mesContemplacao * data.parcelaBanco;
  const totalOverlapConsorcio = data.mesContemplacao * meiaParcela;

  const parcelasRestantesConsorcio = Math.max(0, data.prazoConsorcio - data.mesContemplacao);
  const custoAposContemplacao = parcelasRestantesConsorcio * parcelaCheiaConsorcio;

  const custoTotalConsorcio = totalOverlapBanco + totalOverlapConsorcio + custoAposContemplacao;
  const economiaNominal = custoTotalBanco - custoTotalConsorcio;

  const mesesDividaBanco = data.prazoRestanteBanco;
  const mesesDividaConsorcio = data.prazoConsorcio;
  const tempoEliminado = mesesDividaBanco - mesesDividaConsorcio;
  const creditoCobre = data.valorCredito >= data.saldoDevedorBanco;

  return {
    custoTotalBanco, jurosTotaisBanco,
    totalComTaxaConsorcio, parcelaCheiaConsorcio, meiaParcela,
    saldoDevedorConsorcioContemplacao,
    custoSobreposicaoMensal, totalOverlapBanco, totalOverlapConsorcio,
    parcelasRestantesConsorcio, custoAposContemplacao,
    custoTotalConsorcio, economiaNominal,
    mesesDividaBanco, mesesDividaConsorcio, tempoEliminado,
    creditoCobre,
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

export interface CartaAplicadaData {
  assetType: AssetType;
  valorCredito: number;
  prazoTotal: number;
  mesContemplacao: number;
  selicAnual: number;
  paymentMode: PaymentMode;
  comSeguro: boolean;
  mesAnalise: number;
}

export interface CartaAplicadaResults {
  taxaAdm: number;
  seguroPercent: number;
  totalComTaxa: number;
  parcelaCheia: number;
  meiaParcela: number;
  saldoDevedorContemplacao: number;
  seguroMensalMedioPreContemp: number;
  parcelaEfetivaPreContemp: number;
  totalPagoPreContemp: number;
  correcaoAnual: number;
  correcaoIndice: string;
  creditoNaContemplacao: number;
  cdiAnual: number;
  cdiMensal: number;
  creditoNoMesAnalise: number;
  parcelaPosContemp: number;
  totalPagoPosContemp: number;
  totalPagoGeral: number;
  saldoLiquido: number;
  rentabilidadeMensal: number;
}

export function calculateCartaAplicada(data: CartaAplicadaData): CartaAplicadaResults {
  const taxaAdm = data.assetType === 'imovel' ? 0.23 : data.prazoTotal <= 48 ? 0.085 : 0.16;
  const seguroPercent = data.assetType === 'imovel' ? 0.000555 : 0.000888;

  const totalComTaxa = data.valorCredito * (1 + taxaAdm);
  const parcelaCheia = totalComTaxa / data.prazoTotal;
  const meiaParcela = parcelaCheia / 2;
  const parcelaPreContemp = data.paymentMode === 'meia' ? meiaParcela : parcelaCheia;

  const saldoDevedorContemplacao = Math.max(0, totalComTaxa - data.mesContemplacao * parcelaPreContemp);

  const avgSaldoPreContemp = (totalComTaxa + saldoDevedorContemplacao) / 2;
  const seguroMensalMedioPreContemp = avgSaldoPreContemp * seguroPercent;
  const seguroTotalPreContemp = data.comSeguro ? seguroMensalMedioPreContemp * data.mesContemplacao : 0;
  const totalPagoPreContemp = data.mesContemplacao * parcelaPreContemp + seguroTotalPreContemp;
  const parcelaEfetivaPreContemp = parcelaPreContemp + (data.comSeguro ? seguroMensalMedioPreContemp : 0);

  const correcaoAnual = data.assetType === 'imovel' ? 0.05 : 0.04;
  const correcaoIndice = data.assetType === 'imovel' ? 'INCC' : 'IPCA';
  const creditoNaContemplacao = data.valorCredito * Math.pow(1 + correcaoAnual, data.mesContemplacao / 12);

  const cdiAnual = (data.selicAnual - 0.10) / 100;
  const cdiMensal = Math.pow(1 + cdiAnual, 1 / 12) - 1;
  const creditoNoMesAnalise = creditoNaContemplacao * Math.pow(1 + cdiMensal, data.mesAnalise);

  const parcelaPosContemp = parcelaCheia + saldoDevedorContemplacao * seguroPercent;
  const totalPagoPosContemp = data.mesAnalise * parcelaPosContemp;
  const totalPagoGeral = totalPagoPreContemp + totalPagoPosContemp;

  const saldoLiquido = creditoNoMesAnalise - totalPagoGeral;
  const totalMeses = data.mesContemplacao + data.mesAnalise;
  const capitalMedioEmpregado = totalPagoGeral / 2;
  const rentabilidadeMensal =
    capitalMedioEmpregado > 0 && totalMeses > 0
      ? (saldoLiquido / capitalMedioEmpregado / totalMeses) * 100
      : 0;

  return {
    taxaAdm, seguroPercent, totalComTaxa, parcelaCheia, meiaParcela,
    saldoDevedorContemplacao, seguroMensalMedioPreContemp, parcelaEfetivaPreContemp,
    totalPagoPreContemp, correcaoAnual, correcaoIndice, creditoNaContemplacao,
    cdiAnual, cdiMensal, creditoNoMesAnalise,
    parcelaPosContemp, totalPagoPosContemp, totalPagoGeral,
    saldoLiquido, rentabilidadeMensal,
  };
}

export type AssetType = 'imovel' | 'veiculo';
export type PaymentMode = 'meia' | 'cheia';

export interface QuickCalcData {
  assetType: AssetType;
  valorCredito: number;
  prazoTotal: number;
  comSeguro: boolean;
  paymentMode: PaymentMode;
  mesContemplacao: number;
  venderComLucro: boolean;
  percentAgio: number;
}

export interface QuickCalcResults {
  taxaAdm: number;
  seguroPercent: number;
  seguroMensalMedio: number;
  totalComTaxa: number;
  parcelaCheiaOriginal: number;
  meiaParcela: number;
  saldoDevedorContemplacao: number;
  parcelaEfetivaPreContemp: number;
  totalInvestido: number;
  parcelaNova: number;
  creditoAtualizado: number;
  correcaoAnual: number;
  correcaoIndice: string;
  valorVenda: number;
  lucroLiquido: number;
  capitalMedioEmpregado: number;
  rentabilidadeMensal: number;
}

export function calculateQuickCalc(data: QuickCalcData): QuickCalcResults {
  const taxaAdm =
    data.assetType === 'imovel' ? 0.23 : data.prazoTotal <= 48 ? 0.085 : 0.16;

  const seguroPercent = data.assetType === 'imovel' ? 0.000555 : 0.000888;

  const totalComTaxa = data.valorCredito * (1 + taxaAdm);
  const parcelaCheiaOriginal = totalComTaxa / data.prazoTotal;
  const meiaParcela = parcelaCheiaOriginal / 2;
  const parcelaAtual = data.paymentMode === 'meia' ? meiaParcela : parcelaCheiaOriginal;

  const saldoDevedorContemplacao = Math.max(
    0,
    totalComTaxa - data.mesContemplacao * parcelaAtual,
  );

  const parcelasPagas = data.mesContemplacao * parcelaAtual;
  const avgSaldo = (totalComTaxa + saldoDevedorContemplacao) / 2;
  const seguroMensalMedio = avgSaldo * seguroPercent;
  const seguroPreContemp = data.comSeguro
    ? seguroMensalMedio * data.mesContemplacao
    : 0;
  const totalInvestido = parcelasPagas + seguroPreContemp;

  // Parcela efetiva pré-contemplação (base + seguro médio se habilitado)
  const parcelaEfetivaPreContemp = parcelaAtual + (data.comSeguro ? seguroMensalMedio : 0);

  // Pós-contemplação: sempre parcela cheia + seguro sempre obrigatório
  const parcelaNova = parcelaCheiaOriginal + saldoDevedorContemplacao * seguroPercent;

  // Crédito atualizado na contemplação (INCC 5% a.a. imóvel / IPCA 4% a.a. veículo)
  const correcaoAnual = data.assetType === 'imovel' ? 0.05 : 0.04;
  const correcaoIndice = data.assetType === 'imovel' ? 'INCC' : 'IPCA';
  const creditoAtualizado = data.valorCredito * Math.pow(1 + correcaoAnual, data.mesContemplacao / 12);

  // Ágio = % sobre o valor do crédito (o que o vendedor recebe)
  const valorVenda = data.valorCredito * (data.percentAgio / 100);
  const lucroLiquido = valorVenda - totalInvestido;
  const capitalMedioEmpregado = totalInvestido / 2;
  const rentabilidadeMensal =
    capitalMedioEmpregado > 0 && data.mesContemplacao > 0
      ? (lucroLiquido / capitalMedioEmpregado / data.mesContemplacao) * 100
      : 0;

  return {
    taxaAdm, seguroPercent, seguroMensalMedio, totalComTaxa, parcelaCheiaOriginal,
    meiaParcela, saldoDevedorContemplacao, parcelaEfetivaPreContemp,
    totalInvestido, parcelaNova,
    creditoAtualizado, correcaoAnual, correcaoIndice,
    valorVenda, lucroLiquido, capitalMedioEmpregado, rentabilidadeMensal,
  };
}
