"use client";
import { useState, useMemo } from "react";
import { C } from "@/lib/constants";
import { Btn } from "@/components/ui";

const SECTIONS = [
  {
    id: "overview", icon: "🏠", title: "O que é o SGA?", color: C.accent,
    content: [
      { type: "intro", text: "O SGA (Sistema de Gestão de Atividades) é um sistema pessoal de produtividade projetado para ajudar você a organizar suas tarefas diárias, finanças e hábitos de saúde — tudo em um só lugar." },
      { type: "highlight", emoji: "💡", title: "Filosofia", text: "O SGA não serve para te cobrar. Serve para te ajudar a ver o que já fez, o que falta, e decidir o que importa. 'Replanejar não é falhar. É escolher continuar.'" },
      { type: "features", title: "Módulos do sistema", items: [
        { emoji: "📅", label: "Calendário", desc: "Tarefas diárias com timer, prioridades e acompanhamento" },
        { emoji: "💰", label: "Gestão Financeira", desc: "Rendas, despesas, saldo mensal e reservas" },
        { emoji: "🚭", label: "Jornada da Liberdade", desc: "Rastreador de dias sem fumar com marcos e benefícios" },
        { emoji: "📖", label: "Documentação", desc: "Você está aqui! Guia completo do sistema" },
        { emoji: "💾", label: "Dados & Backup", desc: "Exportar e importar dados, backups regulares" },
        { emoji: "⚙️", label: "Painel Admin", desc: "Controle de acesso a módulos (admin)" },
      ]}
    ]
  },
  {
    id: "first-steps", icon: "🚀", title: "Primeiros passos", color: "#5BA87A",
    content: [
      { type: "steps", title: "Configuração inicial", items: [
        { step: 1, title: "Defina sua fase", desc: "Vá em Calendário → Seção 'Prioridades' → Clique 'Definir prioridades'. Dê um nome à sua fase atual e adicione até 5 prioridades." },
        { step: 2, title: "Crie sua primeira tarefa", desc: "Clique em qualquer dia no calendário → Botão 'Adicionar tarefa'. Preencha nome, horário, duração e prioridade." },
        { step: 3, title: "Adicione links úteis", desc: "Na tela principal do calendário, seção 'Links úteis' → botão +. Cole links que você acessa todo dia." },
        { step: 4, title: "Configure suas finanças", desc: "Menu ☰ → Gestão Financeira. Adicione suas rendas e despesas do mês." },
      ]}
    ]
  },
  {
    id: "tasks", icon: "✅", title: "Gerenciando tarefas", color: C.high,
    content: [
      { type: "tutorial", title: "Criar uma tarefa simples", steps: ["Toque em um dia no calendário","Clique em 'Adicionar tarefa' (ou no + flutuante)","Preencha: nome, prioridade, horário e duração","Opcionalmente adicione to-dos e observações","Clique 'Adicionar'"] },
      { type: "tutorial", title: "Criar tarefas em lote (Range)", steps: ["No formulário, marque 'Range (dias seguidos)'","Selecione data de início e fim","Opcionalmente marque 'Só dias úteis'","Todas as tarefas são criadas com badge 📋 1/7, 2/7 etc"] },
      { type: "tutorial", title: "Criar tarefas semanais", steps: ["Marque 'Semanal (toda X)'","Escolha o dia da semana","Defina quantas semanas","O sistema cria nas datas corretas"] },
      { type: "info", emoji: "⚠️", title: "Conflito de horário", text: "Se criar uma tarefa no mesmo horário de outra, o sistema avisa. Você pode ignorar e criar mesmo assim — é informativo." },
      { type: "tutorial", title: "Execução no dia", steps: ["Tarefas iniciam no horário programado (timer começa)","Pause ⏸ e retome ▶ a qualquer momento","Marque: ✅ Sim, ◐ Parcialmente ou ○ Não","Cada resposta gera uma mensagem diferente"] },
      { type: "tutorial", title: "Reagendar uma tarefa", steps: ["Clique no ícone 📅 na tarefa","Escolha data rápida ou selecione no calendário","A tarefa exibirá '↻ Replanejada' com contagem e data original"] },
      { type: "tutorial", title: "Limpar dia", steps: ["Clique '🗑 Limpar dia' no topo","Modal lista todas as tarefas","Desmarque as que quer manter","Confirme a remoção"] },
      { type: "tutorial", title: "Encerrar o dia", steps: ["Clique 'Encerrar dia' no topo","Se tudo concluído, botão fica verde","Escreva uma nota opcional","Tarefas pendentes são replanejadas","Na sexta, review de sáb/dom aparece"] },
      { type: "info", emoji: "🔄", title: "Replanejamento automático", text: "Ao abrir o app, tarefas pendentes de dias anteriores são movidas para hoje. A contagem de reagendamentos é rastreada." }
    ]
  },
  {
    id: "calendar-home", icon: "📅", title: "Tela do Calendário (Dashboard)", color: C.accent,
    content: [
      { type: "intro", text: "A tela principal é um dashboard distribuído em grid, com informações lado a lado para reduzir rolagem." },
      { type: "features", title: "Layout do dashboard", items: [
        { emoji: "⚡", label: "Atividade atual + Progresso", desc: "Tarefa em andamento com timer e anel circular com % de progresso" },
        { emoji: "📋", label: "Programação de hoje", desc: "Lista completa de tarefas do dia com status" },
        { emoji: "🔗", label: "Links úteis + Constância", desc: "Atalhos rápidos e métricas de dias usados" },
        { emoji: "🎯", label: "Prioridades", desc: "Fase atual e até 5 prioridades com toggle 👁" },
        { emoji: "📅", label: "Calendário mensal", desc: "Compacto, com bolinhas coloridas por prioridade" },
        { emoji: "📋", label: "Ranges ativos", desc: "Progresso de todos os ranges em grid" },
        { emoji: "📈", label: "Últimos 7 dias", desc: "Gráfico de barras com % de conclusão diária" },
        { emoji: "💡", label: "Insight", desc: "Mensagem motivacional inline" },
      ]},
      { type: "info", emoji: "🎯", title: "Navegação inteligente", text: "Ao clicar em uma tarefa na home, você é levado direto para ela no DayView com destaque visual." },
      { type: "info", emoji: "👋", title: "Onboarding", text: "No primeiro acesso, banner de boas-vindas. Ao criar primeira tarefa, lembrete. Somem após confirmação." },
      { type: "info", emoji: "🔵", title: "Indicadores no calendário", text: "Bolinhas: 🔴 Alta, 🟡 Média, 🔵 Baixa. Dias concluídos com fundo verde. Hoje com borda roxa. Nota com 📝." }
    ]
  },
  {
    id: "statusbar", icon: "📊", title: "Barra de Status", color: "#D4A843",
    content: [
      { type: "intro", text: "A barra de status fica fixa abaixo do header em todas as telas. Mostra até 4 métricas em tempo real." },
      { type: "features", title: "Métricas disponíveis", items: [
        { emoji: "🚭", label: "Dias livre", desc: "Contagem de dias sem fumar. Toque → Jornada" },
        { emoji: "●", label: "Atividade atual", desc: "Tarefa em andamento + minutos restantes. Toque → Dia" },
        { emoji: "🐷", label: "Reservado", desc: "Total em reservas financeiras. Toque → Finanças" },
        { emoji: "🎯", label: "Foco", desc: "Prioridade #1 da sua fase. Toque → Calendário" },
      ]},
      { type: "info", emoji: "👁", title: "Visibilidade", text: "Cada métrica tem botão 👁 que esconde/mostra o valor. Útil para privacidade. Preferência salva automaticamente." }
    ]
  },
  {
    id: "finance", icon: "💰", title: "Gestão Financeira", color: "#5BA87A",
    content: [
      { type: "features", title: "5 cards do dashboard", items: [
        { emoji: "📈", label: "Renda Total", desc: "Soma de todas as rendas do mês" },
        { emoji: "📉", label: "Total Gasto", desc: "Soma das despesas já pagas" },
        { emoji: "💳", label: "Saldo do Mês", desc: "Renda Total − Total Gasto" },
        { emoji: "📊", label: "Desp. Projetadas", desc: "Soma de todas as despesas" },
        { emoji: "🐷", label: "Reservado", desc: "Total acumulado em reservas" },
      ]},
      { type: "tutorial", title: "Adicionar uma renda", steps: ["Seção 'Rendas' → clique '+ Renda'","Preencha: nome, valor e dia de recebimento","Escolha o escopo: 🌐 Global (aparece em todos os meses) ou 📅 Só este mês","Clique ✓ para salvar. Badge GLOBAL/MÊS aparece na lista","Para remover, clique ✕"] },
      { type: "info", emoji: "🌐", title: "Renda Global vs Mensal", text: "Rendas globais (ex: salário) aparecem em todos os meses automaticamente até serem removidas. Rendas mensais (ex: bônus) ficam vinculadas ao mês selecionado." },
      { type: "tutorial", title: "Adicionar uma despesa", steps: ["Seção 'Despesas' → clique '+ Despesa'","Preencha: nome, valor e categoria","Marque como paga clicando no ○","Para remover, clique ✕"] },
      { type: "tutorial", title: "Sistema de Reservas", steps: ["Seção 'Reservas' → '+ Reserva'","Dê um nome (ex: Emergência)","Dentro, clique '+ Adicionar valor'","O total acumula automaticamente"] },
      { type: "info", emoji: "📅", title: "Navegação por meses", text: "Use as setas ‹ › no topo para alternar meses. Cada mês tem suas despesas independentes. Rendas globais aparecem em todos os meses, rendas mensais só no mês vinculado." }
    ]
  },
  {
    id: "liberty", icon: "🚭", title: "Jornada da Liberdade", color: "#34d399",
    content: [
      { type: "intro", text: "Módulo dedicado ao acompanhamento de dias sem fumar com marcos, benefícios, vontades e vitórias." },
      { type: "tutorial", title: "Começar a jornada", steps: ["Acesse pelo menu ☰ → Jornada da Liberdade","Clique '🚭 Começo AGORA' para hoje","Ou selecione data personalizada (inclusive futura!)","Se a data for futura, o contador mostra contagem regressiva negativa (-5d, -3h...)","Quando a data chega, transiciona automaticamente para contagem positiva"] },
      { type: "features", title: "O que você acompanha", items: [
        { emoji: "⚡", label: "Registro de Vontades", desc: "Registre gatilhos e vontades (lado esquerdo)" },
        { emoji: "🏆", label: "Vitórias", desc: "Celebre cada conquista (lado direito)" },
        { emoji: "🏅", label: "Marcos", desc: "1, 3, 7, 14, 21, 30, 60, 90, 120, 180, 365 dias" },
        { emoji: "🌱", label: "Benefícios", desc: "Benefícios de saúde desbloqueados a cada marco" },
      ]},
      { type: "info", emoji: "🔄", title: "Recomeçar jornada", text: "O botão 'Recomeçar' fica logo abaixo do contador com destaque visual. Ao recomeçar, o sistema registra automaticamente nas Vontades quantos dias você estava livre (ex: '🔄 Recomeço — estava há 15 dias livre'). Assim você tem histórico de todas as tentativas." },
      { type: "info", emoji: "📐", title: "Layout lado a lado", text: "Vontades e Vitórias ficam lado a lado em colunas, facilitando a comparação. O padrão visual ajuda a identificar se suas vitórias superam as vontades." },
      { type: "info", emoji: "💪", title: "Quando a vontade vier", text: "A vontade dura 3-5 minutos. Respire fundo, beba água e registre no app. Cada registro é uma vitória." }
    ]
  },
  {
    id: "tips", icon: "💡", title: "Dicas e boas práticas", color: "#D4A843",
    content: [
      { type: "tips", items: [
        { emoji: "🌅", title: "Planeje na noite anterior", text: "Abra o dia seguinte e adicione as tarefas antes de dormir." },
        { emoji: "🔴", title: "Use 'Alta' com moderação", text: "No máximo 2-3 tarefas Alta por dia. Se tudo é urgente, nada é urgente." },
        { emoji: "⏱️", title: "Duração realista", text: "Melhor estimar 45min e terminar em 30 do que estimar 15 e se frustrar." },
        { emoji: "📝", title: "Use as notas do dia", text: "Ao encerrar, escreva uma frase. Em 30 dias, terá um diário de produtividade." },
        { emoji: "🐷", title: "Reservas pequenas contam", text: "R$ 10, R$ 20... o hábito de guardar vale mais que o valor." },
        { emoji: "🔄", title: "Reagendar sem culpa", text: "Replanejamento é visibilidade, não vergonha." },
        { emoji: "📋", title: "Micro-tarefas (to-dos)", text: "Quebre tarefas grandes em partes. Cada ✓ libera dopamina." },
        { emoji: "🎯", title: "Revise prioridades semanalmente", text: "Suas 5 prioridades mudam. Atualize quando sentir que evoluiu." },
      ]}
    ]
  },
  {
    id: "onboarding", icon: "👋", title: "Onboarding (primeiro acesso)", color: "#6C3FB5",
    content: [
      { type: "intro", text: "No primeiro acesso ao SGA, um wizard de boas-vindas apresenta o sistema em 5 passos. Você pode pular a qualquer momento." },
      { type: "steps", title: "Os 5 passos do onboarding", items: [
        { step: 1, title: "Bem-vindo ao SGA!", desc: "Apresentação geral do sistema e sua proposta." },
        { step: 2, title: "Planeje seu dia", desc: "Visão geral de tarefas, blocos e progresso." },
        { step: 3, title: "Controle financeiro", desc: "Rendas, despesas e reservas." },
        { step: 4, title: "Jornada da Liberdade", desc: "Contador, marcos e registro." },
        { step: 5, title: "Seus dados na nuvem", desc: "Diferencial do Supabase vs localStorage." },
      ]},
      { type: "info", emoji: "📖", title: "Documentação", text: "No último passo, há um botão para acessar esta documentação. O onboarding só aparece uma vez." }
    ]
  },
  {
    id: "admin", icon: "⚙️", title: "Painel Admin (módulos)", color: "#D4770B",
    content: [
      { type: "intro", text: "O SGA tem um sistema de controle de módulos por usuário. Alguns módulos são livres (todos acessam) e outros são restritos (admin libera)." },
      { type: "features", title: "Módulos e acesso", items: [
        { emoji: "📅", label: "Calendário", desc: "LIVRE — todos os usuários acessam" },
        { emoji: "💰", label: "Gestão Financeira", desc: "LIVRE — todos os usuários acessam" },
        { emoji: "📖", label: "Documentação", desc: "LIVRE — todos os usuários acessam" },
        { emoji: "💾", label: "Dados & Backup", desc: "LIVRE — todos os usuários acessam" },
        { emoji: "🚭", label: "Jornada da Liberdade", desc: "RESTRITO — admin precisa liberar" },
      ]},
      { type: "tutorial", title: "Como liberar um módulo", steps: ["Acesse /admin (visível no menu só para admins)","Encontre o usuário na lista","Ative o toggle do módulo desejado","O usuário verá o módulo no menu imediatamente"] },
      { type: "info", emoji: "🔒", title: "Módulos restritos", text: "Módulos restritos ficam ocultos do menu e a rota (/liberdade) mostra mensagem de acesso restrito. O usuário não sabe que o módulo existe até ser liberado." },
      { type: "info", emoji: "🛡️", title: "Como se tornar admin", text: "Execute no SQL Editor do Supabase: INSERT INTO admins (user_id) VALUES ('seu-uuid'). Admins veem o item 'Painel Admin' no menu lateral." }
    ]
  },
  {
    id: "backup", icon: "💾", title: "Dados & Backup", color: "#2E75B6",
    content: [
      { type: "intro", text: "O módulo Dados & Backup permite exportar e importar todos os seus dados do SGA. Acessível pelo menu ☰ → Dados & Backup." },
      { type: "tutorial", title: "Exportar backup", steps: ["Acesse Dados & Backup pelo menu","Clique '💾 Exportar Backup'","Um arquivo sga-backup-YYYY-MM-DD.json será baixado","Guarde em local seguro (Google Drive, Dropbox, etc.)"] },
      { type: "tutorial", title: "Importar backup", steps: ["Clique '📂 Selecionar Arquivo'","Escolha um arquivo .json de backup","O sistema importa via upsert (atualiza existentes, cria novos)","Recarregue a página para ver os dados"] },
      { type: "info", emoji: "📊", title: "Contador de dados", text: "Clique '🔄 Contar' para ver quantos registros você tem em cada tabela (tarefas, rendas, despesas, etc.)." },
      { type: "info", emoji: "☁️", title: "Dados na nuvem", text: "Seus dados já estão salvos no Supabase. O backup é uma cópia extra de segurança. Mesmo sem backup, seus dados persistem entre dispositivos." },
      { type: "info", emoji: "⚠️", title: "Import não apaga", text: "O Import nunca apaga dados existentes. Ele só adiciona novos ou atualiza registros com mesmo ID. Para começar do zero, delete manualmente no Supabase." }
    ]
  },
  {
    id: "changelog", icon: "📋", title: "Changelog (novidades)", color: "#34d399",
    content: [
      { type: "intro", text: "Histórico de atualizações do SGA." },
      { type: "features", title: "v3.1 — Fevereiro 2026", items: [
        { emoji: "📐", label: "Liberty: layout lado a lado", desc: "Vontades e Vitórias agora ficam em colunas" },
        { emoji: "🔄", label: "Liberty: reset registra dias", desc: "Ao recomeçar, registra quantos dias estava livre" },
        { emoji: "⏳", label: "Liberty: datas negativas", desc: "Contagem regressiva com visual roxo para datas futuras" },
        { emoji: "🌐", label: "Finanças: renda Global/Mensal", desc: "Escolha se a renda aparece em todos os meses ou só no atual" },
        { emoji: "▶️", label: "Dashboard: task ativa por play", desc: "A atividade mostrada é a que está com play, não só por horário" },
        { emoji: "👋", label: "Onboarding wizard", desc: "5 passos de boas-vindas no primeiro acesso" },
        { emoji: "🔐", label: "Controle de módulos", desc: "Admin pode liberar/restringir módulos por usuário" },
        { emoji: "💾", label: "Dados & Backup", desc: "Export/Import de todos os dados em .json" },
      ]},
      { type: "features", title: "v3.0 — Fevereiro 2026", items: [
        { emoji: "🚀", label: "Migração completa", desc: "De app.jsx monolítico para Next.js + Supabase" },
        { emoji: "☁️", label: "Dados na nuvem", desc: "Supabase PostgreSQL com RLS" },
        { emoji: "🔑", label: "Autenticação", desc: "Login/registro com email e senha" },
        { emoji: "📱", label: "Multi-dispositivo", desc: "Acesse de qualquer lugar com sua conta" },
      ]}
    ]
  },
  {
    id: "data", icon: "🔒", title: "Segurança dos dados", color: C.textMuted,
    content: [
      { type: "intro", text: "Na versão v3.0, seus dados ficam salvos com segurança no Supabase (PostgreSQL na nuvem). Você pode acessar de qualquer dispositivo com sua conta." },
      { type: "info", emoji: "🔒", title: "Segurança", text: "Seus dados são protegidos por Row Level Security (RLS). Apenas você tem acesso às suas informações, mesmo no banco de dados." },
      { type: "info", emoji: "☁️", title: "Sincronização", text: "Ao contrário da versão anterior (localStorage), seus dados agora sincronizam entre dispositivos automaticamente ao fazer login." }
    ]
  }
];

