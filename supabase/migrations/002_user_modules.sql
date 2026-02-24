-- =============================================
-- SGA v3.1 - Module Access Control
-- Execute no SQL Editor do Supabase
-- =============================================

-- Tabela de módulos por usuário
-- Só precisa ter registro para módulos RESTRITOS
-- Se não tem registro, o módulo fica OCULTO
CREATE TABLE IF NOT EXISTS user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module)
);

-- Tabela de admins (simples: lista de user_ids que são admin)
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver seus próprios módulos
CREATE POLICY "own_modules" ON user_modules FOR SELECT
  USING (auth.uid() = user_id);

-- Admin pode ver e gerenciar todos os módulos
CREATE POLICY "admin_manage_modules" ON user_modules FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admins));

-- Admin pode ver a lista de admins
CREATE POLICY "admin_view" ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- IMPORTANTE: Após rodar este SQL, execute:
-- INSERT INTO admins (user_id) VALUES ('SEU_USER_ID');
-- Para se tornar admin. Pegue seu user_id em:
-- SELECT id, email FROM auth.users;
-- =============================================
