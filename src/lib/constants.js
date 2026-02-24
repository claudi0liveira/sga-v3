// ─── Colors ───
export const C = {
  bg: "#0F0F17",
  surface: "#161622",
  text: "#EAEAF0",
  textMuted: "#777790",
  border: "#2A2A3E",
  accent: "#9B6BB5",
  high: "#D4645A",
  medium: "#D4A843",
  low: "#5B8FB5",
  done: "#5BA87A",
  active: "#9B6BB5",
  overtime: "#D4645A",
  warm: "#1A1A28",
};

// ─── Task Status ───
export const STATUS = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  PAUSED: "paused",
  DONE: "done",
  PARTIAL: "partial",
  SKIPPED: "skipped",
};

// ─── Block Order ───
export const BLOCKS = [
  { key: "Abertura", label: "🌅 Abertura" },
  { key: "Altas", label: "🔴 Alta Prioridade" },
  { key: "Médias", label: "🟡 Média Prioridade" },
  { key: "Baixas", label: "🔵 Baixa Prioridade" },
  { key: "Fechamento", label: "🌙 Fechamento" },
];

export function getBlock(priority) {
  if (priority === "Alta") return "Altas";
  if (priority === "Média") return "Médias";
  return "Baixas";
}

// ─── Feedback Messages ───
export const FEEDBACK_DONE = [
  "Excelente! Compromisso honrado.",
  "Missão cumprida. Próxima!",
  "Mais uma entregue. Consistência é poder.",
  "Feito. O progresso é real.",
  "Boa! Cada entrega conta.",
];

export const FEEDBACK_PARTIAL = [
  "Começou. Isso já é muito.",
  "Parcial hoje, total amanhã.",
  "O progresso não precisa ser perfeito.",
  "Você tentou. Isso importa.",
];

export const FEEDBACK_SKIP = [
  "Tudo bem. Amanhã é novo.",
  "Nem todo dia é 100%. Segue o plano.",
  "Replanejar não é falhar. É escolher continuar.",
  "A jornada continua. Um passo de cada vez.",
];

export const INSIGHTS = [
  "Dias com abertura feita tendem a ter melhor execução.",
  "Tarefas de Alta prioridade funcionam melhor no primeiro bloco.",
  "Consistência > intensidade. Melhor 30min todo dia do que 4h uma vez.",
  "Pausar o timer é melhor do que deixar correr sem atenção.",
  "Micro-tarefas (to-dos) quebram a resistência de começar.",
  "Fechar o dia com nota cria um diário poderoso ao longo do tempo.",
  "Replanejar é sinal de consciência, não de falha.",
  "Prioridades claras eliminam a paralisia de decisão.",
  "O bloco de fechamento é o melhor momento pra planejar o amanhã.",
  "Revisar a semana na sexta ajuda a começar a segunda com clareza.",
];

export const PRIORITY_COLORS = ["#D4645A", "#D4A843", "#5B8FB5", "#5BA87A", "#9B6BB5"];

export const DEFAULT_CATEGORIES = [
  "Moradia", "Transporte", "Alimentação", "Saúde",
  "Lazer", "Educação", "Assinaturas", "Outros",
];

// ─── Liberty Milestones ───
export const MILESTONES = [
  { days: 1, label: "1 dia", benefit: "Pressão arterial e batimentos começam a normalizar." },
  { days: 3, label: "3 dias", benefit: "Nicotina eliminada do corpo. Olfato e paladar melhoram." },
  { days: 7, label: "1 semana", benefit: "Terminações nervosas começam a se regenerar." },
  { days: 14, label: "2 semanas", benefit: "Circulação melhora. Caminhar fica mais fácil." },
  { days: 21, label: "3 semanas", benefit: "Dependência psicológica enfraquece significativamente." },
  { days: 30, label: "1 mês", benefit: "Função pulmonar aumenta até 30%. Menos tosses." },
  { days: 60, label: "2 meses", benefit: "Ansiedade e irritabilidade diminuem bastante." },
  { days: 90, label: "3 meses", benefit: "Cílios pulmonares regenerados. Risco de infecção cai." },
  { days: 120, label: "4 meses", benefit: "Pele mais saudável, energia estável." },
  { days: 180, label: "6 meses", benefit: "Tosse crônica desaparece. Resistência física cresce." },
  { days: 365, label: "1 ano", benefit: "Risco de doença cardíaca cai pela metade!" },
];
