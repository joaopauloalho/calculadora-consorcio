# Atacado Imobiliário — Design Spec

**Data:** 2026-05-05  
**Status:** Aprovado

---

## Contexto

Ferramenta destinada a imobiliárias que compram cartas de consórcio em atacado como investimento. A imobiliária paga a meia parcela até a contemplação e, ao vender um imóvel, oferece ao cliente comprar o crédito contemplado em vez de financiar pelo banco. O cliente paga uma entrada (% do crédito atualizado) e assume as parcelas cheias do consórcio, alienando o imóvel.

---

## Constantes Fixas

Iguais às demais ferramentas do projeto:

- **Prazo total:** 220 meses
- **Taxa de administração:** 23%
- **INCC:** 4.57% a.a. (INCC_MEDIO_HISTORICO, discreto a cada 12 meses)

---

## Arquitetura

### Novo arquivo
`src/tools/AtacadoImobiliario.tsx`

### Integração no App
- Nova view `'atacado'` em `App.tsx` (mesmo padrão do `'comissao'`)
- Novo botão de acesso no `PurposeScreen`
- Sem passagem pelo `MatrixScreen`

---

## Estrutura da Página

### 1. Nav (sticky top)
- Botão Voltar (ChevronLeft)
- Ícone + título: "Atacado **Imobiliário**"
- Sem progress dots (não é step-by-step)

### 2. Lista de Operações
- Cards verticais empilhados, um por operação
- Botão **"+ Adicionar Operação"** ao final da lista
- Mínimo: 1 operação (não pode deletar a última)

### 3. Painel Consolidado
- Logo abaixo da lista
- Soma de todas as operações

---

## Card de Operação

### Cabeçalho do card
- Label "Operação N" (N = índice + 1)
- Botão lixeira (Trash2) no canto direito — oculto se só há 1 operação

### Inputs
| Campo | Tipo | Observação |
|---|---|---|
| Valor da Carta | BRLInput | Entrada principal |
| Meia Parcela | Texto (read-only) | Calculado: `(carta × 1.23) / 220 / 2` |
| Mês de Contemplação | Slider (1–220) | Default: 30 |
| % de Venda do Crédito | Input numérico | Ex: 42 (significa 42%) |

### Outputs calculados
| Campo | Fórmula |
|---|---|
| Valor Pago pela Imob | `meia parcela × mês contemplação` |
| Crédito Atualizado | `aplicarReajusteINCC(carta, 4.57, mês)` |
| Venda ao Consumidor | `crédito atualizado × (% / 100)` |
| Lucro da Operação | `venda consumidor − valor pago` |

---

## Painel Consolidado

Bloco com fundo escuro e borda dourada exibindo 3 métricas:

| Métrica | Cálculo |
|---|---|
| Total de Parcelas Mensais | `Σ meia parcela` de todas as operações |
| Total de Crédito em Carteira | `Σ valor carta` de todas as operações |
| Lucro Total das Operações | `Σ lucro operação` de todas as operações |
| Retorno Médio Mensal | `média( lucro / valorPago / mesContemplacao × 100 )` por operação, em % a.m. |

---

## Estado

```ts
interface Operacao {
  id: string;           // uuid para key do React
  valorCarta: number;
  mesContemplacao: number;  // default 30
  percentVenda: number;     // default 42
}
```

Estado principal: `Operacao[]` — sem persistência (ferramenta de apresentação ao vivo).

---

## Lógica de Cálculo (por operação)

```ts
const TAX_ADM = 0.23;
const PRAZO = 220;

const meiaParcela = (valorCarta * (1 + TAX_ADM)) / PRAZO / 2;
const valorPago = meiaParcela * mesContemplacao;
const creditoAtualizado = aplicarReajusteINCC(valorCarta, INCC_MEDIO_HISTORICO, mesContemplacao);
const vendaConsumidor = creditoAtualizado * (percentVenda / 100);
const lucro = vendaConsumidor - valorPago;
```

---

## Visual

Segue o design system existente:
- Fundo: `var(--bg-black)` / `var(--bg-card)`
- Outputs: StatCards com `var(--gold)`
- Lucro positivo: `#00C864` / negativo: `var(--alert)`
- Tipografia: Montserrat nos números grandes
- Componentes: `BRLInput`, `StatCard`, `Label` de `shared.tsx`
