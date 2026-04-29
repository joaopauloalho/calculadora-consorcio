# Codex Implementation Prompt — Calculadora Consórcio (Features 2–7)

## Contexto Geral do Projeto

**Stack:** React 18 + TypeScript (strict) + Vite + Tailwind CSS + shadcn/ui + Framer Motion  
**Deploy:** Vercel (branch main)  
**Dispositivo alvo:** iPad (touch-first, min 56px touch targets, `active:scale-[0.97]`)  
**Testes:** Vitest (`npm run test`)  
**Comandos:** `npm run dev` | `npm run build` | `npm run test`

### Design System (CSS variables em `src/index.css`)
```
--gold: #C1B176          (dourado primário)
--gold-dim: rgba(193,177,118,0.12)
--gold-border: rgba(193,177,118,0.25)
--bg-black: #031715      (fundo das páginas)
--bg-card: #0A1F1C       (fundo de cards)
--border: rgba(255,255,255,0.08)
--text-primary: #F7F8FD
--text-secondary: rgba(247,248,253,0.45)
--alert: #CC3366
--alert-dim: rgba(204,51,102,0.12)
```

### Padrões de código
- Importar componentes de `@/components/ui/` (shadcn) ou `src/components/shared.tsx`
- Usar `fmt(value)` de `src/lib/calculations` para formatar moeda (ex: `fmt(200000)` → `"R$ 200.000,00"`)
- Framer Motion já instalado: usar `motion`, `AnimatePresence` para transições
- Ícones: `lucide-react` (já instalado)
- **Sem `any` TypeScript** — tipagem explícita sempre

### Arquitetura de arquivos relevantes
```
src/
  App.tsx                    — roteamento principal (View + state)
  screens/
    PurposeScreen.tsx        — hub inicial (207 linhas)
    MatrixScreen.tsx         — menu de ferramentas (~206 linhas)
  tools/
    QuickCalc.tsx            — Calculadora Expressa (443 linhas)
    CalculadoraLance.tsx     — Calculadora de Lance (632 linhas)
    CompraeConstrucao.tsx    — Compra & Construção
    VendaDaCartaContemplada.tsx
    AluguelConsorcio.tsx
    CartaAplicada.tsx
    QuitacaoFinanciamento.tsx
    SimuladorLance.tsx
  components/
    shared.tsx               — Label, StatCard, GoldInput, ProgressDots, StepHeader,
                               ToggleRow, AnimatedValue, slideVariants (155 linhas)
    ShareButton.tsx          — botão WhatsApp (já implementado)
    BRLInput.tsx             — input de moeda BRL
    FunilContemplacao.tsx
  lib/
    calculations.ts          — todos os tipos e funções de cálculo (586 linhas)
    whatsapp.ts              — builders de mensagem WhatsApp (já implementado)
  hooks/
    useConsorcioInputData.ts — hook genérico para inputs de consórcio
    useCalculatorNavigation.ts
```

### Roteamento (App.tsx)
```tsx
type View = 'purpose' | 'matrix' | 'tool' | 'quickcalc' | 'lance';
type Purpose = 'quickcalc' | 'lance' | 'acquisition' | 'return';
```
Cada ferramenta recebe `onBack: () => void` como prop.

---

## Feature 2 — Comparação de 2 Cenários Side-by-Side (CalculadoraLance)

### O que fazer
Na tela de resultado da CalculadoraLance (Step 3), adicionar um botão **"Comparar cenário"** que duplica o painel de resultado em dois cards lado a lado, permitindo que o vendedor ajuste os parâmetros de um segundo cenário e compare com o primeiro.

### Comportamento esperado
1. Step 3 começa no modo **normal** (cenário único, igual a hoje)
2. Botão "Comparar Cenário" aparece no topo do Step 3
3. Ao clicar: o layout divide em **2 colunas** (no iPad, lado a lado; no mobile, empilhado com abas)
4. Coluna A = "Cenário Atual" — **apenas leitura**, mostra os valores do Step 2
5. Coluna B = "Novo Cenário" — tem campos editáveis inline: `lancePercent` (slider), `tipoLance` (toggle livre/embutido), `mesContemplacao` (slider)
6. Coluna B recalcula em tempo real à medida que o usuário muda os campos
7. Diferenças são destacadas: se B for melhor (crédito líquido maior ou saldo devedor menor), a célula fica com borda verde; se pior, borda vermelha/âmbar
8. Botão "Fechar comparação" volta ao modo normal

