# SGA — Sistema de Gestão de Atividades v3.0

Sistema fullstack de produtividade pessoal com gestão de tarefas, finanças e hábitos.

## Stack
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **Banco:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/senha)
- **Deploy:** Vercel

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco (Supabase)
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo de `supabase/migrations/001_initial.sql`
4. Vá em **Authentication → Providers → Email** e confirme que está ativado

### 3. Configurar variáveis de ambiente
Renomeie `.env.example` para `.env.local` e preencha com suas credenciais:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Rodar local
```bash
npm run dev
```
Acesse http://localhost:3000

### 5. Deploy no Vercel
1. Suba para o GitHub: `git push origin main`
2. No Vercel, importe o repositório
3. Adicione as variáveis de ambiente (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Deploy!

## Estrutura

```
src/
├── app/            # Páginas (Next.js App Router)
├── components/     # Componentes React organizados por domínio
├── hooks/          # Custom hooks (useTasks, useFinance, etc.)
├── lib/            # Config, helpers, constants
├── styles/         # CSS global
└── middleware.js    # Proteção de rotas (auth)
```

## Status da migração

### ✅ Fase 1 (Completa)
- Infraestrutura Next.js + Supabase
- Schema SQL completo (13 tabelas + RLS)
- Sistema de autenticação
- Hooks de dados (CRUD completo)
- Login e Registro
- CalendarDashboard (dashboard principal)
- AppShell (sidebar + header)
- UI components base

### 🔄 Fase 2 (Próxima conversa)
- DayView completo (timer, tasks, close day)
- TaskForm, TaskItem, EditModal
- FinancePage completo
- LibertyPage completo
- PrioritiesPanel com edição
- DocsPage completo
- StatusBar
- Script de migração localStorage → Supabase
