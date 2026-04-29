# WhatsApp Sharing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um botão "Compartilhar Simulação" na tela de resultados de todas as 8 ferramentas, gerando uma mensagem WhatsApp pré-formatada com os números principais da simulação.

**Architecture:** Dois novos arquivos (`src/lib/whatsapp.ts` com funções puras de composição de mensagem, `src/components/ShareButton.tsx` com o botão reutilizável) + modificação da tela de resultados de cada ferramenta. No iPad/iOS, `navigator.share()` abre o share sheet nativo; nos demais, abre `wa.me` em nova aba.

**Tech Stack:** React 18 + TypeScript + Tailwind + Vitest. Ícone WhatsApp: SVG inline (lucide não tem). Tipos de `src/lib/calculations.ts` usados diretamente.

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/lib/whatsapp.ts` | Criar | 8 builders de mensagem + `openWhatsApp` |
| `src/lib/whatsapp.test.ts` | Criar | Testes unitários dos builders e da função de abertura |
| `src/components/ShareButton.tsx` | Criar | Botão reutilizável com estado de sucesso e feedback tátil |
| `src/tools/QuickCalc.tsx` | Modificar | Adicionar ShareButton no bloco de resultados |
| `src/tools/CalculadoraLance.tsx` | Modificar | Adicionar ShareButton em `Step3` |
| `src/tools/CompraeConstrucao.tsx` | Modificar | Adicionar ShareButton em `Step8` |
| `src/tools/VendaDaCartaContemplada.tsx` | Modificar | Adicionar ShareButton em `Step4` |
| `src/tools/AluguelConsorcio.tsx` | Modificar | Adicionar ShareButton em `Step6` |
| `src/tools/CartaAplicada.tsx` | Modificar | Adicionar ShareButton no bloco de resultado final |
| `src/tools/QuitacaoFinanciamento.tsx` | Modificar | Adicionar ShareButton em `Step4` |
| `src/tools/SimuladorLance.tsx` | Modificar | Adicionar ShareButton após o grid de resultados |

---

## Task 1: Criar `src/lib/whatsapp.ts` com TDD

**Files:**
- Create: `src/lib/whatsapp.test.ts`
- Create: `src/lib/whatsapp.ts`

- [ ] **Step 1.1: Escrever os testes que vão falhar**

Criar `src/lib/whatsapp.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  SimData, SimResults,
  VendaCartaData, VendaCartaResults,
  AluguelData, AluguelResults,
  CartaAplicadaData, CartaAplicadaResults,
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
```

- [ ] **Step 1.2: Confirmar que os testes falham**

```bash
npm run test -- whatsapp
```

Esperado: todos os testes falham com "Cannot find module './whatsapp'".

- [ ] **Step 1.3: Criar `src/lib/whatsapp.ts`**

```ts
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
```

- [ ] **Step 1.4: Rodar testes e confirmar que passam**

```bash
npm run test -- whatsapp
```

Esperado: todos os testes passam. Se `openWhatsApp` falhar por problema de mock de `navigator`, verificar que o teste usa `configurable: true` no `defineProperty`.

- [ ] **Step 1.5: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp.test.ts
git commit -m "feat(whatsapp): builders de mensagem e openWhatsApp para todas as ferramentas"
```

---

## Task 2: Criar `src/components/ShareButton.tsx`

**Files:**
- Create: `src/components/ShareButton.tsx`

- [ ] **Step 2.1: Criar o componente**

Criar `src/components/ShareButton.tsx`:

```tsx
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { openWhatsApp } from '../lib/whatsapp';

const WhatsAppSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ShareButtonProps {
  message: string;
  label?: string;
}

export default function ShareButton({ message, label = 'Compartilhar Simulação' }: ShareButtonProps) {
  const [success, setSuccess] = useState(false);
  const disabled = message === '';

  const handleClick = () => {
    if (disabled) return;
    openWhatsApp(message);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      className="w-full flex items-center justify-center gap-3 rounded-2xl px-6 font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.97]"
      style={{
        minHeight: '56px',
        background: success
          ? 'rgba(193,177,118,0.12)'
          : disabled
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(37,211,102,0.12)',
        border: `1px solid ${
          success
            ? 'rgba(193,177,118,0.35)'
            : disabled
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(37,211,102,0.35)'
        }`,
        color: success ? 'var(--gold)' : disabled ? 'rgba(255,255,255,0.2)' : '#25D366',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {success ? (
        <>
          <CheckCircle2 size={20} />
          <span>Enviado!</span>
        </>
      ) : (
        <>
          <WhatsAppSvg />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
```

