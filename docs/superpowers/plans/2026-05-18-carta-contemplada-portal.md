# Carta Contemplada Portal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-environment system — a dark-premium client portal at `/cartas` where authenticated clients browse and reserve cartas contempladas, plus an admin panel at `/admin/cartas` inside the existing cockpit where Prestige vendors create cartas and manage reservations, all backed by Supabase auth + database.

**Architecture:** React Router v6 wraps the existing App in a BrowserRouter; the current cockpit logic is extracted into a `CockpitApp` component and mounted at `/`; two new route trees (`/cartas/*` and `/admin/cartas`) live alongside it. Supabase handles auth for both environments via a shared `useAuth` hook that reads role from a `profiles` table.

**Tech Stack:** React 18 + TypeScript + Vite, React Router v6, @supabase/supabase-js, Tailwind CSS, shadcn/ui, Vitest, Sonner toasts

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/supabase.ts` | Create | Supabase client singleton |
| `src/lib/supabaseTypes.ts` | Create | TypeScript interfaces for all DB tables |
| `src/lib/cartaUtils.ts` | Create | Pure formatting/calculation helpers |
| `src/lib/cartaUtils.test.ts` | Create | Vitest unit tests for cartaUtils |
| `src/hooks/useAuth.ts` | Create | Session, user, role, signIn, signOut, signUp |
| `src/hooks/useCartas.ts` | Create | fetchCartas(filtros), admin CRUD |
| `src/hooks/useReservas.ts` | Create | createReserva, fetchReservas, updateReservaStatus |
| `src/hooks/useSolicitacoes.ts` | Create | createSolicitacao, fetchSolicitacoes, updateStatus |
| `src/components/ProtectedRoute.tsx` | Create | Guards routes by auth + role |
| `src/components/CartaCard.tsx` | Create | Card in the client portal grid |
| `src/components/CartaModal.tsx` | Create | Modal detail + reserva form |
| `src/components/SolicitacaoModal.tsx` | Create | Solicitação form modal |
| `src/components/CartaForm.tsx` | Create | Admin create/edit carta form |
| `src/pages/cartas/ClienteAuthScreen.tsx` | Create | Login + cadastro for clients |
| `src/pages/cartas/CartasPortalPage.tsx` | Create | Listing + filters + grid |
| `src/pages/cartas/ClienteDashboardPage.tsx` | Create | Client's reservas + solicitações |
| `src/pages/admin/AdminCartasPage.tsx` | Create | Admin tabs: cartas, reservas, solicitações |
| `src/App.tsx` | Modify | Wrap in BrowserRouter + add routes |
| `src/screens/PurposeScreen.tsx` | Modify | Add hidden "Gestão de Cartas" link for admins |
| `.env.local` | Create | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY |

---

### Task 1: Install Dependencies + Configure Supabase Client

**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Install npm packages**

```bash
npm install react-router-dom @supabase/supabase-js
```

Expected output: packages added to `node_modules` with no errors.

- [ ] **Step 2: Create `.env.local`**

Go to your Supabase project → Settings → API and copy the project URL and anon key.

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...YOUR-ANON-KEY
```

- [ ] **Step 3: Create `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite starts without TypeScript errors about missing env vars.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts .env.local
git commit -m "feat: add supabase client and env config"
```

---

### Task 2: TypeScript Types + Utility Helpers

**Files:**
- Create: `src/lib/supabaseTypes.ts`
- Create: `src/lib/cartaUtils.ts`
- Create: `src/lib/cartaUtils.test.ts`

- [ ] **Step 1: Write failing tests for cartaUtils**

Create `src/lib/cartaUtils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calcValorCompra,
  labelTipo,
  labelStatus,
  labelStatusReserva,
  labelStatusSolicitacao,
} from './cartaUtils';

describe('formatCurrency', () => {
  it('formats number as BRL', () => {
    expect(formatCurrency(280000)).toBe('R$ 280.000,00');
  });
});

describe('calcValorCompra', () => {
  it('calculates percentual of credito', () => {
    expect(calcValorCompra(280000, 36)).toBe(100800);
  });
  it('rounds to 2 decimal places', () => {
    expect(calcValorCompra(100000, 33.33)).toBe(33330);
  });
});

describe('labelTipo', () => {
  it('returns Imóvel for imovel', () => {
    expect(labelTipo('imovel')).toBe('Imóvel');
  });
  it('returns Veicular for veicular', () => {
    expect(labelTipo('veicular')).toBe('Veicular');
  });
});

describe('labelStatus', () => {
  it('maps disponivel', () => expect(labelStatus('disponivel')).toBe('Disponível'));
  it('maps reservada', () => expect(labelStatus('reservada')).toBe('Reservada'));
  it('maps vendida', () => expect(labelStatus('vendida')).toBe('Vendida'));
});

describe('labelStatusReserva', () => {
  it('maps pendente', () => expect(labelStatusReserva('pendente')).toBe('Pendente'));
  it('maps aprovada', () => expect(labelStatusReserva('aprovada')).toBe('Aprovada'));
  it('maps recusada', () => expect(labelStatusReserva('recusada')).toBe('Recusada'));
});

describe('labelStatusSolicitacao', () => {
  it('maps pendente', () => expect(labelStatusSolicitacao('pendente')).toBe('Pendente'));
  it('maps em_analise', () => expect(labelStatusSolicitacao('em_analise')).toBe('Em Análise'));
  it('maps atendida', () => expect(labelStatusSolicitacao('atendida')).toBe('Atendida'));
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- cartaUtils
```

Expected: FAIL — module `cartaUtils` not found.

- [ ] **Step 3: Create `src/lib/supabaseTypes.ts`**

