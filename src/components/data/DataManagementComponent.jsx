"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import { Btn } from "@/components/ui";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/hooks/useAuth";

const TABLES = [
  { key: "tasks", label: "Tarefas", icon: "📋", desc: "Tarefas agendadas" },
  { key: "day_history", label: "Histórico", icon: "📅", desc: "Dias encerrados" },
  { key: "incomes", label: "Rendas", icon: "💰", desc: "Fontes de renda" },
  { key: "expenses", label: "Despesas", icon: "💸", desc: "Despesas por mês" },
  { key: "reserves", label: "Reservas", icon: "🐷", desc: "Reservas" },
  { key: "reserve_items", label: "Depósitos", icon: "📦", desc: "Itens de reserva" },
  { key: "priorities", label: "Prioridades", icon: "🎯", desc: "Prioridades" },
  { key: "phase", label: "Fase", icon: "🏷️", desc: "Fase atual" },
  { key: "quick_links", label: "Links", icon: "🔗", desc: "Atalhos" },
  { key: "liberty", label: "Liberdade", icon: "🚭", desc: "Data jornada" },
  { key: "liberty_entries", label: "Reg. Liberdade", icon: "📝", desc: "Vontades/vitórias" },
  { key: "preferences", label: "Preferências", icon: "⚙️", desc: "Configurações" },
];