function countSections(content) {
  return content.length;
}

// ─── Renderers ───
function RenderIntro({ item }) {
  return <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>{item.text}</div>;
}

function RenderHighlight({ item }) {
  return (
    <div style={{ padding: 16, background: C.accent + "10", borderRadius: 14, border: `1px solid ${C.accent}25`, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 6 }}>{item.emoji} {item.title}</div>
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{item.text}</div>
    </div>
  );
}

function RenderFeatures({ item }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>{item.title}</div>
      {item.items.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 12, marginBottom: 6, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emoji}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.label}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RenderTutorial({ item }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>{item.title}</div>
      {item.steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: C.accent, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, paddingTop: 2 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

function RenderSteps({ item }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>{item.title}</div>
      {item.items.map((s) => (
        <div key={s.step} style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.bg, borderRadius: 12, marginBottom: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: C.done, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.title}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RenderInfo({ item }) {
  return (
    <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 12, marginBottom: 12, borderLeft: `3px solid ${C.accent}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{item.emoji} {item.title}</div>
      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{item.text}</div>
    </div>
  );
}

function RenderTips({ item }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {item.items.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: C.bg, borderRadius: 14, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{t.emoji}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.title}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.5 }}>{t.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderContent(item, i) {
  switch (item.type) {
    case "intro": return <RenderIntro key={i} item={item} />;
    case "highlight": return <RenderHighlight key={i} item={item} />;
    case "features": return <RenderFeatures key={i} item={item} />;
    case "tutorial": return <RenderTutorial key={i} item={item} />;
    case "steps": return <RenderSteps key={i} item={item} />;
    case "info": return <RenderInfo key={i} item={item} />;
    case "tips": return <RenderTips key={i} item={item} />;
    default: return null;
  }
}

export default function DocsPageComponent() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return SECTIONS;
    const q = searchTerm.toLowerCase();
    return SECTIONS.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      return s.content.some((c) => {
        if (c.text?.toLowerCase().includes(q)) return true;
        if (c.title?.toLowerCase().includes(q)) return true;
        if (c.items?.some((it) => (it.label || it.title || it.text || it.desc || "").toLowerCase().includes(q))) return true;
        if (c.steps?.some((st) => st.toLowerCase().includes(q))) return true;
        return false;
      });
    });
  }, [searchTerm]);

  const active = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div style={{ animation: "fadeIn .4s ease", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>📖</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: C.text }}>Documentação</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Tudo o que você precisa saber sobre o SGA</div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setActiveSection(null); }}
          placeholder="🔍 Buscar na documentação..."
          style={{ width: "100%", padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: C.surface, color: C.text, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Section detail */}
      {active && !searchTerm ? (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <button onClick={() => setActiveSection(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: C.accent, fontFamily: "'DM Sans',sans-serif", marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
          <div style={{ padding: "20px 22px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>{active.icon} {active.title}</div>
            {active.content.map((item, i) => renderContent(item, i))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick nav pills */}
          {!searchTerm && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, justifyContent: "center" }}>
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                  border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 14px", fontSize: 12,
                  background: C.surface, color: C.text, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
                }}>{s.icon} {s.title}</button>
              ))}
            </div>
          )}

          {/* Section list */}
          {filtered.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              padding: "16px 20px", background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
              marginBottom: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{countSections(s.content)} seç{countSections(s.content) > 1 ? "ões" : "ão"}</div>
                </div>
              </div>
              <span style={{ fontSize: 16, color: C.textMuted }}>›</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 14 }}>Nenhum resultado para "{searchTerm}"</div>
          )}
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.textMuted }}>SGA — Sistema de Gestão de Atividades · v3.1</div>
    </div>
  );
}
