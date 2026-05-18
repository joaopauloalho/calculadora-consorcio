# Design: Portal de Consulta de Carta Contemplada

**Data:** 2026-05-18
**Projeto:** calculadora-consorcio (Prestige Investimentos e Alavancagem)
**Status:** Aprovado para implementação

---

## 1. Visão Geral

Sistema de dois ambientes no mesmo repositório Vite/React:

| Ambiente | Rota | Usuário | Função |
|----------|------|---------|--------|
| Portal do Cliente | `/cartas` | Clientes autenticados | Buscar, filtrar, reservar e solicitar cartas contempladas |
| Painel Admin | `/` (cockpit existente + nova seção) | Vendedores Prestige autenticados | Cadastrar cartas, gerenciar reservas, ver solicitações |

Banco de dados e autenticação via **Supabase**. O cockpit existente permanece intacto — o admin de cartas é um novo card/rota dentro dele.

---

## 2. Decisões de Design (Visual Companion)

| Decisão | Escolha |
|---------|---------|
| Identidade visual do portal | **Dark Premium** — mesmo DNA verde-escuro + dourado do cockpit |
| Layout da listagem | **Grid de Cards** — 2 colunas, botão "Reservar" em cada card |
| Detalhe da carta | **Modal Centralizado** — pop-up sobre a lista, fundo escurecido |

---

## 3. Banco de Dados (Supabase)

### 3.1 Tabelas

#### `cartas_contempladas`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at        timestamptz DEFAULT now()
created_by        uuid REFERENCES auth.users(id)
tipo              text CHECK (tipo IN ('imovel', 'veicular'))
valor_credito     numeric(12,2) NOT NULL
percentual_compra numeric(5,2) NOT NULL
valor_compra      numeric(12,2) GENERATED ALWAYS AS (valor_credito * percentual_compra / 100) STORED
prazo_restante    integer NOT NULL
parcela_mensal    numeric(10,2)
administradora    text NOT NULL
descricao         text
status            text DEFAULT 'disponivel' CHECK (status IN ('disponivel','reservada','vendida'))
```

#### `clientes`
```sql
id         uuid PRIMARY KEY REFERENCES auth.users(id)
created_at timestamptz DEFAULT now()
nome       text NOT NULL
telefone   text
```

#### `reservas`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at  timestamptz DEFAULT now()
carta_id    uuid REFERENCES cartas_contempladas(id) ON DELETE CASCADE
cliente_id  uuid REFERENCES clientes(id)
mensagem    text
status      text DEFAULT 'pendente' CHECK (status IN ('pendente','aprovada','recusada'))
```

#### `solicitacoes`
```sql
id                 uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at         timestamptz DEFAULT now()
cliente_id         uuid REFERENCES clientes(id)
tipo               text CHECK (tipo IN ('imovel','veicular','ambos'))
valor_credito_min  numeric(12,2)
valor_credito_max  numeric(12,2)
percentual_maximo  numeric(5,2)
prazo_maximo       integer
observacoes        text
status             text DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','atendida'))
```

### 3.2 Row Level Security (RLS)

- **`cartas_contempladas`:** SELECT público para `status='disponivel'`; INSERT/UPDATE/DELETE apenas para `app_metadata.role = 'admin'`
- **`clientes`:** cada cliente acessa apenas `id = auth.uid()`; admins acessam todos
- **`reservas`:** cliente vê `cliente_id = auth.uid()`; admins veem todas e atualizam status
- **`solicitacoes`:** cliente vê `cliente_id = auth.uid()`; admins veem todas

### 3.3 Roles de Autenticação

- **Admin:** usuário Supabase com `app_metadata.role = 'admin'` (setado no Supabase Dashboard)
- **Cliente:** usuário Supabase padrão; ao primeiro login cria registro em `clientes`

---

## 4. Autenticação

### Fluxo Admin (cockpit)
1. Acessa `/` — se não autenticado, tela de login sobreposta
2. Login email + senha via `supabase.auth.signInWithPassword`
3. Verifica `app_metadata.role === 'admin'`; se não, redireciona para `/cartas`
4. Sessão persiste via `supabase.auth.getSession()`