function InfoCard({ emoji, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
        padding: "14px 18px", border: "none", background: "transparent", cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: C.textMuted, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px", fontSize: 13, color: C.textMuted, lineHeight: 1.7, animation: "fadeIn .2s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Convert legacy fluxo backup to v3 format
function convertLegacy(data, userId) {
  const result = { tasks: [], day_history: [], incomes: [], expenses: [], reserves: [], reserve_items: [], priorities: [], phase: [], quick_links: [], liberty: [], liberty_entries: [] };

  // Tasks: fluxo_tasks = { "2026-02-19": [task, task, ...], ... }
  if (data.fluxo_tasks) {
    for (const [date, tasks] of Object.entries(data.fluxo_tasks)) {
      for (const t of tasks) {
        result.tasks.push({
          user_id: userId,
          date,
          name: t.name || "Sem nome",
          priority: t.priority || "Média",
          start_time: t.startTime || "09:00",
          duration: t.duration || 30,
          status: t.status === "done" || t.status === true ? "done" : t.status === "partial" ? "partial" : t.status === "skipped" ? "skipped" : "scheduled",
          note: t.note || null,
          todos: t.todos || [],
          block: t.block || null,
          range_group: t.rangeGroup || null,
          range_index: t.rangeIndex != null ? t.rangeIndex : null,
          range_total: t.rangeTotal != null ? t.rangeTotal : null,
          weekly_tag: t.weeklyTag || null,
          replan_count: t.replanCount || 0,
          replan_from: t.replanFrom || null,
        });
      }
    }
  }

  // History: fluxo_history = { "2026-02-18": [snapshot], ... }
  if (data.fluxo_history) {
    for (const [date, snapshot] of Object.entries(data.fluxo_history)) {
      result.day_history.push({
        user_id: userId,
        date,
        snapshot: Array.isArray(snapshot) ? snapshot : [],
        note: null,
      });
    }
  }

  // Finance
  if (data.fluxo_finance) {
    const fin = data.fluxo_finance;
    // Incomes
    (fin.incomes || []).forEach((inc) => {
      result.incomes.push({
        user_id: userId,
        name: inc.label || inc.name || "Renda",
        value: Number(inc.value) || 0,
        pay_day: inc.day || 5,
      });
    });
    // Expenses
    (fin.expenses || []).forEach((exp) => {
      const monthData = fin.monthlyData || {};
      let paid = exp.paid || false;
      // Check monthlyData for paid status
      for (const [mk, md] of Object.entries(monthData)) {
        if (md[exp.id] && md[exp.id].paid) paid = true;
      }
      result.expenses.push({
        user_id: userId,
        month_key: exp.createdAt ? exp.createdAt.slice(0, 7) : "2026-02",
        name: exp.name || "Despesa",
        value: Number(exp.value) || 0,
        category: exp.category || "Outros",
        paid,
      });
    });
    // Reserves
    (fin.reserves || []).forEach((res) => {
      const resId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      result.reserves.push({
        id: resId,
        user_id: userId,
        name: res.name || "Reserva",
      });
      (res.items || []).forEach((item) => {
        result.reserve_items.push({
          reserve_id: resId,
          label: item.label || "Depósito",
          value: Number(item.value) || 0,
        });
      });
    });
  }

  // Priorities
  if (data.fluxo_priorities) {
    data.fluxo_priorities.forEach((p, i) => {
      result.priorities.push({
        user_id: userId,
        text: p.text || "",
        icon: p.icon || "🎯",
        description: p.desc || null,
        sort_order: i,
      });
    });
  }

  // Phase
  if (data.fluxo_phase) {
    result.phase.push({
      user_id: userId,
      title: data.fluxo_phase.title || null,
      quote: data.fluxo_phase.quote || null,
    });
  }

  // Quick Links
  if (data.fluxo_links) {
    data.fluxo_links.forEach((l, i) => {
      result.quick_links.push({
        user_id: userId,
        label: l.label || "Link",
        url: l.url || "",
        sort_order: i,
      });
    });
  }

  // Liberty
  if (data.fluxo_liberty) {
    const lib = data.fluxo_liberty;
    if (lib.smokeDate) {
      result.liberty.push({ user_id: userId, smoke_date: lib.smokeDate });
    }
    (lib.cravings || []).forEach((c) => {
      result.liberty_entries.push({
        user_id: userId,
        type: "craving",
        text: c.text || "",
      });
    });
    (lib.victories || []).forEach((v) => {
      result.liberty_entries.push({
        user_id: userId,
        type: "victory",
        text: v.text || "",
      });
    });
  }

  return result;
}

export default function DataManagementComponent() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState(null);
  const [dataCounts, setDataCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  const loadCounts = async () => {
    if (!user) return;
    setLoadingCounts(true);
    const counts = {};
    for (const t of TABLES) {
      try {
        if (t.key === "reserve_items") {
          const { data: res } = await supabase.from("reserves").select("id").eq("user_id", user.id);
          if (res && res.length > 0) {
            const { count } = await supabase.from("reserve_items").select("*", { count: "exact", head: true }).in("reserve_id", res.map((r) => r.id));
            counts[t.key] = count || 0;
          } else { counts[t.key] = 0; }
        } else {
          const { count } = await supabase.from(t.key).select("*", { count: "exact", head: true }).eq("user_id", user.id);
          counts[t.key] = count || 0;
        }
      } catch { counts[t.key] = "?"; }
    }
    setDataCounts(counts);
    setLoadingCounts(false);
  };

  const handleExport = async () => {
    if (!user) return;
    setLoading(true);
    setStatus(null);
    try {
      const backup = { version: "sga-v3.1", exported_at: new Date().toISOString(), user_id: user.id };
      for (const t of TABLES) {
        if (t.key === "reserve_items") {
          const { data: res } = await supabase.from("reserves").select("id").eq("user_id", user.id);
          if (res && res.length > 0) {
            const { data } = await supabase.from("reserve_items").select("*").in("reserve_id", res.map((r) => r.id));
            backup[t.key] = data || [];
          } else { backup[t.key] = []; }
        } else {
          const { data } = await supabase.from(t.key).select("*").eq("user_id", user.id);
          backup[t.key] = data || [];
        }
      }
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sga-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const total = TABLES.reduce((s, t) => s + (backup[t.key]?.length || 0), 0);
      setStatus({ type: "success", msg: `Backup exportado! ${total} registros.` });
    } catch (err) {
      setStatus({ type: "error", msg: `Erro: ${err.message}` });
    }
    setLoading(false);
  };

  const handleImport = async (file) => {
    if (!user || !file) return;
    setImporting(true);
    setStatus(null);
    setImportProgress(null);

    try {
      const raw = JSON.parse(await file.text());

      // Detect format: v3 (has "version" starting with "sga") or legacy (has "fluxo_tasks")
      const isLegacy = !!raw.fluxo_tasks || !!raw._meta;
      const isV3 = raw.version && raw.version.startsWith("sga");

      if (!isLegacy && !isV3) {
        setStatus({ type: "error", msg: "Formato não reconhecido. Aceita backup do SGA v3 ou do Fluxo (localStorage)." });
        setImporting(false);
        return;
      }

      let data;
      if (isLegacy) {
        setImportProgress("Convertendo formato antigo → v3...");
        data = convertLegacy(raw, user.id);
        
        // Clean existing data before legacy import to avoid duplicates
        setImportProgress("Limpando dados antigos para reimportar...");
        const cleanOrder = ["day_history", "liberty_entries", "reserve_items", "tasks", "expenses", "incomes", "reserves", "priorities", "quick_links", "liberty", "phase"];
        for (const table of cleanOrder) {
          if (table === "reserve_items") {
            const { data: res } = await supabase.from("reserves").select("id").eq("user_id", user.id);
            if (res?.length) await supabase.from("reserve_items").delete().in("reserve_id", res.map(r => r.id));
          } else {
            await supabase.from(table).delete().eq("user_id", user.id);
          }
        }
      } else {
        data = raw;
      }

      let imported = 0;
      let errors = 0;
      const order = isLegacy
        ? ["phase", "priorities", "quick_links", "liberty", "liberty_entries", "incomes", "expenses", "reserves", "reserve_items", "tasks", "day_history"]
        : ["phase", "priorities", "quick_links", "liberty", "preferences", "incomes", "expenses", "reserves", "reserve_items", "liberty_entries", "tasks", "day_history"];

      for (const table of order) {
        const rows = data[table];
        if (!rows || !rows.length) continue;
        setImportProgress(`Importando ${table} (${rows.length} registros)...`);

        if (isLegacy) {
          // Batch insert for legacy (no IDs to conflict)
          const batchSize = 25;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const { error } = await supabase.from(table).insert(batch);
            if (error) {
              console.warn(`Batch error on ${table}[${i}]:`, error.message);
              // Try one by one on batch fail
              for (const row of batch) {
                const { error: e2 } = await supabase.from(table).insert(row);
                if (e2) {
                  errors++;
                  if (errors <= 5) console.error(`Row error on ${table}:`, e2.message, JSON.stringify(row).slice(0, 200));
                } else {
                  imported++;
                }
              }
            } else {
              imported += batch.length;
            }
            // Progress update
            setImportProgress(`Importando ${table} (${Math.min(i + batchSize, rows.length)}/${rows.length})...`);
          }
        } else {
          // Upsert for v3 format
          for (const row of rows) {
            const prepared = table === "reserve_items" ? row : { ...row, user_id: user.id };
            const { error } = await supabase.from(table).upsert(prepared, { onConflict: "id" });
            if (error) errors++;
            else imported++;
          }
        }
      }

      setImportProgress(null);
      const format = isLegacy ? "Fluxo (localStorage)" : "SGA v3";
      setStatus(errors > 0
        ? { type: "warning", msg: `Formato ${format}: ${imported} importados, ${errors} erros.` }
        : { type: "success", msg: `Formato ${format}: ${imported} registros importados! Recarregue a página.` });
    } catch (err) {
      setStatus({ type: "error", msg: `Erro: ${err.message}` });
    }
    setImporting(false);
    setImportProgress(null);
  };

  const fileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => { if (e.target.files[0]) handleImport(e.target.files[0]); };
    input.click();
  };

  return (
    <div style={{ animation: "fadeIn .4s ease", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: C.text, marginBottom: 4 }}>Dados & Backup</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Exporte e importe seus dados do SGA</div>

      {status && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontSize: 13, animation: "fadeIn .3s ease",
          background: status.type === "success" ? "#5BA87A15" : status.type === "warning" ? "#D4770B15" : "#C0392B15",
          border: `1px solid ${status.type === "success" ? "#5BA87A30" : status.type === "warning" ? "#D4770B30" : "#C0392B30"}`,
          color: status.type === "success" ? "#5BA87A" : status.type === "warning" ? "#D4770B" : "#C0392B",
        }}>
          {status.type === "success" ? "✅" : status.type === "warning" ? "⚠️" : "❌"} {status.msg}
        </div>
      )}

      {importProgress && (
        <div style={{ padding: "10px 16px", borderRadius: 10, marginBottom: 12, fontSize: 12, background: C.accent + "10", border: `1px solid ${C.accent}30`, color: C.accent, animation: "fadeIn .2s ease" }}>
          ⏳ {importProgress}
        </div>
      )}

      {/* Cloud banner */}
      <div style={{ padding: "16px 20px", background: "#6C3FB510", borderRadius: 14, border: "1px solid #6C3FB530", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6C3FB5", marginBottom: 6 }}>☁️ Seus dados estão na nuvem</div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          Seus dados ficam salvos no Supabase. Backups regulares são uma boa prática.
          O Import aceita tanto backups do SGA v3 quanto do Fluxo antigo (localStorage).
        </div>
      </div>

      {/* Export / Import */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ padding: "22px 24px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📤</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Exportar</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Baixa .json com todos os dados.
          </div>
          <Btn onClick={handleExport} disabled={loading} style={{ width: "100%", fontSize: 13 }}>
            {loading ? "Exportando..." : "💾 Exportar Backup"}
          </Btn>
        </div>
        <div style={{ padding: "22px 24px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📥</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Importar</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Aceita backup v3 ou Fluxo antigo.
          </div>
          <Btn v="ghost" onClick={fileInput} disabled={importing} style={{ width: "100%", fontSize: 13, border: `1px solid ${C.border}` }}>
            {importing ? "Importando..." : "📂 Selecionar Arquivo"}
          </Btn>
        </div>
      </div>

      {/* Data overview */}
      <div style={{ padding: "22px 24px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>📊 Seus Dados</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Resumo do armazenamento</div>
          </div>
          <Btn v="ghost" onClick={loadCounts} disabled={loadingCounts} style={{ fontSize: 11, padding: "6px 14px" }}>
            {loadingCounts ? "..." : "🔄 Contar"}
          </Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {TABLES.map((t) => (
            <div key={t.key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{t.desc}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: dataCounts[t.key] > 0 ? "#5BA87A" : C.textMuted, minWidth: 28, textAlign: "right" }}>
                {dataCounts[t.key] !== undefined ? dataCounts[t.key] : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12 }}>❓ Dúvidas Frequentes</div>
        <InfoCard emoji="💾" title="O que é localStorage?">
          <p style={{ margin: "0 0 8px" }}>O <strong>localStorage</strong> é um espaço dentro do navegador. A versão anterior do SGA (Fluxo) salvava dados ali. Se limpar os dados do browser ou trocar de PC, perdia tudo.</p>
          <p style={{ margin: 0 }}>Na v3.0, dados ficam no <strong>Supabase</strong> (nuvem). Acesse de qualquer dispositivo.</p>
        </InfoCard>
        <InfoCard emoji="📤" title="O que o Export faz?">
          <p style={{ margin: 0 }}>Lê todas as informações do banco e gera um <strong>.json</strong>. Guarde no Google Drive ou Dropbox como backup.</p>
        </InfoCard>
        <InfoCard emoji="📥" title="O que o Import faz?">
          <p style={{ margin: "0 0 8px" }}>Lê um .json e restaura os dados. Aceita <strong>dois formatos</strong>:</p>
          <p style={{ margin: "0 0 4px" }}>• <strong>SGA v3</strong>: backup exportado pelo próprio sistema (upsert — atualiza ou cria)</p>
          <p style={{ margin: 0 }}>• <strong>Fluxo antigo</strong>: backup do app localStorage (converte automaticamente para o formato v3)</p>
        </InfoCard>
        <InfoCard emoji="🔄" title="Posso importar dados do Fluxo antigo?">
          <p style={{ margin: "0 0 8px" }}><strong>Sim!</strong> O sistema detecta automaticamente o formato. Ao importar um backup do Fluxo:</p>
          <p style={{ margin: "0 0 4px" }}>• Tarefas (com todos os campos: prioridade, timer, todos, etc.)</p>
          <p style={{ margin: "0 0 4px" }}>• Finanças (rendas, despesas, reservas com itens)</p>
          <p style={{ margin: "0 0 4px" }}>• Prioridades e fase atual</p>
          <p style={{ margin: "0 0 4px" }}>• Links rápidos</p>
          <p style={{ margin: "0 0 4px" }}>• Jornada da Liberdade (data, vontades, vitórias)</p>
          <p style={{ margin: 0 }}>• Histórico de dias encerrados</p>
        </InfoCard>
      </div>
    </div>
  );
}
