# Design Spec — Compartilhamento WhatsApp em Todas as Ferramentas

**Data:** 2026-04-29  
**Feature:** #1 (prioridade 🔴 Alta)  
**Status:** Aprovado pelo usuário

---

## Contexto

A calculadora é usada por vendedores de consórcio ao vivo em reuniões com clientes, principalmente em **iPad**. Ao final da simulação, o vendedor precisa enviar um resumo dos números para o cliente via WhatsApp antes de encerrar o encontro. Sem isso, o cliente esquece os valores e a venda esfria.

Hoje **nenhuma** ferramenta possui compartilhamento. O objetivo é adicionar um botão de compartilhamento na tela de resultados de todas as 8 ferramentas.

---

## Arquitetura (Opção A aprovada)

### Novos arquivos

**`src/lib/whatsapp.ts`**  
Funções puras de composição de mensagem, uma por ferramenta:

```
buildQuickCalcMsg(data: QuickCalcData, results: QuickCalcResults): string
buildLanceMsg(inputs, results): string
buildCompraConstrucaoMsg(data: SimData, results: SimResults): string
buildVendaCartaMsg(data: VendaCartaData, results: VendaCartaResults): string
buildAluguelMsg(data: AluguelData, results: AluguelResults): string
buildCartaAplicadaMsg(data: CartaAplicadaData, results: CartaAplicadaResults): string
buildQuitacaoMsg(data: QuitacaoData, results: QuitacaoResults): string
buildSimuladorLanceMsg(inputs, results): string
openWhatsApp(message: string): void   // navigator.share + fallback wa.me
```

Todas as funções retornam `string`. Nenhuma tem efeitos colaterais.

**`src/components/ShareButton.tsx`**  
Componente React standalone — não vai para `shared.tsx` (que já tem 155 linhas e é de primitivos genéricos).

### Modificações

Cada uma das 8 ferramentas: importa `ShareButton` + a função `build*Msg` correspondente, adiciona o botão na tela/step de resultados.

### Fluxo de dados

```
Tool renders results
  → build*Msg(inputs, results) → string WhatsApp-formatted
  → <ShareButton message={msg} />
    → tap → openWhatsApp(msg)
      → iOS/iPadOS: navigator.share({ text: msg })  [share sheet nativo]
      → outros:    window.open('https://wa.me/?text=' + encodeURIComponent(msg))
```

---

## Componente `ShareButton`

### Props

```ts
interface ShareButtonProps {
  message: string;
  label?: string; // default: "Compartilhar Simulação"
}
```

### Comportamento

- Desabilitado se `message === ''`
- iOS/iPadOS detectado via `navigator.share` (feature detection, não UA sniff)
- Após toque: animação de sucesso (ícone ✓ por 1.5s), depois volta ao estado normal
- Sem loading state — `navigator.share` e `window.open` são síncronos na percepção do usuário

### Design (alinhado ao tema dark/gold do app)

- Botão full-width, altura mínima **56px** (toque confortável em iPad com dedos)
- Fundo: `rgba(37, 211, 102, 0.12)` — verde WhatsApp suave no dark
- Borda: `1px solid rgba(37, 211, 102, 0.35)`
- Texto e ícone: `#25D366` (verde WhatsApp)
- Hover/active: borda e fundo ficam mais opacos (0.25 / 0.20)
- Animação de tap: `scale(0.97)` com `transition: 150ms`
- Estado de sucesso: ícone muda para `CheckCircle2` (lucide), cor vira `var(--gold)` por 1.5s
- Posição: última ação da tela de resultados, acima do botão "Voltar"

```tsx
// Estrutura visual
<button className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 ...">
  <WhatsappIcon size={20} />
  <span className="font-bold text-sm tracking-wide">Compartilhar Simulação</span>
</button>
```

O ícone do WhatsApp vem de um SVG inline (lucide não tem `WhatsApp`) — SVG simples do logo oficial.

---

## Formato das Mensagens

### Regras de formatação WhatsApp
- `*texto*` → negrito
- `_texto_` → itálico  
- Emojis para separação visual (não excessivo)
- Máximo ~10 linhas — legível em preview de notificação

### Template padrão
```
*[NOME DA FERRAMENTA]*
━━━━━━━━━━━━━━
[campos principais]
━━━━━━━━━━━━━━
_Simulação Consórcio_
```

### Mensagem por ferramenta

**QuickCalc (Calculadora Expressa)**
```
*📊 Simulação de Consórcio*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Prazo: *Y meses*
Parcela: *R$ A/mês*
Total a pagar: *R$ B*
Crédito na contemplação (mês Z): *R$ C*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `valorCredito`, `prazoTotal`, `parcelaEfetivaPreContemp`, `totalComTaxa`, `mesContemplacao`, `creditoAtualizado`

---

**CalculadoraLance**
```
*🎯 Calculadora de Lance*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Lance: *Y%* (*R$ Z*)
Crédito líquido: *R$ A*
Saldo devedor pós-lance: *R$ B*
Parcela pós-contemplação: *R$ C/mês*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos dependem dos inputs e cálculo inline da CalculadoraLance (não usa `calculations.ts` centralmente — a mensagem usa o state local da ferramenta).