### Onde modificar
- **Arquivo:** `src/tools/CalculadoraLance.tsx`
- **Função afetada:** `Step3({ data, r })`
- Adicionar state local em Step3: `const [comparando, setComparando] = useState(false)`
- Adicionar state para dados do Cenário B: `const [dataB, setDataB] = useState<Data>(data)` — inicializa com cópia do data atual
- Usar a função `calcular(dataB)` existente (já definida no mesmo arquivo) para computar `rB`

### Interface de Comparação (layout)

**Modo comparação ativo (iPad — grid 2 colunas):**
```
┌──────────────────┬──────────────────┐
│  CENÁRIO A       │  CENÁRIO B       │
│  (atual)         │  (novo)          │
│  Crédito: R$X    │  Crédito: R$Y    │
│  Lance: 30%      │  Lance: [slider] │
│  Líquido: R$A    │  Líquido: R$B ✓  │
│  Saldo: R$C      │  Saldo: R$D      │
└──────────────────┴──────────────────┘
```

**Campos editáveis em B:**
- `tipoLance`: toggle "Livre / Embutido"
- `lancePercent` (se livre): slider 10–50%
- `ofertaTotalPercent` / `tierSelecionado` (se embutido): mesmas opções do Step 2
- `mesContemplacao`: slider (mesmos limites do data.prazoTotal)

**Métricas comparadas (uma por linha):**
- Crédito Líquido
- Lance Total (R$ e %)
- Recursos Próprios Necessários
- Saldo Devedor
- Parcela posterior

**Destaque de diferenças:**
- Se B melhor → `color: '#00C864'` (verde), borda verde
- Se B pior → `color: 'var(--alert)'` (vermelho), borda âmbar
- Se igual → `color: 'white'`

### ShareButton no modo comparação
Quando comparando, o ShareButton deve enviar os dois cenários. Criar uma nova função em `src/lib/whatsapp.ts`:
```ts
export function buildLanceComparacaoMsg(
  dataA: { valorCredito: number; prazoTotal: number; tipoLance: 'livre' | 'embutido'; lanceTotalPercent: number; lanceTotal: number; creditoLiquido: number; saldoDevedor: number; parcela: number },
  dataB: { valorCredito: number; prazoTotal: number; tipoLance: 'livre' | 'embutido'; lanceTotalPercent: number; lanceTotal: number; creditoLiquido: number; saldoDevedor: number; parcela: number }
): string
```
Mensagem formato:
```
*🎯 Comparação de Lance*
━━━━━━━━━━━━━━
           CENÁRIO A    CENÁRIO B
Lance:     *30%*        *40%*
Líquido:   *R$210k*     *R$180k*
Saldo:     *R$150k*     *R$120k*
Parcela:   *R$1.200*    *R$1.200*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```

---

## Feature 3 — Integrar "Tenho Poupança/Carro" na Calculadora Expressa

### O que fazer
Na Calculadora Expressa (`QuickCalc.tsx`), adicionar dois ToggleRows novos que, quando ativados, mostram campos de valor e incluem esse recurso no cálculo de lance estimado.

### Contexto atual
Os toggles NÃO existem hoje. O QuickCalc atual tem:
- Toggle "Com Seguro" (`comSeguro`)
- Toggle "Vender com Lucro" (`venderComLucro`)

### O que adicionar

**Novos campos no estado local do QuickCalc** (não no `QuickCalcData` de calculations.ts, pois são campos de UX):
```tsx
const [temPoupanca, setTemPoupanca] = useState(false);
const [valorPoupanca, setValorPoupanca] = useState(0);
const [temCarro, setTemCarro] = useState(false);
const [valorCarro, setValorCarro] = useState(0);
```

**Novos ToggleRows** (adicionar na coluna de inputs, após o toggle "Com Seguro"):
```tsx
<ToggleRow
  active={temPoupanca}
  onClick={() => setTemPoupanca(!temPoupanca)}
  icon={<Wallet size={18} />}
  title="Tenho Poupança"
  sub="Usar como lance para contemplação antecipada"
/>
{/* Se ativo: mostrar BRLInput para valorPoupanca */}

<ToggleRow
  active={temCarro}
  onClick={() => setTemCarro(!temCarro)}
  icon={<Car size={18} />}
  title="Tenho Carro para Vender"
  sub="Usar o valor de venda como lance"
/>
{/* Se ativo: mostrar BRLInput para valorCarro */}
```

