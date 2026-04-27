/** INCC médio histórico (2020-2024) aplicando teto de 5% a.a. = ~4.57% a.a. */
export const INCC_MEDIO_HISTORICO = 4.57;

/** Taxa de vacância aplicada sobre renda bruta de aluguel (IR não incluído) */
const VACANCIA = 0.05;

/** Parâmetros de referência do financiamento bancário (Caixa SAC médio 2024) */
const PRAZO_BANCO_MESES = 360;
const TAXA_JUROS_BANCO_MENSAL = 0.0087;   // 0,87% a.m.
const SEGURO_COND_MENSAL = 450;           // seguro + condomínio estimado (R$)
const CUSTO_TOTAL_BANCO_MULT = 2.85;      // custo total ≈ 2,85× o crédito

/**
 * Aplica reajuste INCC discreto (a cada 12 meses) com teto de 5% a.a.
 * @param valor - valor base
 * @param inccAnualPercent - taxa INCC em % (ex: 4.57 = 4.57%)
 * @param meses - número de meses decorridos
 */
export function aplicarReajusteINCC(valor: number, inccAnualPercent: number, meses: number): number {
  const inccEfetivo = Math.min(inccAnualPercent, 5);
  const anosCompletos = Math.floor(meses / 12);
  return valor * Math.pow(1 + inccEfetivo / 100, anosCompletos);
}

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
  inccAnual: number;  // INCC % a.a. para reajuste da carta
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
  creditoReajustadoNaContemplacao: number;
  rentabilidadeMensal: number;   // % a.m. do lucro sobre capital médio ponderado
  capitalMedioEmpregado: number; // capital médio ao longo da operação
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

  const amortizacaoMensal = valorFinanciadoBanco / PRAZO_BANCO_MESES;
  const jurosMensaisIniciais = valorFinanciadoBanco * TAXA_JUROS_BANCO_MENSAL;
  const parcelaEstimadaBanco = valorFinanciadoBanco > 0 ? amortizacaoMensal + jurosMensaisIniciais + SEGURO_COND_MENSAL : 0;
  const totalEstimadoPagoBanco = valorFinanciadoBanco * CUSTO_TOTAL_BANCO_MULT;

  const custoTotalAquisicaoConsorcio = data.entradaVenda + saldoDevedorPosObra;
  const lucroTotal = data.entradaVenda - totalDesembolsado;
  const lucroMensalMedio = lucroTotal / totalMesesInvestindo;
  const creditoReajustadoNaContemplacao = aplicarReajusteINCC(totalCredito, data.inccAnual, data.mesContemplacao);

  // Capital médio ponderado: pré-contemplação + obra
  // Na pré-contemplação: aportes crescendo de 0 → valorInvestidoAteContemplacao
  // Na obra: aportes crescendo de valorInvestidoAteContemplacao → totalDesembolsado
  const capitalMedioPreContemp = valorInvestidoAteContemplacao / 2;
  const capitalMedioObra = valorInvestidoAteContemplacao + (data.mesesObra > 0 ? totalPagoNaObra / 2 : 0);
  const capitalMedioEmpregado = totalMesesInvestindo > 0
    ? (capitalMedioPreContemp * data.mesContemplacao + capitalMedioObra * data.mesesObra) / totalMesesInvestindo
    : 0;
  const rentabilidadeMensal = capitalMedioEmpregado > 0 && totalMesesInvestindo > 0
    ? (lucroTotal / capitalMedioEmpregado / totalMesesInvestindo) * 100
    : 0;

  return {
    totalCredito, totalComTaxa, parcelaCheiaOriginal, meiaParcela,
    valorInvestidoAteContemplacao, saldoDevedorNaContemplacao, parcelaComSeguro,
    mesesRestantesAposContemplacao, parcelaPosContemplacao,
    totalPagoNaObra, saldoDevedorPosObra, totalDesembolsado, totalMesesInvestindo,
    mediaParcelaInvestida, parcelasRestantes, valorFinanciadoBanco,
    parcelaEstimadaBanco, totalEstimadoPagoBanco, custoTotalAquisicaoConsorcio,
    lucroTotal, lucroMensalMedio, creditoReajustadoNaContemplacao,
    rentabilidadeMensal, capitalMedioEmpregado,
  };
}

