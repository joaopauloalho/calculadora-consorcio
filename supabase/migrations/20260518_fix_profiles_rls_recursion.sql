-- Função SECURITY DEFINER: lê o role do usuário sem passar pelo RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Recriar políticas de profiles sem recursão
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Master update any profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR get_my_role() = 'master'
  );

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Master update any profile" ON profiles
  FOR UPDATE USING (get_my_role() = 'master');

-- Corrigir também as outras políticas que tinham o mesmo padrão recursivo
DROP POLICY IF EXISTS "Master manages cartas" ON cartas_contempladas;
DROP POLICY IF EXISTS "Authenticated reads cartas" ON cartas_contempladas;

CREATE POLICY "Master manages cartas" ON cartas_contempladas
  FOR ALL
  USING (get_my_role() = 'master')
  WITH CHECK (get_my_role() = 'master');

CREATE POLICY "Authenticated reads cartas" ON cartas_contempladas
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      status = 'disponivel'
      OR get_my_role() IN ('master', 'vendedor')
    )
  );

DROP POLICY IF EXISTS "Cliente insert reserva" ON reservas;
DROP POLICY IF EXISTS "Cliente read own reservas" ON reservas;
DROP POLICY IF EXISTS "Master update reservas" ON reservas;

CREATE POLICY "Cliente insert reserva" ON reservas
  FOR INSERT WITH CHECK (
    auth.uid() = cliente_id AND get_my_role() = 'cliente'
  );

CREATE POLICY "Cliente read own reservas" ON reservas
  FOR SELECT USING (
    auth.uid() = cliente_id OR get_my_role() = 'master'
  );

CREATE POLICY "Master update reservas" ON reservas
  FOR UPDATE USING (get_my_role() = 'master');

DROP POLICY IF EXISTS "Cliente insert solicitacao" ON solicitacoes;
DROP POLICY IF EXISTS "Cliente read own solicitacoes" ON solicitacoes;
DROP POLICY IF EXISTS "Master update solicitacoes" ON solicitacoes;

CREATE POLICY "Cliente insert solicitacao" ON solicitacoes
  FOR INSERT WITH CHECK (
    auth.uid() = cliente_id AND get_my_role() = 'cliente'
  );

CREATE POLICY "Cliente read own solicitacoes" ON solicitacoes
  FOR SELECT USING (
    auth.uid() = cliente_id OR get_my_role() = 'master'
  );

CREATE POLICY "Master update solicitacoes" ON solicitacoes
  FOR UPDATE USING (get_my_role() = 'master');