```typescript
export interface CartaContemplada {
  id: string;
  created_at: string;
  created_by: string | null;
  tipo: 'imovel' | 'veicular';
  valor_credito: number;
  percentual_compra: number;
  valor_compra: number;
  prazo_restante: number;
  parcela_mensal: number | null;
  administradora: string;
  descricao: string | null;
  status: 'disponivel' | 'reservada' | 'vendida';
}

export interface Cliente {
  id: string;
  created_at: string;
  nome: string;
  telefone: string | null;
}

export interface Profile {
  id: string;
  role: 'admin' | 'cliente';
}

export interface Reserva {
  id: string;
  created_at: string;
  carta_id: string;
  cliente_id: string;
  mensagem: string | null;
  status: 'pendente' | 'aprovada' | 'recusada';
  cartas_contempladas?: CartaContemplada;
  clientes?: Cliente;
}

export interface Solicitacao {
  id: string;
  created_at: string;
  cliente_id: string;
  tipo: 'imovel' | 'veicular' | 'ambos';
  valor_credito_min: number | null;
  valor_credito_max: number | null;
  percentual_maximo: number | null;
  prazo_maximo: number | null;
  observacoes: string | null;
  status: 'pendente' | 'em_analise' | 'atendida';
  clientes?: Cliente;
}

export interface CartaFiltros {
  tipo?: 'imovel' | 'veicular';
  valorCreditoMin?: number;
  valorCreditoMax?: number;
  percentualMaximo?: number;
  prazoMaximo?: number;
}
```

- [ ] **Step 4: Create `src/lib/cartaUtils.ts`**

```typescript
import type { CartaContemplada, Reserva, Solicitacao } from './supabaseTypes';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcValorCompra(credito: number, percentual: number): number {
  return Math.round(credito * percentual / 100 * 100) / 100;
}

export function labelTipo(tipo: CartaContemplada['tipo']): string {
  return tipo === 'imovel' ? 'Imóvel' : 'Veicular';
}

export function labelStatus(status: CartaContemplada['status']): string {
  const map: Record<CartaContemplada['status'], string> = {
    disponivel: 'Disponível',
    reservada: 'Reservada',
    vendida: 'Vendida',
  };
  return map[status];
}

export function labelStatusReserva(status: Reserva['status']): string {
  const map: Record<Reserva['status'], string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    recusada: 'Recusada',
  };
  return map[status];
}

export function labelStatusSolicitacao(status: Solicitacao['status']): string {
  const map: Record<Solicitacao['status'], string> = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    atendida: 'Atendida',
  };
  return map[status];
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test -- cartaUtils
```

Expected: all 10 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabaseTypes.ts src/lib/cartaUtils.ts src/lib/cartaUtils.test.ts
git commit -m "feat: add supabase types and carta utility helpers"
```

---

### Task 3: Supabase Database Migration

**Files:** Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

- [ ] **Step 1: Create tables + RLS**

Paste and run this SQL in the Supabase SQL Editor:

```sql
-- profiles table (stores role, auto-created on signup)
CREATE TABLE IF NOT EXISTS profiles (
  id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- helper function used in RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (new.id, 'cliente')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- cartas_contempladas
CREATE TABLE IF NOT EXISTS cartas_contempladas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES auth.users(id),
  tipo              text NOT NULL CHECK (tipo IN ('imovel', 'veicular')),
  valor_credito     numeric(12,2) NOT NULL,
  percentual_compra numeric(5,2) NOT NULL,
  valor_compra      numeric(12,2) GENERATED ALWAYS AS (valor_credito * percentual_compra / 100) STORED,
  prazo_restante    integer NOT NULL,
  parcela_mensal    numeric(10,2),
  administradora    text NOT NULL,
  descricao         text,
  status            text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','reservada','vendida'))
);

ALTER TABLE cartas_contempladas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read disponivel cartas"
  ON cartas_contempladas FOR SELECT
  USING (status = 'disponivel' OR is_admin());
CREATE POLICY "Admins can insert cartas"
  ON cartas_contempladas FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update cartas"
  ON cartas_contempladas FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete cartas"
  ON cartas_contempladas FOR DELETE USING (is_admin());

-- clientes
CREATE TABLE IF NOT EXISTS clientes (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  nome       text NOT NULL,
  telefone   text
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own record"  ON clientes FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Clients insert own record" ON clientes FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Clients update own record" ON clientes FOR UPDATE USING (auth.uid() = id);

-- reservas
CREATE TABLE IF NOT EXISTS reservas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  carta_id    uuid NOT NULL REFERENCES cartas_contempladas(id) ON DELETE CASCADE,
  cliente_id  uuid NOT NULL REFERENCES clientes(id),
  mensagem    text,
  status      text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovada','recusada'))
);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own reservas"
  ON reservas FOR SELECT USING (cliente_id = auth.uid() OR is_admin());
CREATE POLICY "Clients insert own reservas"
  ON reservas FOR INSERT WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Admins update reservas"
  ON reservas FOR UPDATE USING (is_admin());

-- solicitacoes
CREATE TABLE IF NOT EXISTS solicitacoes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz DEFAULT now(),
  cliente_id         uuid NOT NULL REFERENCES clientes(id),
  tipo               text NOT NULL CHECK (tipo IN ('imovel','veicular','ambos')),
  valor_credito_min  numeric(12,2),
  valor_credito_max  numeric(12,2),
  percentual_maximo  numeric(5,2),
  prazo_maximo       integer,
  observacoes        text,
  status             text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','atendida'))
);

ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own solicitacoes"
  ON solicitacoes FOR SELECT USING (cliente_id = auth.uid() OR is_admin());
CREATE POLICY "Clients insert own solicitacoes"
  ON solicitacoes FOR INSERT WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Admins update solicitacoes"
  ON solicitacoes FOR UPDATE USING (is_admin());
```

- [ ] **Step 2: Promote an admin user**

After creating your admin account (email/password in Supabase Auth), run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR-ADMIN-EMAIL@example.com'
);
```

- [ ] **Step 3: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected: `cartas_contempladas`, `clientes`, `profiles`, `reservas`, `solicitacoes` all appear.

- [ ] **Step 4: Commit migration record**

```bash
# Create a local record of the migration for team reference
mkdir -p supabase/migrations
```

Create `supabase/migrations/20260518_carta_contemplada.sql` with the SQL above, then:

```bash
git add supabase/migrations/20260518_carta_contemplada.sql
git commit -m "feat: add carta contemplada database migration"
```

---

### Task 4: useAuth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Create `src/hooks/useAuth.ts`**