### Fluxo Cliente (portal)
1. Acessa `/cartas` — se não autenticado, mostra `ClienteAuthScreen`
2. **Cadastro:** email + senha → cria conta + insere em `clientes` (nome, telefone)
3. **Login:** email + senha → vai para listagem
4. Sessão persiste via `supabase.auth.getSession()`

---

## 5. Roteamento (React Router v6)

```
/                   → Cockpit (existente) — requer role admin
/admin/cartas       → Painel admin de cartas — requer role admin
/cartas             → Portal cliente: listagem — requer auth cliente
/cartas/dashboard   → Dashboard cliente: reservas + solicitações
```

Componente `<ProtectedRoute role="admin">` e `<ProtectedRoute role="cliente">` para guardar as rotas.

---

## 6. Portal do Cliente (`/cartas`)

### 6.1 Tela de Login/Cadastro (`ClienteAuthScreen`)

Tela escura full-screen com logo Prestige centralizado. Card central com dois estados: `login` e `register`.

**Estado login:** email + senha + "Entrar" + link "Criar conta"
**Estado register:** nome + telefone + email + senha + "Criar conta" + link "Já tenho conta"

### 6.2 Listagem de Cartas (`CartasPortalPage`)

**Header:** logo Prestige | "Minha Área" | botão logout

**Filtros (chips/selects acima do grid):**
- Tipo: Todos / Imóvel / Veicular
- Valor do crédito: range em R$ (min e max)
- % máximo de compra: slider 0–60%
- Prazo máximo: slider em meses

**Grid 2 colunas de `CartaCard`:**
```
[badge: IMÓVEL]

R$ 280.000
crédito disponível

[chip: 48 meses]  [chip: Caixa]

36% = R$ 100.800          ← dourado

[botão: Reservar]
```

**Botão flutuante inferior:** "Não encontrou? Solicitar carta" → abre `SolicitacaoModal`

### 6.3 Modal de Detalhe/Reserva (`CartaModal`)

Pop-up centralizado, backdrop verde-escuro semi-opaco com blur.

```
[✕ fechar]                    [badge tipo]

R$ 280.000
Entrada: R$ 100.800 (36% do crédito)

┌─────────────────┬──────────────────┐
│ Prazo restante  │  Parcela mensal  │
│   48 meses      │    R$ 1.240      │
├─────────────────┼──────────────────┤
│ Administradora  │  % do crédito    │
│   Caixa         │    36%           │
└─────────────────┴──────────────────┘

[descrição se houver]

Mensagem / proposta (opcional):
[textarea]

[botão dourado: Confirmar Reserva]
```

Ao confirmar: INSERT em `reservas` → toast "Reserva enviada! Entraremos em contato." → fecha modal.

### 6.4 Modal de Solicitação (`SolicitacaoModal`)

```
Tipo desejado:  [Imóvel]  [Veicular]  [Ambos]

Valor do crédito:  de R$______  até R$______
% máximo que posso pagar: ______%
Prazo máximo restante: ______ meses

Observações:
[textarea]

[botão: Enviar Solicitação]
```

Ao enviar: INSERT em `solicitacoes` → toast de confirmação.

### 6.5 Dashboard do Cliente (`ClienteDashboardPage`)

Acessível via "Minha Área" no header.

**Seções:**
1. **Minhas Reservas** — cards com status badge (pendente/aprovada/recusada) + detalhes da carta associada
2. **Minhas Solicitações** — lista com os parâmetros enviados + status atual
3. Link "Voltar para cartas"

---

## 7. Painel Admin (`/admin/cartas`)

Novo card na `PurposeScreen` do cockpit: **"Gestão de Cartas"** (visível apenas para admins). Navega para `/admin/cartas`.

### 7.1 `AdminCartasPage`

**Header:** tabs [Cartas] [Reservas ●] [Solicitações] + botão "Nova Carta"