**Cálculo do lance estimado** (computar a partir dos estados acima):
```tsx
const totalRecursosProprios = (temPoupanca ? valorPoupanca : 0) + (temCarro ? valorCarro : 0);
const percentLanceEstimado = r.totalComTaxa > 0
  ? (totalRecursosProprios / r.creditoAtualizado) * 100
  : 0;
```
Onde `r.creditoAtualizado` é o crédito corrigido pelo INCC já calculado por `calculateQuickCalc`.

**Novo card de resultado** (mostrar na coluna de resultados, logo abaixo da parcela, quando `totalRecursosProprios > 0`):
```
┌─────────────────────────────────────────┐
│  💡 ESTIMATIVA DE LANCE                  │
│  Recursos disponíveis: R$ 50.000        │
│  Lance estimado: 23,4% do crédito       │
│  Crédito líquido após lance: R$ 192.000 │
│  Saldo devedor após lance: R$ 178.000   │
└─────────────────────────────────────────┘
```

Campos do card:
- `totalRecursosProprios` — valor total disponível para lance
- `percentLanceEstimado.toFixed(1) + '%'` — percentual do crédito atualizado
- `r.creditoAtualizado - totalRecursosProprios` se tipoLance fosse embutido, ou `r.creditoAtualizado` se livre (mostrar como "crédito líquido estimado")
- `r.saldoDevedorContemplacao - totalRecursosProprios` → saldo devedor após dedução do lance

**Estilo do card:** fundo `rgba(37,211,102,0.06)`, borda `rgba(37,211,102,0.2)`, título em verde (`#25D366`). Aparece com `AnimatePresence`/`motion.div` (animate height).

**Atualizar ShareButton** no QuickCalc para incluir os dados de lance quando `totalRecursosProprios > 0`:
Modificar `buildQuickCalcMsg` em `src/lib/whatsapp.ts` para aceitar parâmetro opcional:
```ts
export function buildQuickCalcMsg(
  data: QuickCalcData,
  r: QuickCalcResults,
  lance?: { totalRecursos: number; percentLance: number }
): string
```
Se `lance` informado, adicionar linha extra na mensagem:
```
Recursos p/ lance: *R$ X* (~*Y%*)
```

---

## Feature 4 — Tela de Diagnóstico (Quiz → Recomenda Ferramenta)

### O que fazer
Criar uma nova tela `src/screens/DiagnosticoScreen.tsx` com 3–4 perguntas sequenciais que recomendam a ferramenta certa. Um novo card no `PurposeScreen` abre essa tela.

### Fluxo do diagnóstico

**Pergunta 1:** "O que você quer fazer com o consórcio?"
- A) Adquirir um imóvel ou veículo → (continua)
- B) Gerar retorno financeiro (investimento) → (continua)

**Pergunta 2 (se A):** "Você tem financiamento ativo hoje?"
- Sim → recomenda **Quitação de Financiamento** (tool 5)
- Não → vai para pergunta 3

**Pergunta 3 (se A + Não tem financiamento):** "Como pretende usar o imóvel?"
- Morar/usar → recomenda **Calculadora Expressa** (quickcalc)
- Alugar e gerar renda → recomenda **Aluguel com Consórcio** (tool 3)
- Construir e vender → recomenda **Compra e Construção** (tool 1)

**Pergunta 2 (se B):** "Qual o perfil de retorno?"
- Venda da carta com ágio → recomenda **Giro de Cartas** (tool 2)
- Carta aplicada no CDI → recomenda **Carta Aplicada** (tool 4)

**Tela de resultado do diagnóstico:**
```
┌─────────────────────────────────────────┐
│  ✓ Ferramenta recomendada               │
│                                         │
│  [ícone] Quitação de Financiamento      │
│  "Substitua seu financiamento por       │
│   consórcio e economize R$ X no total"  │
│                                         │
│  [ABRIR FERRAMENTA]  [Recomeçar]        │
└─────────────────────────────────────────┘
```

### Onde modificar

**1. Criar `src/screens/DiagnosticoScreen.tsx`**

Props:
```tsx
interface Props {
  onSelect: (tool: 'quickcalc' | 'lance' | 1 | 2 | 3 | 4 | 5 | 6) => void;
  onBack: () => void;
}
```