```typescript
import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabaseTypes';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Profile['role'] | null;
  loading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) fetchRole(session.user.id);
      else setState(prev => ({ ...prev, loading: false }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) fetchRole(session.user.id);
      else setState(prev => ({ ...prev, role: null, loading: false }));
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    setState(prev => ({ ...prev, role: data?.role ?? 'cliente', loading: false }));
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp({ email, password, nome, telefone }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('clientes').insert({
        id: data.user.id,
        nome,
        telefone: telefone ?? null,
      });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { ...state, signIn, signUp, signOut };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to `useAuth.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook with role-based session management"
```

---

### Task 5: Data Hooks (useCartas, useReservas, useSolicitacoes)

**Files:**
- Create: `src/hooks/useCartas.ts`
- Create: `src/hooks/useReservas.ts`
- Create: `src/hooks/useSolicitacoes.ts`

- [ ] **Step 1: Create `src/hooks/useCartas.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CartaContemplada, CartaFiltros } from '@/lib/supabaseTypes';

export function useCartas(filtros?: CartaFiltros) {
  const [cartas, setCartas] = useState<CartaContemplada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('cartas_contempladas')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros?.valorCreditoMin) query = query.gte('valor_credito', filtros.valorCreditoMin);
    if (filtros?.valorCreditoMax) query = query.lte('valor_credito', filtros.valorCreditoMax);
    if (filtros?.percentualMaximo) query = query.lte('percentual_compra', filtros.percentualMaximo);
    if (filtros?.prazoMaximo) query = query.lte('prazo_restante', filtros.prazoMaximo);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setCartas(data ?? []);
    setLoading(false);
  }, [
    filtros?.tipo,
    filtros?.valorCreditoMin,
    filtros?.valorCreditoMax,
    filtros?.percentualMaximo,
    filtros?.prazoMaximo,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { cartas, loading, error, refetch: fetch };
}

export async function fetchAllCartasAdmin(): Promise<CartaContemplada[]> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCarta(
  carta: Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>
): Promise<CartaContemplada> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .insert(carta)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCarta(
  id: string,
  updates: Partial<Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>>
): Promise<CartaContemplada> {
  const { data, error } = await supabase
    .from('cartas_contempladas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCarta(id: string): Promise<void> {
  const { error } = await supabase.from('cartas_contempladas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 2: Create `src/hooks/useReservas.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Reserva } from '@/lib/supabaseTypes';

export function useMinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reservas')
      .select('*, cartas_contempladas(*)')
      .order('created_at', { ascending: false });
    setReservas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { reservas, loading, refetch: fetch };
}

export async function fetchTodasReservas(): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, cartas_contempladas(*), clientes(*)')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReserva(
  cartaId: string,
  mensagem: string | null
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('reservas').insert({
    carta_id: cartaId,
    cliente_id: user.id,
    mensagem,
  });
  if (error) throw new Error(error.message);
}

export async function updateReservaStatus(
  reservaId: string,
  status: 'aprovada' | 'recusada',
  cartaId?: string
): Promise<void> {
  const { error } = await supabase
    .from('reservas')
    .update({ status })
    .eq('id', reservaId);
  if (error) throw new Error(error.message);

  if (status === 'aprovada' && cartaId) {
    const { error: cartaError } = await supabase
      .from('cartas_contempladas')
      .update({ status: 'reservada' })
      .eq('id', cartaId);
    if (cartaError) throw new Error(cartaError.message);
  }
}
```

- [ ] **Step 3: Create `src/hooks/useSolicitacoes.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Solicitacao } from '@/lib/supabaseTypes';

export function useMinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('solicitacoes')
      .select('*')
      .order('created_at', { ascending: false });
    setSolicitacoes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { solicitacoes, loading, refetch: fetch };
}