**Tab Cartas:** lista de todas as cartas
```
Tipo | Crédito | % | Valor compra | Prazo | Admin. | Status | [Editar] [Vender] [Excluir]
```

**Tab Reservas:** lista de reservas pendentes first
```
Cliente (nome + tel) | Carta | Mensagem | Status | [Aprovar] [Recusar]
```
Ao aprovar: `reservas.status = 'aprovada'` + `cartas_contempladas.status = 'reservada'`

**Tab Solicitações:** lista com parâmetros que o cliente busca. Admin atualiza status manualmente.

### 7.2 `CartaForm` (modal ou inline)

```
Tipo:            [Imóvel] [Veicular]
Valor do crédito: R$______
% de compra:      ______%   → Valor: R$______ (calculado)
Prazo restante:   ______ meses
Parcela mensal:   R$______
Administradora:   [input]
Descrição:        [textarea opcional]
Status:           [Disponível] [Reservada] [Vendida]

[Cancelar]  [Salvar]
```

---

## 8. Estrutura de Arquivos

```
src/
  lib/
    supabase.ts              ← createClient com VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
    supabaseTypes.ts         ← tipos TypeScript gerados das tabelas
  hooks/
    useAuth.ts               ← session, user, role, signIn, signOut
    useCartas.ts             ← fetchCartas(filtros), createCarta, updateCarta, deleteCarta
    useReservas.ts           ← createReserva, fetchReservas, updateReservaStatus
    useSolicitacoes.ts       ← createSolicitacao, fetchSolicitacoes, updateSolicitacaoStatus
  components/
    ProtectedRoute.tsx       ← verifica auth + role, redireciona se necessário
    CartaCard.tsx            ← card do grid no portal cliente
    CartaModal.tsx           ← modal detalhe + form de reserva
    SolicitacaoModal.tsx     ← modal formulário de solicitação
    CartaForm.tsx            ← formulário admin create/edit
  pages/
    cartas/
      ClienteAuthScreen.tsx  ← login + cadastro cliente
      CartasPortalPage.tsx   ← listagem + filtros + grid
      ClienteDashboardPage.tsx ← minhas reservas + solicitações
    admin/
      AdminCartasPage.tsx    ← tabs: cartas, reservas, solicitações
  App.tsx                    ← adiciona BrowserRouter + rotas /cartas e /admin/cartas
```

---

## 9. Dependências a Adicionar

```bash
npm install react-router-dom @supabase/supabase-js
```

**Variáveis de ambiente** (`.env.local` + Vercel dashboard):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 10. Fluxo Completo de Dados

```
Admin cadastra carta
    └→ INSERT cartas_contempladas (status='disponivel')

Cliente acessa /cartas, autentica
    └→ SELECT cartas WHERE status='disponivel' + filtros

Cliente clica "Reservar" → CartaModal → confirma
    └→ INSERT reservas (status='pendente')

Admin vê badge na tab Reservas → aprova
    └→ UPDATE reservas SET status='aprovada'
    └→ UPDATE cartas SET status='reservada'

Cliente vê status em /cartas/dashboard
```

---

## 11. Fora do Escopo (v1)

- Upload de imagens das cartas
- Notificações por email/WhatsApp
- Pagamentos online
- Chat entre admin e cliente
- Histórico de alterações de preço

---

## 12. Ordem de Implementação Sugerida

1. **Setup:** instalar dependências, configurar Supabase client, variáveis de ambiente
2. **Banco:** criar migration Supabase com as 4 tabelas + RLS
3. **Auth hooks:** `useAuth.ts` com session, signIn, signOut, role
4. **Roteamento:** adicionar React Router, `ProtectedRoute`, rotas `/cartas` e `/admin/cartas`
5. **Portal cliente:** `ClienteAuthScreen` → `CartasPortalPage` → `CartaModal` → `SolicitacaoModal` → `ClienteDashboardPage`
6. **Admin:** card na PurposeScreen → `AdminCartasPage` (tabs) → `CartaForm`
7. **Deploy:** variáveis de ambiente no Vercel + commit + push