---

**CompraeConstrucao (Compra & Construção)**
```
*🏗️ Compra e Construção*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Prazo: *Y meses*
Investido até contemplação: *R$ A*
Lucro total estimado: *R$ B*
Rentabilidade: *C% a.m.*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `totalCredito`, `prazoTotal`, `valorInvestidoAteContemplacao`, `lucroTotal`, `rentabilidadeMensal`

---

**VendaDaCartaContemplada (Giro de Cartas)**
```
*🔄 Giro de Carta Contemplada*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Ágio: *Y%*
Desembolso total: *R$ A*
Lucro líquido: *R$ B*
Rentabilidade: *C% a.m.*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `valorCredito`, `agioPercent`, `totalDesembolsado`, `lucroLiquido`, `rentabilidadeMensal`

---

**AluguelConsorcio (Aluguel c/ Consórcio)**
```
*🏠 Aluguel com Consórcio*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Prazo: *Y meses*
Parcela (meia): *R$ A/mês*
Aluguel mensal: *R$ B*
Saldo livre: *R$ C/mês*
Patrimônio total (*N* imóveis): *R$ D*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `valorCredito`, `prazoTotal`, `meiaParcela`, `aluguelMensal`, `saldoLivreBasico`, `numOperacoes`, `patrimonioTotal`

---

**CartaAplicada (Carta Aplicada no CDI)**
```
*💰 Carta Aplicada no CDI*
━━━━━━━━━━━━━━
Crédito: *R$ X* | Prazo: *Y meses*
Parcela efetiva: *R$ A/mês*
Crédito na contemplação: *R$ B*
Saldo líquido após *Z* meses: *R$ C*
Rentabilidade: *D% a.m.*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `valorCredito`, `prazoTotal`, `parcelaEfetivaPreContemp`, `creditoNaContemplacao`, `mesAnalise`, `saldoLiquido`, `rentabilidadeMensal`

---

**QuitacaoFinanciamento (Quitação de Financiamento)**
```
*🏦 Quitação de Financiamento*
━━━━━━━━━━━━━━
Custo total no banco: *R$ A*
Custo total no consórcio: *R$ B*
Economia nominal: *R$ C*
Tempo de dívida eliminado: *X meses*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Campos: `custoTotalBanco`, `custoTotalConsorcio`, `economiaNominal`, `tempoEliminado`

---

**SimuladorLance (Simulador de Lance Ello)**
```
*🏆 Simulador de Lance Ello*
━━━━━━━━━━━━━━
Crédito: *R$ X*
[Tipo de lance selecionado/melhor]: Lance *Y%* = *R$ Z*
Crédito líquido: *R$ A*
━━━━━━━━━━━━━━
_Simulação Consórcio_
```
Depende do state local do SimuladorLance — usa o lance ativo/selecionado.

---

## Função `openWhatsApp`

```ts
export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  if (navigator.share) {
    navigator.share({ text: message }).catch(() => {
      // usuário cancelou o share sheet — não é erro
    });
  } else {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
}
```

**Por que `navigator.share` first:** No iPad, abre o share sheet nativo do iOS — o cliente pode escolher WhatsApp, Mensagens, e-mail, etc. É mais flexível e não requer que o WhatsApp Web esteja logado.

---

## Placement em cada ferramenta

| Ferramenta | Onde adicionar |
|---|---|
| QuickCalc | Após os cards de resultado (step único de output) |
| CalculadoraLance | Último step de resultado |
| CompraeConstrucao | Step 8 (final), após os cards |
| VendaDaCartaContemplada | Step 4 (resultado final) |
| AluguelConsorcio | Step 6 (resultado final) |
| CartaAplicada | Step com `saldoLiquido` visível |
| QuitacaoFinanciamento | Step de resultado com `economiaNominal` |
| SimuladorLance | Painel de resultados, junto ao lance selecionado |

---

## O que este spec NÃO cobre

- Histórico de simulações (feature #6)
- Customização da mensagem pelo vendedor (fora do escopo desta feature)
- Analytics de compartilhamentos

---

## Critérios de sucesso

1. Botão aparece na tela de resultados de todas as 8 ferramentas
2. No iPad: abre o share sheet nativo iOS
3. No desktop/Android: abre `wa.me` em nova aba
4. Mensagem está pré-preenchida com os números corretos da simulação atual
5. Botão desabilitado se a simulação ainda não foi calculada
6. Sem quebra nos flows existentes de nenhuma ferramenta
