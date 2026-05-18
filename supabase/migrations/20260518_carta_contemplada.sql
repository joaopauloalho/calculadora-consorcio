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
