-- =============================================
-- SGA v3.0 - Schema Completo
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- Perfil do usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('Alta', 'Média', 'Baixa')) DEFAULT 'Média',
  block TEXT,
  start_time TIME NOT NULL,
  duration INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled','active','done','partial','skipped','paused')) DEFAULT 'scheduled',
  timer_running BOOLEAN DEFAULT false,
  accumulated_time INTEGER DEFAULT 0,
  note TEXT,
  todos JSONB DEFAULT '[]',
  replan_count INTEGER DEFAULT 0,
  replan_from DATE,
  range_group TEXT,
  range_index INTEGER,
  range_total INTEGER,
  weekly_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Histórico de dias encerrados
CREATE TABLE IF NOT EXISTS day_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  snapshot JSONB NOT NULL,
  note TEXT,
  closed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Rendas
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  pay_day INTEGER CHECK (pay_day BETWEEN 1 AND 28),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_key TEXT NOT NULL,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  category TEXT,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservas
CREATE TABLE IF NOT EXISTS reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de reserva (depósitos)
CREATE TABLE IF NOT EXISTS reserve_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id UUID REFERENCES reserves(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prioridades
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fase atual
CREATE TABLE IF NOT EXISTS phase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  quote TEXT,
  UNIQUE(user_id)
);

-- Quick Links
CREATE TABLE IF NOT EXISTS quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jornada da Liberdade
CREATE TABLE IF NOT EXISTS liberty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  smoke_date DATE,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS liberty_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('craving', 'victory')) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Preferências do usuário
CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  UNIQUE(user_id, key)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE liberty ENABLE ROW LEVEL SECURITY;
ALTER TABLE liberty_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "own_data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_data" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON day_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON incomes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON reserves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON reserve_items FOR ALL USING (
  reserve_id IN (SELECT id FROM reserves WHERE user_id = auth.uid())
);
CREATE POLICY "own_data" ON priorities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON phase FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON quick_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON liberty FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON liberty_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON preferences FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- TRIGGER: update updated_at on tasks
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