export async function fetchTodasSolicitacoes(): Promise<Solicitacao[]> {
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*, clientes(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSolicitacao(
  dados: Omit<Solicitacao, 'id' | 'created_at' | 'cliente_id' | 'status'>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('solicitacoes').insert({
    ...dados,
    cliente_id: user.id,
  });
  if (error) throw new Error(error.message);
}

export async function updateSolicitacaoStatus(
  id: string,
  status: 'em_analise' | 'atendida'
): Promise<void> {
  const { error } = await supabase
    .from('solicitacoes')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors in hooks files.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCartas.ts src/hooks/useReservas.ts src/hooks/useSolicitacoes.ts
git commit -m "feat: add data hooks for cartas, reservas, and solicitacoes"
```

---

### Task 6: App.tsx Refactor — Add React Router

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create `src/components/ProtectedRoute.tsx`**

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
  role: 'admin' | 'cliente';
  redirectTo?: string;
}

export function ProtectedRoute({ children, role, redirectTo }: Props) {
  const { session, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031715] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    const fallback = role === 'admin' ? '/' : '/cartas';
    return <Navigate to={redirectTo ?? fallback} replace />;
  }

  if (role === 'admin' && userRole !== 'admin') {
    return <Navigate to="/cartas" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Read current `src/App.tsx` to understand its structure**

Read the file before modifying. It currently uses a state machine (`AppState`) with `AnimatePresence` — no router. The modification wraps everything in BrowserRouter and adds `/cartas` and `/admin/cartas` routes as siblings to the existing cockpit.

- [ ] **Step 3: Modify `src/App.tsx`**

At the top of App.tsx, add the router imports after existing imports:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ClienteAuthScreen } from '@/pages/cartas/ClienteAuthScreen';
import { CartasPortalPage } from '@/pages/cartas/CartasPortalPage';
import { ClienteDashboardPage } from '@/pages/cartas/ClienteDashboardPage';
import { AdminCartasPage } from '@/pages/admin/AdminCartasPage';
```

Rename the existing `function App()` to `function CockpitApp()` (keep all existing logic intact), then replace `export default App` with:

```typescript
function CockpitApp() {
  // ... all the existing App() body here, unchanged ...
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cartas" element={<ClienteAuthScreen />} />
        <Route
          path="/cartas/portal"
          element={
            <ProtectedRoute role="cliente">
              <CartasPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cartas/dashboard"
          element={
            <ProtectedRoute role="cliente">
              <ClienteDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cartas"
          element={
            <ProtectedRoute role="admin">
              <AdminCartasPage />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<CockpitApp />} />
      </Routes>
    </BrowserRouter>
  );
}
```

> **Note on `/cartas` route:** `ClienteAuthScreen` handles its own redirect logic — if already authenticated it sends to `/cartas/portal`.

- [ ] **Step 4: Verify dev server and existing cockpit still work**

```bash
npm run dev
```

Open `http://localhost:5173/` — cockpit must load exactly as before.
Open `http://localhost:5173/cartas` — should show auth screen (blank or placeholder is fine at this stage).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/ProtectedRoute.tsx
git commit -m "feat: add react router with protected routes for cartas portal and admin"
```

---

### Task 7: ClienteAuthScreen

**Files:**
- Create: `src/pages/cartas/ClienteAuthScreen.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p src/pages/cartas src/pages/admin
```

- [ ] **Step 2: Create `src/pages/cartas/ClienteAuthScreen.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

export function ClienteAuthScreen() {
  const { session, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    navigate('/cartas/portal', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/cartas/portal', { replace: true });
      } else {
        await signUp({ email, password, nome, telefone });
        toast.success('Conta criada! Verifique seu email para confirmar.');
        setMode('login');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao autenticar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#031715] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] font-bold text-[#C9A84C] uppercase">PRESTIGE</p>
          <p className="text-[#5EB9AA] text-sm mt-1">Cartas Contempladas</p>
        </div>

        <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl p-8">
          <h2 className="text-white font-bold text-lg mb-6">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                    className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Telefone</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl mt-2 disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
            >
              {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#5EB9AA] mt-4">
            {mode === 'login' ? (
              <>Não tem conta?{' '}
                <button onClick={() => setMode('register')} className="text-[#C9A84C] font-semibold hover:underline">
                  Criar conta
                </button>
              </>
            ) : (
              <>Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="text-[#C9A84C] font-semibold hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/cartas` — should see dark login screen with Prestige branding.

- [ ] **Step 4: Commit**

```bash
git add src/pages/cartas/ClienteAuthScreen.tsx
git commit -m "feat: add ClienteAuthScreen with login and register flows"
```

---

### Task 8: CartaCard, CartaModal, SolicitacaoModal

**Files:**
- Create: `src/components/CartaCard.tsx`
- Create: `src/components/CartaModal.tsx`
- Create: `src/components/SolicitacaoModal.tsx`

- [ ] **Step 1: Create `src/components/CartaCard.tsx`**

```typescript
import { formatCurrency, labelTipo } from '@/lib/cartaUtils';
import type { CartaContemplada } from '@/lib/supabaseTypes';

interface Props {
  carta: CartaContemplada;
  onReservar: () => void;
}

export function CartaCard({ carta, onReservar }: Props) {
  return (
    <div
      onClick={onReservar}
      className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-5 cursor-pointer hover:border-[#1a4a44] transition-colors group"
    >
      <span className="text-xs font-bold tracking-widest uppercase text-[#5EB9AA]">
        {labelTipo(carta.tipo)}
      </span>

      <p className="text-2xl font-extrabold text-white mt-1">
        {formatCurrency(carta.valor_credito)}
      </p>
      <p className="text-xs text-[#5EB9AA] mb-3">crédito disponível</p>

      <div className="flex gap-2 mb-3">
        <span className="bg-[#0d3330] text-[#5EB9AA] text-xs font-semibold px-2 py-1 rounded">
          {carta.prazo_restante} meses
        </span>
        <span className="bg-[#0d3330] text-[#5EB9AA] text-xs font-semibold px-2 py-1 rounded">
          {carta.administradora}
        </span>
      </div>

      <p className="text-sm font-bold text-[#C9A84C] mb-4">
        {carta.percentual_compra}% = {formatCurrency(carta.valor_compra)}
      </p>

      <button
        onClick={e => { e.stopPropagation(); onReservar(); }}
        className="w-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-bold py-2 rounded-lg group-hover:bg-[#C9A84C]/25 transition-colors"
      >
        Reservar
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/CartaModal.tsx`**

```typescript
import { useState } from 'react';
import { toast } from 'sonner';
import { createReserva } from '@/hooks/useReservas';
import { formatCurrency, labelTipo } from '@/lib/cartaUtils';
import type { CartaContemplada } from '@/lib/supabaseTypes';

interface Props {
  carta: CartaContemplada;
  onClose: () => void;
  onReservaFeita: () => void;
}

export function CartaModal({ carta, onClose, onReservaFeita }: Props) {
  const [mensagem, setMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleReservar() {
    setSubmitting(true);
    try {
      await createReserva(carta.id, mensagem || null);
      toast.success('Reserva enviada! Entraremos em contato.');
      onReservaFeita();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao reservar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(3,23,21,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#5EB9AA]">
            {labelTipo(carta.tipo)}
          </span>
          <button onClick={onClose} className="text-[#5EB9AA] hover:text-white text-lg">✕</button>
        </div>

        <p className="text-3xl font-extrabold text-white">{formatCurrency(carta.valor_credito)}</p>
        <p className="text-[#C9A84C] font-bold text-base mb-5">
          Entrada: {formatCurrency(carta.valor_compra)} ({carta.percentual_compra}% do crédito)
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Prazo restante', value: `${carta.prazo_restante} meses` },
            { label: 'Parcela mensal', value: carta.parcela_mensal ? formatCurrency(carta.parcela_mensal) : '—' },
            { label: 'Administradora', value: carta.administradora },
            { label: '% do crédito', value: `${carta.percentual_compra}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0d3330] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">{label}</p>
              <p className="text-sm font-bold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {carta.descricao && (
          <p className="text-sm text-[#5EB9AA] mb-4">{carta.descricao}</p>
        )}

        <div className="mb-4">
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">
            Mensagem / proposta (opcional)
          </label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            rows={3}
            className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
            placeholder="Ex: Posso pagar à vista, tenho urgência..."
          />
        </div>

        <button
          onClick={handleReservar}
          disabled={submitting}
          className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
        >
          {submitting ? 'Enviando...' : 'Confirmar Reserva'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/SolicitacaoModal.tsx`**

```typescript
import { useState } from 'react';
import { toast } from 'sonner';
import { createSolicitacao } from '@/hooks/useSolicitacoes';
import type { Solicitacao } from '@/lib/supabaseTypes';

interface Props {
  onClose: () => void;
}

type Tipo = Solicitacao['tipo'];

export function SolicitacaoModal({ onClose }: Props) {
  const [tipo, setTipo] = useState<Tipo>('imovel');
  const [valorMin, setValorMin] = useState('');
  const [valorMax, setValorMax] = useState('');
  const [percentualMaximo, setPercentualMaximo] = useState('');
  const [prazoMaximo, setPrazoMaximo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSolicitacao({
        tipo,
        valor_credito_min: valorMin ? Number(valorMin) : null,
        valor_credito_max: valorMax ? Number(valorMax) : null,
        percentual_maximo: percentualMaximo ? Number(percentualMaximo) : null,
        prazo_maximo: prazoMaximo ? Number(prazoMaximo) : null,
        observacoes: observacoes || null,
      });
      toast.success('Solicitação enviada! Entraremos em contato.');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  }

  const tipoOptions: { value: Tipo; label: string }[] = [
    { value: 'imovel', label: 'Imóvel' },
    { value: 'veicular', label: 'Veicular' },
    { value: 'ambos', label: 'Ambos' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(3,23,21,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-lg">Solicitar carta</h2>
          <button onClick={onClose} className="text-[#5EB9AA] hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Tipo desejado</label>
            <div className="flex gap-2 mt-2">
              {tipoOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipo(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tipo === opt.value
                      ? 'bg-[#C9A84C] text-[#031715]'
                      : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Crédito mín. R$</label>
              <input
                type="number"
                value={valorMin}
                onChange={e => setValorMin(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Crédito máx. R$</label>
              <input
                type="number"
                value={valorMax}
                onChange={e => setValorMax(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="999999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">% máx de compra</label>
              <input
                type="number"
                value={percentualMaximo}
                onChange={e => setPercentualMaximo(e.target.value)}
                min="0" max="100"
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Prazo máx. (meses)</label>
              <input
                type="number"
                value={prazoMaximo}
                onChange={e => setPrazoMaximo(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="Urgência, localização preferida, etc."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
          >
            {submitting ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CartaCard.tsx src/components/CartaModal.tsx src/components/SolicitacaoModal.tsx
git commit -m "feat: add CartaCard, CartaModal, and SolicitacaoModal components"
```

---

### Task 9: CartasPortalPage

**Files:**
- Create: `src/pages/cartas/CartasPortalPage.tsx`

- [ ] **Step 1: Create `src/pages/cartas/CartasPortalPage.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCartas } from '@/hooks/useCartas';
import { CartaCard } from '@/components/CartaCard';
import { CartaModal } from '@/components/CartaModal';
import { SolicitacaoModal } from '@/components/SolicitacaoModal';
import type { CartaContemplada, CartaFiltros } from '@/lib/supabaseTypes';

export function CartasPortalPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<CartaFiltros>({});
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'imovel' | 'veicular'>('todos');
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaContemplada | null>(null);
  const [showSolicitacao, setShowSolicitacao] = useState(false);

  const filtrosQuery: CartaFiltros = {
    ...filtros,
    tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
  };

  const { cartas, loading, refetch } = useCartas(filtrosQuery);

  async function handleSignOut() {
    await signOut();
    navigate('/cartas', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#031715]">
      {/* Header */}
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">PRESTIGE</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cartas/dashboard')}
            className="text-[#5EB9AA] text-sm hover:text-white transition-colors"
          >
            Minha Área
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#5EB9AA] hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 py-4 border-b border-[#0d3330] space-y-3">
        <div className="flex gap-2">
          {(['todos', 'imovel', 'veicular'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tipoFilter === t
                  ? 'bg-[#C9A84C] text-[#031715]'
                  : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'imovel' ? 'Imóvel' : 'Veicular'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Crédito mín.</label>
            <input
              type="number"
              placeholder="R$ 0"
              onChange={e => setFiltros(f => ({ ...f, valorCreditoMin: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Crédito máx.</label>
            <input
              type="number"
              placeholder="R$ 999k"
              onChange={e => setFiltros(f => ({ ...f, valorCreditoMax: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">% máx compra</label>
            <input
              type="number"
              placeholder="60"
              min="0" max="100"
              onChange={e => setFiltros(f => ({ ...f, percentualMaximo: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Prazo máx. (m)</label>
            <input
              type="number"
              placeholder="120"
              onChange={e => setFiltros(f => ({ ...f, prazoMaximo: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="p-4 pb-24">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && cartas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#5EB9AA] text-sm">Nenhuma carta encontrada com esses filtros.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {cartas.map(carta => (
            <CartaCard
              key={carta.id}
              carta={carta}
              onReservar={() => setCartaSelecionada(carta)}
            />
          ))}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={() => setShowSolicitacao(true)}
          className="bg-[#041e1b] border border-[#1a4a44] text-[#C9A84C] text-sm font-semibold px-6 py-3 rounded-full shadow-xl hover:bg-[#0d3330] transition-colors"
        >
          Não encontrou? Solicitar carta
        </button>
      </div>

      {/* Modals */}
      {cartaSelecionada && (
        <CartaModal
          carta={cartaSelecionada}
          onClose={() => setCartaSelecionada(null)}
          onReservaFeita={refetch}
        />
      )}

      {showSolicitacao && (
        <SolicitacaoModal onClose={() => setShowSolicitacao(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

Log in at `/cartas`, confirm redirect to `/cartas/portal`. Verify the grid renders (even if empty), filters work, FAB visible.

- [ ] **Step 3: Commit**

```bash
git add src/pages/cartas/CartasPortalPage.tsx
git commit -m "feat: add CartasPortalPage with filter chips, grid, and modals"
```

---

### Task 10: ClienteDashboardPage

**Files:**
- Create: `src/pages/cartas/ClienteDashboardPage.tsx`

- [ ] **Step 1: Create `src/pages/cartas/ClienteDashboardPage.tsx`**

```typescript
import { useNavigate } from 'react-router-dom';
import { useMinhasReservas } from '@/hooks/useReservas';
import { useMinhasSolicitacoes } from '@/hooks/useSolicitacoes';
import { formatCurrency, labelTipo, labelStatusReserva, labelStatusSolicitacao } from '@/lib/cartaUtils';

const reservaStatusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  aprovada: 'bg-green-500/20 text-green-400',
  recusada: 'bg-red-500/20 text-red-400',
};

const solicitacaoStatusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  em_analise: 'bg-blue-500/20 text-blue-400',
  atendida: 'bg-green-500/20 text-green-400',
};

export function ClienteDashboardPage() {
  const navigate = useNavigate();
  const { reservas, loading: rLoading } = useMinhasReservas();
  const { solicitacoes, loading: sLoading } = useMinhasSolicitacoes();

  return (
    <div className="min-h-screen bg-[#031715]">
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">PRESTIGE</p>
        <button
          onClick={() => navigate('/cartas/portal')}
          className="text-[#5EB9AA] text-sm hover:text-white transition-colors"
        >
          ← Ver cartas
        </button>
      </header>

      <main className="p-4 space-y-8">
        {/* Reservas */}
        <section>
          <h2 className="text-white font-bold text-base mb-4">Minhas Reservas</h2>
          {rLoading && <p className="text-[#5EB9AA] text-sm">Carregando...</p>}
          {!rLoading && reservas.length === 0 && (
            <p className="text-[#5EB9AA] text-sm">Nenhuma reserva ainda.</p>
          )}
          <div className="space-y-3">
            {reservas.map(r => (
              <div key={r.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                {r.cartas_contempladas && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#5EB9AA] uppercase tracking-wider">
                        {labelTipo(r.cartas_contempladas.tipo)}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {formatCurrency(r.cartas_contempladas.valor_credito)}
                      </p>
                      <p className="text-[#C9A84C] text-sm font-semibold">
                        {r.cartas_contempladas.percentual_compra}% = {formatCurrency(r.cartas_contempladas.valor_compra)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${reservaStatusColor[r.status]}`}>
                      {labelStatusReserva(r.status)}
                    </span>
                  </div>
                )}
                {r.mensagem && <p className="text-[#5EB9AA] text-xs mt-2">"{r.mensagem}"</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Solicitações */}
        <section>
          <h2 className="text-white font-bold text-base mb-4">Minhas Solicitações</h2>
          {sLoading && <p className="text-[#5EB9AA] text-sm">Carregando...</p>}
          {!sLoading && solicitacoes.length === 0 && (
            <p className="text-[#5EB9AA] text-sm">Nenhuma solicitação ainda.</p>
          )}
          <div className="space-y-3">
            {solicitacoes.map(s => (
              <div key={s.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-semibold capitalize">{s.tipo}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${solicitacaoStatusColor[s.status]}`}>
                    {labelStatusSolicitacao(s.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#5EB9AA]">
                  {s.valor_credito_min && <p>Crédito mín: {formatCurrency(s.valor_credito_min)}</p>}
                  {s.valor_credito_max && <p>Crédito máx: {formatCurrency(s.valor_credito_max)}</p>}
                  {s.percentual_maximo && <p>% máx: {s.percentual_maximo}%</p>}
                  {s.prazo_maximo && <p>Prazo máx: {s.prazo_maximo}m</p>}
                </div>
                {s.observacoes && <p className="text-[#5EB9AA] text-xs mt-2">"{s.observacoes}"</p>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/cartas/ClienteDashboardPage.tsx
git commit -m "feat: add ClienteDashboardPage with reservas and solicitacoes"
```

---

### Task 11: CartaForm + AdminCartasPage

**Files:**
- Create: `src/components/CartaForm.tsx`
- Create: `src/pages/admin/AdminCartasPage.tsx`

- [ ] **Step 1: Create `src/components/CartaForm.tsx`**

```typescript
import { useState } from 'react';
import { createCarta, updateCarta } from '@/hooks/useCartas';
import { calcValorCompra, formatCurrency } from '@/lib/cartaUtils';
import type { CartaContemplada } from '@/lib/supabaseTypes';
import { toast } from 'sonner';

type CartaInput = Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>;

interface Props {
  carta?: CartaContemplada;
  onSaved: () => void;
  onCancel: () => void;
}

export function CartaForm({ carta, onSaved, onCancel }: Props) {
  const [tipo, setTipo] = useState<'imovel' | 'veicular'>(carta?.tipo ?? 'imovel');
  const [valorCredito, setValorCredito] = useState(carta?.valor_credito?.toString() ?? '');
  const [percentualCompra, setPercentualCompra] = useState(carta?.percentual_compra?.toString() ?? '');
  const [prazoRestante, setPrazoRestante] = useState(carta?.prazo_restante?.toString() ?? '');
  const [parcelaMensal, setParcelaMensal] = useState(carta?.parcela_mensal?.toString() ?? '');
  const [administradora, setAdministradora] = useState(carta?.administradora ?? '');
  const [descricao, setDescricao] = useState(carta?.descricao ?? '');
  const [status, setStatus] = useState<CartaContemplada['status']>(carta?.status ?? 'disponivel');
  const [submitting, setSubmitting] = useState(false);

  const valorCompraPreview = valorCredito && percentualCompra
    ? calcValorCompra(Number(valorCredito), Number(percentualCompra))
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: CartaInput = {
      tipo,
      valor_credito: Number(valorCredito),
      percentual_compra: Number(percentualCompra),
      prazo_restante: Number(prazoRestante),
      parcela_mensal: parcelaMensal ? Number(parcelaMensal) : null,
      administradora,
      descricao: descricao || null,
      status,
    };
    try {
      if (carta) {
        await updateCarta(carta.id, payload);
        toast.success('Carta atualizada!');
      } else {
        await createCarta(payload);
        toast.success('Carta criada!');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Tipo</label>
        <div className="flex gap-2 mt-2">
          {(['imovel', 'veicular'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tipo === t ? 'bg-[#C9A84C] text-[#031715]' : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}>
              {t === 'imovel' ? 'Imóvel' : 'Veicular'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Valor do crédito</label>
          <input type="number" required value={valorCredito} onChange={e => setValorCredito(e.target.value)} className={inputClass} placeholder="280000" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">
            % de compra
            {valorCompraPreview && <span className="text-[#C9A84C] ml-2">= {formatCurrency(valorCompraPreview)}</span>}
          </label>
          <input type="number" required value={percentualCompra} onChange={e => setPercentualCompra(e.target.value)} min="0" max="100" step="0.01" className={inputClass} placeholder="36" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Prazo restante (meses)</label>
          <input type="number" required value={prazoRestante} onChange={e => setPrazoRestante(e.target.value)} className={inputClass} placeholder="48" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Parcela mensal</label>
          <input type="number" value={parcelaMensal} onChange={e => setParcelaMensal(e.target.value)} className={inputClass} placeholder="1240" />
        </div>
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Administradora</label>
        <input type="text" required value={administradora} onChange={e => setAdministradora(e.target.value)} className={inputClass} placeholder="Caixa, Bradesco..." />
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Descrição (opcional)</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Status</label>
        <div className="flex gap-2 mt-2">
          {(['disponivel', 'reservada', 'vendida'] as const).map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-[#C9A84C] text-[#031715]' : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}>
              {s === 'disponivel' ? 'Disponível' : s === 'reservada' ? 'Reservada' : 'Vendida'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 bg-[#0d3330] text-[#5EB9AA] font-semibold py-3 rounded-xl hover:bg-[#1a4a44] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors">
          {submitting ? 'Salvando...' : carta ? 'Atualizar' : 'Criar carta'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create `src/pages/admin/AdminCartasPage.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllCartasAdmin, deleteCarta } from '@/hooks/useCartas';
import { fetchTodasReservas, updateReservaStatus } from '@/hooks/useReservas';
import { fetchTodasSolicitacoes, updateSolicitacaoStatus } from '@/hooks/useSolicitacoes';
import { CartaForm } from '@/components/CartaForm';
import { formatCurrency, labelTipo, labelStatus, labelStatusReserva, labelStatusSolicitacao } from '@/lib/cartaUtils';
import type { CartaContemplada, Reserva, Solicitacao } from '@/lib/supabaseTypes';
import { toast } from 'sonner';

type Tab = 'cartas' | 'reservas' | 'solicitacoes';

export function AdminCartasPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('cartas');
  const [cartas, setCartas] = useState<CartaContemplada[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarta, setEditingCarta] = useState<CartaContemplada | undefined>(undefined);

  const pendingReservas = reservas.filter(r => r.status === 'pendente').length;

  async function loadAll() {
    setLoading(true);
    const [c, r, s] = await Promise.all([
      fetchAllCartasAdmin(),
      fetchTodasReservas(),
      fetchTodasSolicitacoes(),
    ]);
    setCartas(c);
    setReservas(r);
    setSolicitacoes(s);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta carta?')) return;
    try {
      await deleteCarta(id);
      toast.success('Carta excluída');
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  async function handleReservaAction(reserva: Reserva, action: 'aprovada' | 'recusada') {
    try {
      await updateReservaStatus(reserva.id, action, reserva.carta_id);
      toast.success(action === 'aprovada' ? 'Reserva aprovada!' : 'Reserva recusada');
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  }

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'cartas', label: 'Cartas' },
    { key: 'reservas', label: 'Reservas', badge: pendingReservas || undefined },
    { key: 'solicitacoes', label: 'Solicitações' },
  ];

  return (
    <div className="min-h-screen bg-[#031715]">
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-[#5EB9AA] text-sm hover:text-white">← Cockpit</button>
          <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">Gestão de Cartas</p>
        </div>
        {tab === 'cartas' && (
          <button
            onClick={() => { setEditingCarta(undefined); setShowForm(true); }}
            className="bg-[#C9A84C] text-[#031715] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4b560] transition-colors"
          >
            + Nova Carta
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[#0d3330]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              tab === t.key ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-[#5EB9AA] hover:text-white'
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="absolute top-2 right-1/4 w-4 h-4 bg-[#C9A84C] text-[#031715] text-[9px] font-bold rounded-full flex items-center justify-center">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <main className="p-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && tab === 'cartas' && (
          <div className="space-y-3">
            {cartas.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma carta cadastrada.</p>}
            {cartas.map(c => (
              <div key={c.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[#5EB9AA] uppercase tracking-wider">{labelTipo(c.tipo)}</p>
                    <p className="text-white font-bold">{formatCurrency(c.valor_credito)}</p>
                    <p className="text-[#C9A84C] text-sm">{c.percentual_compra}% • {c.prazo_restante}m • {c.administradora}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs bg-[#0d3330] text-[#5EB9AA] px-2 py-1 rounded">{labelStatus(c.status)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCarta(c); setShowForm(true); }} className="text-xs text-[#5EB9AA] hover:text-white">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">Excluir</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'reservas' && (
          <div className="space-y-3">
            {reservas.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma reserva.</p>}
            {reservas.map(r => (
              <div key={r.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{r.clientes?.nome ?? '—'}</p>
                    <p className="text-[#5EB9AA] text-xs">{r.clientes?.telefone ?? ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    r.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400'
                    : r.status === 'aprovada' ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}>{labelStatusReserva(r.status)}</span>
                </div>
                {r.cartas_contempladas && (
                  <p className="text-[#C9A84C] text-sm font-semibold mb-2">
                    {labelTipo(r.cartas_contempladas.tipo)} — {formatCurrency(r.cartas_contempladas.valor_credito)}
                  </p>
                )}
                {r.mensagem && <p className="text-[#5EB9AA] text-xs mb-3">"{r.mensagem}"</p>}
                {r.status === 'pendente' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleReservaAction(r, 'aprovada')}
                      className="flex-1 bg-green-700/30 text-green-400 text-xs font-semibold py-2 rounded-lg hover:bg-green-700/50 transition-colors">
                      Aprovar
                    </button>
                    <button onClick={() => handleReservaAction(r, 'recusada')}
                      className="flex-1 bg-red-700/30 text-red-400 text-xs font-semibold py-2 rounded-lg hover:bg-red-700/50 transition-colors">
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'solicitacoes' && (
          <div className="space-y-3">
            {solicitacoes.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma solicitação.</p>}
            {solicitacoes.map(s => (
              <div key={s.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{s.clientes?.nome ?? '—'}</p>
                    <p className="text-[#5EB9AA] text-xs capitalize">{s.tipo}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    s.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400'
                    : s.status === 'em_analise' ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>{labelStatusSolicitacao(s.status)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#5EB9AA] mb-2">
                  {s.valor_credito_min && <p>Crédito mín: {formatCurrency(s.valor_credito_min)}</p>}
                  {s.valor_credito_max && <p>Crédito máx: {formatCurrency(s.valor_credito_max)}</p>}
                  {s.percentual_maximo && <p>% máx: {s.percentual_maximo}%</p>}
                  {s.prazo_maximo && <p>Prazo máx: {s.prazo_maximo}m</p>}
                </div>
                {s.status === 'pendente' && (
                  <button onClick={() => updateSolicitacaoStatus(s.id, 'em_analise').then(loadAll)}
                    className="text-xs text-blue-400 hover:text-blue-300">
                    Marcar em análise
                  </button>
                )}
                {s.status === 'em_analise' && (
                  <button onClick={() => updateSolicitacaoStatus(s.id, 'atendida').then(loadAll)}
                    className="text-xs text-green-400 hover:text-green-300">
                    Marcar atendida
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CartaForm modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8"
          style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-white font-bold text-lg mb-6">
              {editingCarta ? 'Editar carta' : 'Nova carta'}
            </h2>
            <CartaForm
              carta={editingCarta}
              onSaved={() => { setShowForm(false); loadAll(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CartaForm.tsx src/pages/admin/AdminCartasPage.tsx
git commit -m "feat: add CartaForm and AdminCartasPage with tabs for cartas, reservas, solicitacoes"
```

---

### Task 12: Wire Admin Into PurposeScreen

**Files:**
- Modify: `src/screens/PurposeScreen.tsx`
- Modify: `src/App.tsx` (pass onAdminCartas prop)

- [ ] **Step 1: Read `src/screens/PurposeScreen.tsx`**

Identify the Props interface and the existing optional callbacks (e.g., `onComissao`). The pattern will be: add `onAdminCartas?: () => void` to Props and render a hidden link only when the prop is provided.

- [ ] **Step 2: Add `onAdminCartas` to PurposeScreen Props**

In `src/screens/PurposeScreen.tsx`, add `onAdminCartas?: () => void` to the Props interface.

Then, inside the JSX where other admin-only links live (look for `onComissao` usage as a reference), add:

```tsx
{onAdminCartas && (
  <button
    onClick={onAdminCartas}
    className="text-xs text-[#5EB9AA]/60 hover:text-[#5EB9AA] transition-colors"
  >
    Gestão de Cartas
  </button>
)}
```

- [ ] **Step 3: Pass prop from CockpitApp in `src/App.tsx`**

Inside `CockpitApp`, import `useNavigate` from `react-router-dom` and `useAuth`. Where `PurposeScreen` is rendered, add:

```tsx
const { role } = useAuth();
const navigate = useNavigate();

// ...
<PurposeScreen
  // ... existing props
  onAdminCartas={role === 'admin' ? () => navigate('/admin/cartas') : undefined}
/>
```

- [ ] **Step 4: Verify in browser**

Log in as admin user, navigate to cockpit. "Gestão de Cartas" link should appear. Clicking it opens `/admin/cartas`. Non-admin users don't see the link.

- [ ] **Step 5: Commit**

```bash
git add src/screens/PurposeScreen.tsx src/App.tsx
git commit -m "feat: add Gestão de Cartas link in PurposeScreen for admin users"
```

---

### Task 13: Build Verification + Vercel Deploy

**Files:**
- Modify: Vercel Dashboard (environment variables)

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: 0 TypeScript errors, bundle output in `dist/`.

- [ ] **Step 2: Run tests**

```bash
npm run test
```

Expected: all tests pass (including cartaUtils.test.ts).

- [ ] **Step 3: Add environment variables in Vercel**

In the Vercel project dashboard → Settings → Environment Variables, add:
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

Set them for Production, Preview, and Development environments.

- [ ] **Step 4: Push to trigger deploy**

```bash
git push origin main
```

Wait for Vercel deploy to complete. Verify both `/cartas` (client portal) and `/` (cockpit) load correctly in production.

- [ ] **Step 5: End-to-end smoke test in production**

1. Open `/cartas` → login screen appears
2. Register a new client account → redirected to `/cartas/portal`
3. (In Supabase SQL Editor) insert a test carta:
   ```sql
   INSERT INTO cartas_contempladas (tipo, valor_credito, percentual_compra, prazo_restante, administradora)
   VALUES ('imovel', 280000, 36, 48, 'Caixa');
   ```
4. Refresh `/cartas/portal` → carta appears in grid
5. Click "Reservar" → modal opens → confirm → toast appears
6. Go to `/cartas/dashboard` → reserva visible with status "Pendente"
7. Log in as admin at `/` → navigate to "Gestão de Cartas"
8. Tab Reservas → approve the reserva → status changes to "Aprovada"
9. Tab Cartas → carta now shows as "Reservada"

---

## Checklist

- [ ] Supabase project created and env vars configured
- [ ] All 4 tables + RLS policies created via SQL Editor
- [ ] Admin user promoted via `UPDATE profiles SET role='admin'`
- [ ] Client portal accessible at `/cartas`
- [ ] Admin panel accessible at `/admin/cartas`
- [ ] Existing cockpit at `/` unaffected
- [ ] All Vitest tests pass
- [ ] Production build succeeds
- [ ] Vercel env vars set and deploy verified