- [ ] **Step 2.2: Confirmar que o TypeScript compila sem erros**

```bash
npm run build 2>&1 | head -20
```

Esperado: sem erros de tipo. Se houver, corrigir antes de continuar.

- [ ] **Step 2.3: Commit**

```bash
git add src/components/ShareButton.tsx
git commit -m "feat(ShareButton): botão de compartilhamento WhatsApp com feedback tátil para iPad"
```

---

## Task 3: Adicionar ShareButton em QuickCalc

**Files:**
- Modify: `src/tools/QuickCalc.tsx`

QuickCalc tem `const r = useMemo(() => calculateQuickCalc(data), [data])` na linha ~77 e renderiza resultados num bloco final. O `data` é `QuickCalcData` do hook `useConsorcioInputData`.

- [ ] **Step 3.1: Adicionar imports no topo de `QuickCalc.tsx`**

Localizar as linhas de import existentes (em torno de linha 1–13) e adicionar após o último import:

```tsx
import ShareButton from '../components/ShareButton';
import { buildQuickCalcMsg } from '../lib/whatsapp';
```

- [ ] **Step 3.2: Adicionar ShareButton antes do fechamento do bloco de resultados**

Localizar o bloco `{/* Profit panel */}` e a `</AnimatePresence>` que o encerra. Adicionar o `ShareButton` logo após a `</AnimatePresence>`, antes do `</div>` que fecha o container de resultados:

Encontrar este trecho (perto do fim do arquivo, após o painel de lucro):
```tsx
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
```

Substituir por:
```tsx
          </AnimatePresence>

          <ShareButton message={buildQuickCalcMsg(data, r)} />
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 3.3: Verificar build**

```bash
npm run build 2>&1 | head -20
```

Esperado: sem erros de tipo.

- [ ] **Step 3.4: Commit**

```bash
git add src/tools/QuickCalc.tsx
git commit -m "feat(QuickCalc): adiciona botão de compartilhamento WhatsApp nos resultados"
```

---

## Task 4: Adicionar ShareButton em CalculadoraLance (Step3)

**Files:**
- Modify: `src/tools/CalculadoraLance.tsx`

`Step3` tem assinatura `function Step3({ data, r }: { data: Data; r: R })` (linha ~495). `Data` é a interface local (linha ~14). `R = ReturnType<typeof calcular>` (linha ~167). Campos usados: `data.valorCredito`, `data.prazoTotal`, `data.tipoLance`, `r.lanceTotalPercent`, `r.lanceTotal`, `r.creditoLiquido`, `r.saldoDevedor`, `r.parcela`.

- [ ] **Step 4.1: Adicionar imports**

No topo do arquivo, após os imports existentes:
```tsx
import ShareButton from '../components/ShareButton';
import { buildLanceMsg } from '../lib/whatsapp';
```

- [ ] **Step 4.2: Adicionar ShareButton no final do `return` de `Step3`**

Localizar a função `Step3` (linha ~495). Dentro do `return (...)` dela, adicionar `<ShareButton>` como último filho do `<div>` principal (antes do `</div>` de fechamento do bloco de resultados):

Encontrar o fechamento do bloco de conteúdo de `Step3` — será um `</div>` com `className="space-y-6"` ou similar. Adicionar antes desse fechamento:

```tsx
<ShareButton
  message={buildLanceMsg({
    valorCredito: data.valorCredito,
    prazoTotal: data.prazoTotal,
    tipoLance: data.tipoLance,
    lanceTotalPercent: r.lanceTotalPercent,
    lanceTotal: r.lanceTotal,
    creditoLiquido: r.creditoLiquido,
    saldoDevedor: r.saldoDevedor,
    parcela: r.parcela,
  })}