State interno:
```tsx
type Step = 'q1' | 'q2a' | 'q2b' | 'q3a' | 'result';
const [step, setStep] = useState<Step>('q1');
const [recommendation, setRecommendation] = useState<...>(null);
```

Animações: usar `AnimatePresence` + `motion.div` (mesmos `slideVariants` de `shared.tsx`) para transição entre perguntas.

Design: cada pergunta como cards de opção grandes (≥ 80px altura) com ícone, título e subtítulo. Padrão visual igual ao PurposeScreen (fundo `var(--bg-card)`, hover com glow, borda dourada no hover).

**2. Adicionar novo card no `PurposeScreen.tsx`**

Adicionar um 5º card no array `cards` (exibir antes dos 4 atuais, como card destacado no topo):
```tsx
{
  id: 'diagnostico' as Purpose,  // novo tipo
  iconEl: <HelpCircle size={24} />,
  iconBg: 'rgba(94,185,170,0.2)',
  title: 'Diagnóstico\nRápido',
  description: 'Responda 3 perguntas e saiba qual ferramenta usar na sua situação.',
  cta: 'Iniciar diagnóstico',
  ctaColor: '#5EB9AA',
  ...
}
```

**3. Atualizar `App.tsx`**

Adicionar `'diagnostico'` ao tipo `View` e ao tipo `Purpose`:
```tsx
type View = 'purpose' | 'matrix' | 'tool' | 'quickcalc' | 'lance' | 'diagnostico';
```

Adicionar handler em `handlePurposeSelect`:
```tsx
if (purpose === 'diagnostico') setView('diagnostico');
```

Adicionar render da nova tela:
```tsx
{view === 'diagnostico' && (
  <DiagnosticoScreen
    onSelect={(t) => { /* redireciona para a ferramenta */ }}
    onBack={() => setView('purpose')}
  />
)}
```

O `onSelect` do DiagnosticoScreen deve:
- Se `t === 'quickcalc'`: `setView('quickcalc')`
- Se `t === 'lance'`: `setView('lance')`
- Se `t` é número (1–6): `setTool(t); setView('tool')`

---

## Feature 5 — Comparador Consórcio vs Financiamento (inline na Expressa)

### O que fazer
Dentro da Calculadora Expressa, adicionar um toggle **"Comparar com Financiamento"** que expande um painel inline mostrando o custo total de um financiamento bancário para o mesmo bem.

### Onde adicionar
- **Arquivo:** `src/tools/QuickCalc.tsx`
- Posição: na coluna de resultados (direita), após os cards de resultado principais e antes do ShareButton

### Novos campos de state no QuickCalc
```tsx
const [compararFinanciamento, setCompararFinanciamento] = useState(false);
const [entradaFinanciamento, setEntradaFinanciamento] = useState(0);  // R$ entrada
```

### Cálculo do financiamento

Adicionar função helper em `src/lib/calculations.ts`:
```ts
export interface FinanciamentoData {
  valorBem: number;      // = data.valorCredito
  entrada: number;       // entrada em R$
  taxaJurosMensal: number;  // default: 0.0112 (1.12% a.m. = ~14.4% a.a. Caixa)
  prazoMeses: number;    // default: 360 (30 anos imóvel) ou 60 (veículo)
}

export interface FinanciamentoResults {
  valorFinanciado: number;    // valorBem - entrada
  parcelaInicial: number;     // sistema SAC: amortização + juros iniciais
  parcelaFinal: number;       // última parcela
  parcelaMedia: number;       // média das parcelas SAC
  totalPago: number;          // soma de todas parcelas + entrada
  totalJuros: number;         // totalPago - valorBem
  custoEfetivoAnual: number;  // CET aproximado em % a.a.
}

export function calculateFinanciamento(data: FinanciamentoData): FinanciamentoResults
```

Fórmula SAC (Sistema de Amortização Constante):
```
amortizacao = valorFinanciado / prazoMeses
parcelaInicial = amortizacao + valorFinanciado * taxaJurosMensal
parcelaFinal = amortizacao + amortizacao * taxaJurosMensal
parcelaMedia = (parcelaInicial + parcelaFinal) / 2
totalPago = (parcelaInicial + parcelaFinal) / 2 * prazoMeses + entrada
totalJuros = totalPago - valorBem
```

### UI do painel de comparação

**Toggle** (mesmo estilo dos outros ToggleRows):
```tsx
<ToggleRow
  active={compararFinanciamento}
  onClick={() => setCompararFinanciamento(!compararFinanciamento)}
  icon={<Scale size={18} />}
  title="Comparar com Financiamento"
  sub="Veja quanto custaria financiar o mesmo bem"
/>
```

