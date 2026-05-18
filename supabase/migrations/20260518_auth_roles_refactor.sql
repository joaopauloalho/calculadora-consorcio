-- 1. Atualizar check constraint de roles (admin → master, adicionar vendedor)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('master', 'vendedor', 'cliente'));

-- 2. Renomear admin → master nos registros existentes
UPDATE profiles SET role = 'master' WHERE role = 'admin';

-- 3. Adicionar colunas nome e email em profiles (para listagem de usuários)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 4. Atualizar trigger handle_new_user para capturar email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, role, email)
  VALUES (new.id, 'cliente', new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 5. Atualizar políticas RLS de cartas_contempladas
DROP POLICY IF EXISTS "Admin manage cartas" ON cartas_contempladas;
DROP POLICY IF EXISTS "Admin full access cartas" ON cartas_contempladas;

CREATE POLICY "Master manages cartas" ON cartas_contempladas
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));

-- 6. Política de leitura de cartas para autenticados
DROP POLICY IF EXISTS "Anyone reads available cartas" ON cartas_contempladas;
DROP POLICY IF EXISTS "Clients read available cartas" ON cartas_contempladas;
DROP POLICY IF EXISTS "Authenticated reads available cartas" ON cartas_contempladas;

CREATE POLICY "Authenticated reads cartas" ON cartas_contempladas
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      status = 'disponivel'
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('master', 'vendedor'))
    )
  );

-- 7. Políticas de reservas
DROP POLICY IF EXISTS "Clients manage own reservas" ON reservas;
DROP POLICY IF EXISTS "Admin manage all reservas" ON reservas;

CREATE POLICY "Cliente insert reserva" ON reservas
  FOR INSERT WITH CHECK (
    auth.uid() = cliente_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'cliente')
  );

CREATE POLICY "Cliente read own reservas" ON reservas
  FOR SELECT USING (
    auth.uid() = cliente_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );

CREATE POLICY "Master update reservas" ON reservas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );

-- 8. Políticas de solicitacoes
DROP POLICY IF EXISTS "Clients manage own solicitacoes" ON solicitacoes;
DROP POLICY IF EXISTS "Admin manage all solicitacoes" ON solicitacoes;

CREATE POLICY "Cliente insert solicitacao" ON solicitacoes
  FOR INSERT WITH CHECK (
    auth.uid() = cliente_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'cliente')
  );

CREATE POLICY "Cliente read own solicitacoes" ON solicitacoes
  FOR SELECT USING (
    auth.uid() = cliente_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );

CREATE POLICY "Master update solicitacoes" ON solicitacoes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );

-- 9. Políticas de profiles
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Master update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
  );