/>
```

- [ ] **Step 4.3: Verificar build**

```bash
npm run build 2>&1 | head -20
```

- [ ] **Step 4.4: Commit**

```bash
git add src/tools/CalculadoraLance.tsx
git commit -m "feat(CalculadoraLance): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 5: Adicionar ShareButton em CompraeConstrucao (Step8)

**Files:**
- Modify: `src/tools/CompraeConstrucao.tsx`

`Step8` começa na linha ~478 com assinatura `function Step8({ data, set, r }: { data: SimData; set: ...; r: ReturnType<typeof calculate> })`.

- [ ] **Step 5.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildCompraConstrucaoMsg } from '../lib/whatsapp';
```

- [ ] **Step 5.2: Adicionar ShareButton no final do `return` de `Step8`**

Dentro do `return (...)` de `Step8`, adicionar `<ShareButton>` como último filho do `<div>` de conteúdo (antes do `</div>` final):

```tsx
<ShareButton message={buildCompraConstrucaoMsg(data, r)} />
```

- [ ] **Step 5.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/CompraeConstrucao.tsx
git commit -m "feat(CompraeConstrucao): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 6: Adicionar ShareButton em VendaDaCartaContemplada (Step4)

**Files:**
- Modify: `src/tools/VendaDaCartaContemplada.tsx`

`Step4` começa na linha ~234 com assinatura `function Step4({ data, set, r }: { data: VendaCartaData; set: SetFn; r: Results })`.

- [ ] **Step 6.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildVendaCartaMsg } from '../lib/whatsapp';
```

- [ ] **Step 6.2: Adicionar ShareButton no final do `return` de `Step4`**

```tsx
<ShareButton message={buildVendaCartaMsg(data, r)} />
```

- [ ] **Step 6.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/VendaDaCartaContemplada.tsx
git commit -m "feat(VendaDaCartaContemplada): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 7: Adicionar ShareButton em AluguelConsorcio (Step6)

**Files:**
- Modify: `src/tools/AluguelConsorcio.tsx`

`Step6` começa na linha ~330 com assinatura `function Step6({ data, r, ciclos, numCiclos, setNumCiclos, valorMultiplier }: { data: AluguelData; ... })`. Os campos necessários para a mensagem (`data.valorCredito`, `data.prazoTotal`, `data.numOperacoes`, `r.meiaParcela`, etc.) estão disponíveis nos props.

- [ ] **Step 7.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildAluguelMsg } from '../lib/whatsapp';
```

- [ ] **Step 7.2: Adicionar ShareButton no final do `return` de `Step6`**

```tsx
<ShareButton message={buildAluguelMsg(data, r)} />
```

- [ ] **Step 7.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/AluguelConsorcio.tsx
git commit -m "feat(AluguelConsorcio): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 8: Adicionar ShareButton em CartaAplicada

**Files:**
- Modify: `src/tools/CartaAplicada.tsx`

CartaAplicada não tem steps separados — é um componente único. Tem `const r = useMemo(() => calculateCartaAplicada(data), [data])` (linha ~32). O `data` é `CartaAplicadaData`, obtido de `useConsorcioInputData`.

- [ ] **Step 8.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildCartaAplicadaMsg } from '../lib/whatsapp';
```

- [ ] **Step 8.2: Adicionar ShareButton no bloco de resultados**

Localizar a seção final de resultados do componente (onde `r.saldoLiquido` e `r.rentabilidadeMensal` são exibidos). Adicionar `<ShareButton>` após o último card de resultado, antes do `</div>` de fechamento do bloco:

```tsx
<ShareButton message={buildCartaAplicadaMsg(data, r)} />
```

- [ ] **Step 8.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/CartaAplicada.tsx
git commit -m "feat(CartaAplicada): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 9: Adicionar ShareButton em QuitacaoFinanciamento (Step4)