**Painel expandido** (AnimatePresence, height: auto):
```
┌─────────────────────────────────────────┐
│  🏦 FINANCIAMENTO BANCÁRIO             │
│  (Taxa referência: 14,4% a.a. · SAC)   │
│                                         │
│  Entrada: [BRLInput]                    │
│                                         │
│  Parcela inicial:  R$ 4.200/mês        │
│  Parcela final:    R$ 2.100/mês        │
│  Total pago:       R$ 892.000          │
│  Total de juros:   R$ 392.000 😬       │
│                                         │
│  vs. CONSÓRCIO                         │
│  Total a pagar:    R$ 246.000          │
│  Economia:         R$ 646.000 ✓        │
└─────────────────────────────────────────┘
```

Campos mostrados:
- Parcela inicial e final (SAC decresce)
- Total pago no financiamento
- Total de juros pagos
- Linha de separação "vs. Consórcio"
- `r.totalComTaxa` do consórcio
- `economiaNominal = financiamento.totalPago - r.totalComTaxa`

Cores: financiamento em vermelho/âmbar (`var(--alert)`), consórcio em dourado, economia em verde

### Atualizar buildQuickCalcMsg
Se `compararFinanciamento` ativo, adicionar seção na mensagem WhatsApp:
```
🏦 Financiamento: *R$ X total* (R$ Y de juros)
💚 Consórcio: *R$ Z total*
Economia: *R$ W*
```

---

## Feature 6 — Salvar Última Simulação por Ferramenta (localStorage)

### O que fazer
Persistir automaticamente os inputs de cada ferramenta no `localStorage`. Na próxima abertura, carregar o estado salvo.

### Onde implementar

Criar hook reutilizável `src/hooks/usePersistedState.ts`:
```ts
import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage pode estar cheio ou bloqueado
    }
  }, [key, state]);

  return [state, setState];
}
```

### Chaves localStorage por ferramenta

| Ferramenta | Chave |
|---|---|
| QuickCalc | `'prestige:quickcalc:data'` |
| CalculadoraLance | `'prestige:lance:data'` |
| CompraeConstrucao | `'prestige:compra:data'` |
| VendaDaCartaContemplada | `'prestige:venda:data'` |
| AluguelConsorcio | `'prestige:aluguel:data'` |
| CartaAplicada | `'prestige:carta:data'` |
| QuitacaoFinanciamento | `'prestige:quitacao:data'` |
| SimuladorLance | `'prestige:simulador:data'` |

### Como integrar em cada ferramenta

**Padrão para ferramentas que usam `useConsorcioInputData`** (QuickCalc, CartaAplicada):

O hook `useConsorcioInputData` usa `useState` internamente. Para persistir, modificar o hook para aceitar uma opção `persistKey?` (ou criar um wrapper).

Alternativa mais simples: em cada ferramenta, adicionar um `useEffect` que salva `data` no localStorage sempre que muda, e um `useState` inicializado com `localStorage.getItem` ou o valor padrão.

**Padrão para ferramentas com `useState<Data>` direto** (CalculadoraLance, CompraeConstrucao, etc.):

Substituir:
```tsx
const [data, setData] = useState<Data>({ ... defaults ... });
```
Por:
```tsx
const [data, setData] = usePersistedState<Data>('prestige:lance:data', { ... defaults ... });
```

**Para SimuladorLance** (2 estados separados):
```tsx
const [valorCredito, setValorCredito] = usePersistedState('prestige:simulador:valorCredito', 1000000);
const [mesesEmDia, setMesesEmDia] = usePersistedState('prestige:simulador:mesesEmDia', 0);
```

### Não persistir estados de UI
- `step` (passo atual da ferramenta) — NÃO persistir, sempre iniciar no step 1
- `venderComLucro`, `compararFinanciamento`, `temPoupanca` — NÃO persistir
- Apenas `data` (os inputs numéricos) deve ser persistido

### Indicador visual (opcional mas recomendado)
Se `localStorage` continha dados ao abrir a ferramenta, mostrar uma badge discreta:
```tsx
{carregouSalvo && (
  <span className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
    ↩ Última simulação restaurada
  </span>
)}
```
Usar `useMemo` ou checar no `useState` initializer se o valor veio do localStorage.

---

