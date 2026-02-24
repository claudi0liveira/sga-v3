-- =============================================
-- SGA v3.2 - Roles + All Modules Controlled
-- Execute no SQL Editor do Supabase
-- =============================================

-- Adicionar campo 'role' na tabela profiles
-- Roles: 'admin', 'colaborador' (default)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'colaborador';

-- Atualizar admins existentes (se já tem na tabela admins)
UPDATE profiles SET role = 'admin' 
WHERE id IN (SELECT user_id FROM admins);

-- A tabela admins antiga pode ficar, mas agora usamos profiles.role
-- Para novos usuários, o default é 'colaborador' (sem módulos)

-- Admin pode ver TODOS os profiles (para gerenciar)
DROP POLICY IF EXISTS "own_data" ON profiles;
CREATE POLICY "own_or_admin" ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin pode ATUALIZAR role dos outros
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin pode gerenciar todos os módulos
DROP POLICY IF EXISTS "admin_manage_modules" ON user_modules;
CREATE POLICY "admin_manage_modules" ON user_modules FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- Para novos usuários: admin precisa liberar módulos
-- Admin tem acesso a tudo automaticamente
-- Colaborador só vê módulos liberados
-- =============================================