**Files:**
- Modify: `src/tools/QuitacaoFinanciamento.tsx`

`Step4` começa na linha ~367 com assinatura `function Step4({ data, r }: { data: QuitacaoData; r: Results })`.

- [ ] **Step 9.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildQuitacaoMsg } from '../lib/whatsapp';
```

- [ ] **Step 9.2: Adicionar ShareButton no final do `return` de `Step4`**

```tsx
<ShareButton message={buildQuitacaoMsg(data, r)} />
```

- [ ] **Step 9.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/QuitacaoFinanciamento.tsx
git commit -m "feat(QuitacaoFinanciamento): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 10: Adicionar ShareButton em SimuladorLance

**Files:**
- Modify: `src/tools/SimuladorLance.tsx`

SimuladorLance é componente único. State: `valorCredito` (linha ~60), `mesesEmDia` (linha ~61). Resultados: `resultados` (array, linha ~63) com shape `{ nome, elegivel, valorLance, creditoEfetivo, reducaoCredito, faltamMeses, percentLance, ... }`.

- [ ] **Step 10.1: Adicionar imports**

```tsx
import ShareButton from '../components/ShareButton';
import { buildSimuladorLanceMsg } from '../lib/whatsapp';
```

- [ ] **Step 10.2: Adicionar ShareButton após o grid de cards de lances**

Localizar o fechamento do grid `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">` (linha ~153). Adicionar `<ShareButton>` após esse `</div>` e antes do próximo bloco (se existir bloco informativo final):

```tsx
<ShareButton
  message={buildSimuladorLanceMsg({
    valorCredito,
    mesesEmDia,
    elegiveis: resultados,
  })}
/>
```

- [ ] **Step 10.3: Verificar build e commit**

```bash
npm run build 2>&1 | head -20
git add src/tools/SimuladorLance.tsx
git commit -m "feat(SimuladorLance): adiciona compartilhamento WhatsApp no resultado final"
```

---

## Task 11: Smoke test final e push

- [ ] **Step 11.1: Rodar todos os testes**

```bash
npm run test
```

Esperado: todos os testes passam, incluindo os novos de `whatsapp.test.ts`.

- [ ] **Step 11.2: Build de produção limpo**

```bash
npm run build
```

Esperado: sem erros de tipo ou de compilação.

- [ ] **Step 11.3: Verificação manual rápida (3 ferramentas)**

```bash
npm run dev
```

Abrir no browser e verificar:
1. **QuickCalc**: preencher crédito + prazo → botão "Compartilhar Simulação" aparece em verde → clicar → share sheet abre (ou nova aba wa.me) com mensagem pré-preenchida
2. **QuitacaoFinanciamento**: avançar até step 4 → botão aparece → mensagem contém "Economia nominal"
3. **SimuladorLance**: preencher crédito → botão aparece abaixo do grid

- [ ] **Step 11.4: Push**

```bash
git push
```

---

## Self-review do plano

**Spec coverage:**
- ✅ `src/lib/whatsapp.ts` com 8 builders + `openWhatsApp`
- ✅ `src/components/ShareButton.tsx` com feedback de sucesso e toque
- ✅ `navigator.share` no iOS/iPad + fallback `wa.me`
- ✅ Botão em todas as 8 ferramentas
- ✅ Botão desabilitado quando message === '' (garantido pelo cálculo sempre presente — todos os builders recebem `data` + `r` que existem desde o primeiro render)
- ✅ Touch target ≥ 56px (`minHeight: '56px'`)
- ✅ TDD com testes para builders e para `openWhatsApp`

**Checagem de tipos:**
- `buildLanceMsg` usa parâmetro local (não importa `Data` do CalculadoraLance, que é tipo privado) ✅
- `buildSimuladorLanceMsg` usa parâmetro local (não importa tipos do SimuladorLance) ✅
- `buildQuitacaoMsg` recebe `(_data: QuitacaoData, r: QuitacaoResults)` — `_data` prefixado com `_` pois não é usado na mensagem ✅
- Todos os tipos de `calculations.ts` são públicos e exportados ✅