## Feature 7 — Calculadora de Comissão do Vendedor

### O que fazer
Criar nova ferramenta `src/tools/ComissaoVendedor.tsx` acessível via um botão discreto no PurposeScreen (área de rodapé, não no grid principal — é uso interno).

### Interface

**Inputs:**
- Valor do Crédito (BRLInput)
- % Comissão da administradora (default: 1.0%, slider 0.5%–3%)
- Parcelas: Pagamento à vista ou parcelado em N vezes (select: 1, 2, 3, 4x)
- Meta mensal do vendedor (BRLInput, opcional)

**Outputs calculados:**
- Comissão bruta = `valorCredito × (percentComissao / 100)`
- Comissão líquida = `comissaoBruta × 0.7` (desconto de 30% para impostos/ajustes — configurável)
- Parcela recebida = `comissaoLiquida / numeroParcelas`
- Quantas vendas para bater a meta = `Math.ceil(meta / comissaoLiquida)`

**Cálculos TypeScript** (adicionar em `src/lib/calculations.ts`):
```ts
export interface ComissaoData {
  valorCredito: number;
  percentComissao: number;  // % (ex: 1.0 para 1%)
  numeroParcelas: number;   // 1, 2, 3 ou 4
  descontoPercent: number;  // default: 30 (impostos etc.)
  meta: number;             // meta mensal em R$ (0 = não usar)
}

export interface ComissaoResults {
  comissaoBruta: number;
  comissaoLiquida: number;
  parcelaRecebida: number;
  vendasParaMeta: number | null;  // null se meta === 0
}

export function calculateComissao(data: ComissaoData): ComissaoResults {
  const comissaoBruta = valorCredito * (percentComissao / 100);
  const comissaoLiquida = comissaoBruta * (1 - descontoPercent / 100);
  const parcelaRecebida = comissaoLiquida / numeroParcelas;
  const vendasParaMeta = meta > 0 ? Math.ceil(meta / comissaoLiquida) : null;
  return { comissaoBruta, comissaoLiquida, parcelaRecebida, vendasParaMeta };
}
```

**Layout:** single-page (sem steps), duas colunas no iPad.

**Design:** usar `var(--alert)` (vermelho) como cor acento em vez de `--gold`, para diferenciar visualmente de ferramenta de cliente — é modo interno.

**Acesso:** no `PurposeScreen.tsx`, adicionar link discreto no rodapé:
```tsx
<button
  onClick={() => onSelect('comissao')}
  className="text-[11px] font-semibold flex items-center gap-1.5"
  style={{ color: 'rgba(247,248,253,0.25)' }}
>
  <Calculator size={11} /> Minha comissão
</button>
```

**App.tsx:** adicionar `'comissao'` ao tipo `View`, renderizar `<ComissaoVendedor onBack={() => setView('purpose')} />`.

**ShareButton:** não adicionar na ComissaoVendedor (uso interno, não se compartilha com cliente).

---

## Restrições Globais para Todas as Features

1. **iPad-first:** todos os novos elementos têm `minHeight` ≥ 56px se forem botões ou inputs táteis
2. **Sem quebra de features existentes:** os 8 ShareButtons e todos os steps existentes devem continuar funcionando
3. **TypeScript strict:** sem `any`, sem `@ts-ignore`
4. **`npm run build` deve passar sem erros** após cada feature
5. **`npm run test` não deve ter regressões** (67 testes existentes devem continuar passando)
6. **Animações:** usar `AnimatePresence` + `motion.div` com `initial={{ opacity: 0, height: 0 }}` para painéis que expandem
7. **Padrão de imports:** primeiro React/hooks, depois libs externas, depois componentes internos, depois lib/calculations
8. **Sem comentários óbvios:** não comentar o que o código já diz
9. **Commits atômicos:** 1 commit por feature ou por arquivo principal modificado

---

## Ordem de Implementação Recomendada

1. **Feature 6** (localStorage) — menor risco, afeta todos os arquivos mas de forma isolada
2. **Feature 3** (poupança/carro na Expressa) — adiciona state + card novo no QuickCalc
3. **Feature 5** (comparador financiamento na Expressa) — adiciona toggle + painel + função calculations
4. **Feature 2** (comparação side-by-side Lance) — mais complexo, afeta Step3 da CalculadoraLance
5. **Feature 4** (diagnóstico) — nova tela + novo card no hub
6. **Feature 7** (comissão) — nova ferramenta isolada
