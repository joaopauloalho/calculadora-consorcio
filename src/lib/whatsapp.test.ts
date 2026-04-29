// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  openWhatsApp,
  buildQuickCalcMsg,
  buildLanceMsg,
  buildCompraConstrucaoMsg,
  buildVendaCartaMsg,
  buildAluguelMsg,
  buildCartaAplicadaMsg,
  buildQuitacaoMsg,
  buildSimuladorLanceMsg,
} from './whatsapp';
import type {
  QuickCalcData, QuickCalcResults,
  QuitacaoData, QuitacaoResults,
} from './calculations';

describe('openWhatsApp', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('usa navigator.share quando disponível', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: shareMock, writable: true, configurable: true });
    openWhatsApp('olá mundo');
    expect(shareMock).toHaveBeenCalledWith({ text: 'olá mundo' });
  });

  it('abre wa.me quando navigator.share não está disponível', () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    openWhatsApp('teste');
    expect(openSpy).toHaveBeenCalledWith(
      'https://wa.me/?text=' + encodeURIComponent('teste'),
      '_blank',
    );
  });
});

describe('buildQuickCalcMsg', () => {
  const data: QuickCalcData = {
    assetType: 'imovel',
    valorCredito: 200000,
    prazoTotal: 180,
    comSeguro: false,
    paymentMode: 'meia',
    mesContemplacao: 24,
    percentAgio: 0,
  };
  const r = {
    taxaAdm: 0.23,
    seguroPercent: 0,
    seguroMensalMedio: 0,
    totalComTaxa: 246000,
    parcelaCheiaOriginal: 1366.67,
    meiaParcela: 683.33,
    saldoDevedorContemplacao: 229600,
    parcelaEfetivaPreContemp: 683.33,
    totalInvestido: 16400,
    parcelaNova: 1275.56,
    creditoAtualizado: 219047,
    correcaoAnual: 0.05,
    correcaoIndice: 'INCC',
    valorVenda: 0,
    lucroLiquido: 0,
    capitalMedioEmpregado: 0,
    rentabilidadeMensal: 0,
  } as QuickCalcResults;

  it('contém nome da ferramenta', () => {
    const msg = buildQuickCalcMsg(data, r);
    expect(msg).toContain('Simulação de Consórcio');
  });

  it('contém crédito formatado', () => {
    const msg = buildQuickCalcMsg(data, r);
    expect(msg).toContain('200.000');
  });

  it('contém prazo', () => {
    const msg = buildQuickCalcMsg(data, r);
    expect(msg).toContain('180 meses');
  });

  it('contém rodapé', () => {
    const msg = buildQuickCalcMsg(data, r);
    expect(msg).toContain('Simulação Consórcio');
  });
});

describe('buildQuitacaoMsg', () => {
  const data: QuitacaoData = {
    saldoDevedorBanco: 150000,
    parcelaBanco: 2000,
    prazoRestanteBanco: 120,
    valorCredito: 150000,
    taxaAdm: 0.23,
    prazoConsorcio: 180,
    mesContemplacao: 24,
  };
  const r = {
    custoTotalBanco: 240000,
    jurosTotaisBanco: 90000,
    totalComTaxaConsorcio: 184500,
    parcelaCheiaConsorcio: 1025,
    meiaParcela: 512.5,
    saldoDevedorConsorcioContemplacao: 172100,
    custoSobreposicaoMensal: 2512.5,
    totalOverlapBanco: 60000,
    totalOverlapConsorcio: 12300,
    parcelasRestantesConsorcio: 156,
    custoAposContemplacao: 159900,
    custoTotalConsorcio: 172200,
    economiaNominal: 67800,
    mesesDividaBanco: 120,
    mesesDividaConsorcio: 180,
    tempoEliminado: 72,
    creditoCobre: true,
    mesCruzamento: 18,
    excedenteCreditoSaldo: 5000,
  } as QuitacaoResults;

  it('contém economia formatada', () => {
    const msg = buildQuitacaoMsg(data, r);
    expect(msg).toContain('67.800');
  });

  it('contém tempo eliminado', () => {
    const msg = buildQuitacaoMsg(data, r);
    expect(msg).toContain('72 meses');
  });
});

describe('buildLanceMsg', () => {
  it('formata corretamente lance livre', () => {
    const msg = buildLanceMsg({
      valorCredito: 300000,
      prazoTotal: 180,
      tipoLance: 'livre',
      lanceTotalPercent: 30,
      lanceTotal: 90000,
      creditoLiquido: 300000,
      saldoDevedor: 180000,
      parcela: 1917,
    });
    expect(msg).toContain('Lance Livre');
    expect(msg).toContain('30%');
    expect(msg).toContain('90.000');
  });
});

describe('buildSimuladorLanceMsg', () => {
  it('lista melhor lance elegível', () => {
    const msg = buildSimuladorLanceMsg({
      valorCredito: 1000000,
      mesesEmDia: 12,
      elegiveis: [
        { nome: 'Ello Sem Carência', percentLance: 29, valorLance: 290000, creditoEfetivo: 710000, elegivel: true },
        { nome: 'Ello Bronze', percentLance: 29, valorLance: 290000, creditoEfetivo: 710000, elegivel: true },
        { nome: 'Ello Prata', percentLance: 26, valorLance: 260000, creditoEfetivo: 740000, elegivel: true },
        { nome: 'Ello Ouro', percentLance: 23, valorLance: 230000, creditoEfetivo: 770000, elegivel: false },
        { nome: 'Ello Diamante', percentLance: 0, valorLance: 0, creditoEfetivo: 1000000, elegivel: false },
      ],
    });
    expect(msg).toContain('Ello Prata');
    expect(msg).toContain('26%');
  });

  it('mostra mensagem quando não há elegíveis', () => {
    const msg = buildSimuladorLanceMsg({
      valorCredito: 1000000,
      mesesEmDia: 0,
      elegiveis: [
        { nome: 'Ello Sem Carência', percentLance: 29, valorLance: 290000, creditoEfetivo: 710000, elegivel: false },
      ],
    });
    expect(msg).toContain('Nenhum lance');
  });
});