export interface VendaCartaData {
  valorCredito: number;
  valorParcela: number;
  taxaAdm: number;
  prazoTotal: number;
  mesContemplacao: number;
  agioPercent: number;  // % do crédito atualizado; valorVendaChave é derivado
  inccAnual: number;   // INCC % a.a. (ex: 3.5 significa 3.5% a.a.)
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
  valorCreditoAtualizado: number;   // valor da carta corrigido pelo INCC até o mês de contemplação
  valorVendaChave: number;          // agioPercent % de valorCreditoAtualizado
}

export function calculateVendaCarta(data: VendaCartaData): VendaCartaResults {
  const totalComTaxa = data.valorCredito * (1 + data.taxaAdm);
  const inccMensal = Math.pow(1 + data.inccAnual / 100, 1 / 12) - 1;
  const valorCreditoAtualizado = data.valorCredito * Math.pow(1 + inccMensal, data.mesContemplacao);
  const totalDesembolsado = data.mesContemplacao * data.valorParcela;
  const saldoDevedorNaContemplacao = Math.max(0, totalComTaxa - totalDesembolsado);

  const valorVendaChave = valorCreditoAtualizado * data.agioPercent / 100;
  const lucroLiquido = valorVendaChave - totalDesembolsado;
  const roiAlavancado = totalDesembolsado > 0 ? (lucroLiquido / totalDesembolsado) * 100 : 0;
  const lucroMensalMedio = data.mesContemplacao > 0 ? lucroLiquido / data.mesContemplacao : 0;

  const custoTotalComprador = valorVendaChave + saldoDevedorNaContemplacao;
  const amortizacao = data.valorCredito / PRAZO_BANCO_MESES;
  const juros = data.valorCredito * TAXA_JUROS_BANCO_MENSAL;
  const parcelaEstimadaBanco = amortizacao + juros + SEGURO_COND_MENSAL;
  const totalEstimadoPagoBanco = data.valorCredito * CUSTO_TOTAL_BANCO_MULT;
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
    economiaTotalComprador, rentabilidadeMensal, valorCreditoAtualizado, valorVendaChave,
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
  inccAnual?: number;  // opcional, default INCC_MEDIO_HISTORICO
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
  creditoReajustadoContemplacao: number;
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
  const rendaLiquidaMensal = rendaBrutaMensal * (1 - VACANCIA); // deduz vacância 5%; IR não incluído
  const totalInvestidoTodas = data.numOperacoes * totalDesembolsado;
  const inccEfetivo = data.inccAnual ?? INCC_MEDIO_HISTORICO;
  const creditoReajustadoContemplacao = aplicarReajusteINCC(data.valorCredito, inccEfetivo, data.mesContemplacao);

  return {
    totalComTaxa, parcelaCheia, meiaParcela,
    totalDesembolsado, saldoDevedorNaContemplacao,
    aluguelMensal, saldoLivreBasico, saldoComReplicacao,
    operacoesFinanciaveis, patrimonioTotal,
    rendaBrutaMensal, rendaLiquidaMensal, totalInvestidoTodas,
    creditoReajustadoContemplacao,
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
  trMensal?: number;   // TR mensal default 0.001 (0.1%/mês)
  inccAnual?: number;  // INCC anual default INCC_MEDIO_HISTORICO (4.57%)
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
  mesCruzamento: number | null;
  excedenteCreditoSaldo: number;
}

export interface PontoEvolucao {
  mes: number;
  saldoDevedor: number;
  creditoConsorcio: number;
  diferenca: number;   // creditoConsorcio - saldoDevedor (positivo = crédito maior)
}

export function calcularEvolucaoCreditoSaldo(data: QuitacaoData): PontoEvolucao[] {
  const trMensal = data.trMensal ?? 0.001;
  const inccAnual = data.inccAnual ?? INCC_MEDIO_HISTORICO;
  const pontos: PontoEvolucao[] = [];

  let saldo = data.saldoDevedorBanco;
  const maxMeses = Math.max(data.prazoRestanteBanco, data.prazoConsorcio);

  for (let mes = 0; mes <= maxMeses; mes += 12) {
    const creditoConsorcio = aplicarReajusteINCC(data.valorCredito, inccAnual, mes);
    const diferenca = creditoConsorcio - saldo;
    pontos.push({ mes, saldoDevedor: Math.max(0, saldo), creditoConsorcio, diferenca });

    // Evolução do saldo bancário pelos próximos 12 meses
    for (let i = 0; i < 12; i++) {
      if (saldo <= 0) break;
      saldo = Math.max(0, saldo * (1 + trMensal) - data.parcelaBanco);
    }
  }

  return pontos;
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

  const trMensal = data.trMensal ?? 0.001;
  const inccAnual = data.inccAnual ?? INCC_MEDIO_HISTORICO;

  // Simular saldo com TR ao longo do tempo para encontrar o mês de cruzamento
  let saldoSimulado = data.saldoDevedorBanco;
  let mesCruzamento: number | null = null;
  for (let mes = 1; mes <= data.prazoRestanteBanco; mes++) {
    saldoSimulado = Math.max(0, saldoSimulado * (1 + trMensal) - data.parcelaBanco);
    const creditoMes = aplicarReajusteINCC(data.valorCredito, inccAnual, mes);
    if (creditoMes >= saldoSimulado && mesCruzamento === null) {
      mesCruzamento = mes;
    }
  }

  // Crédito e saldo no mês de cruzamento (ou no final do prazo)
  const mesRef = mesCruzamento ?? data.prazoRestanteBanco;
  let saldoNoMesRef = data.saldoDevedorBanco;
  for (let i = 0; i < mesRef; i++) {
    saldoNoMesRef = Math.max(0, saldoNoMesRef * (1 + trMensal) - data.parcelaBanco);
  }
  const creditoNoMesRef = aplicarReajusteINCC(data.valorCredito, inccAnual, mesRef);
  const excedenteCreditoSaldo = Math.max(0, creditoNoMesRef - saldoNoMesRef);

  return {
    custoTotalBanco, jurosTotaisBanco,
    totalComTaxaConsorcio, parcelaCheiaConsorcio, meiaParcela,
    saldoDevedorConsorcioContemplacao,
    custoSobreposicaoMensal, totalOverlapBanco, totalOverlapConsorcio,
    parcelasRestantesConsorcio, custoAposContemplacao,
    custoTotalConsorcio, economiaNominal,
    mesesDividaBanco, mesesDividaConsorcio, tempoEliminado,
    creditoCobre,
    mesCruzamento,
    excedenteCreditoSaldo,
  };
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

  // Ágio = % sobre o crédito atualizado na contemplação (valor do dia)
  const valorVenda = creditoAtualizado * (data.percentAgio / 100);
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

// ─── Cascata de Alavancagem ───────────────────────────────────────────────────

export interface CicloResult {
  numero: number;
  meiaParcela: number;
  credito: number;
  aluguelMensal: number;
  parcelaCheia: number;
  saldo: number; // aluguel - parcelaCheia (positivo = sobra, negativo = falta)
}

/**
 * Calcula N ciclos de alavancagem em cascata.
 *
 * Motor: P_meia(n) = P_bolso + Σ S(i) para i=1..n-1
 *        C(n) = P_meia(n) × 2 × prazo / (1 + taxaAdm)
 *        A(n) = C(n) × valorMultiplier × rendimento
 *        S(n) = A(n) − P_cheia(n)
 */
export function calcularCascata(
  base: { meiaParcela: number; credito: number; aluguelMensal: number; parcelaCheia: number },
  prazoTotal: number,
  taxaAdm: number,
  valorMultiplier: number,
  rendimentoPercent: number,
  numCiclos: number,
): CicloResult[] {
  const pBolso = base.meiaParcela;
  const ciclos: CicloResult[] = [
    {
      numero: 1,
      meiaParcela: base.meiaParcela,
      credito: base.credito,
      aluguelMensal: base.aluguelMensal,
      parcelaCheia: base.parcelaCheia,
      saldo: base.aluguelMensal - base.parcelaCheia,
    },
  ];

  for (let i = 2; i <= numCiclos; i++) {
    const somaS = ciclos.reduce((acc, c) => acc + c.saldo, 0);
    const meiaParcela = Math.max(0, pBolso + somaS);
    const parcelaCheia = 2 * meiaParcela;
    const credito = parcelaCheia * prazoTotal / (1 + taxaAdm);
    const aluguelMensal = credito * valorMultiplier * rendimentoPercent;
    const saldo = aluguelMensal - parcelaCheia;
    ciclos.push({ numero: i, meiaParcela, credito, aluguelMensal, parcelaCheia, saldo });
  }

  return ciclos;
}
