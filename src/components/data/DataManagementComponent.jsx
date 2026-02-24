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

export default function DataManagementComponent() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState(null);
  const [dataCounts, setDataCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

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
      const backup = { version: "sga-v3.0", exported_at: new Date().toISOString(), user_id: user.id };
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
      setStatus({ type: "success", msg: `Backup exportado! ${total} registros em ${TABLES.filter((t) => (backup[t.key]?.length || 0) > 0).length} tabelas.` });
    } catch (err) {
      setStatus({ type: "error", msg: `Erro: ${err.message}` });
    }
    setLoading(false);
  };

  const handleImport = async (file) => {
    if (!user || !file) return;
    setImporting(true);
    setStatus(null);
    try {
      const data = JSON.parse(await file.text());
      if (!data.version) { setStatus({ type: "error", msg: "Arquivo inválido." }); setImporting(false); return; }
      let imported = 0;
      const errs = [];
      const order = ["phase", "priorities", "quick_links", "liberty", "preferences", "incomes", "expenses", "reserves", "reserve_items", "liberty_entries", "tasks", "day_history"];
      for (const table of order) {
        const rows = data[table];
        if (!rows || !rows.length) continue;
        for (const row of rows) {
          const prepared = table === "reserve_items" ? row : { ...row, user_id: user.id };
          const { error } = await supabase.from(table).upsert(prepared, { onConflict: "id" });
          if (error) errs.push(`${table}: ${error.message}`);
          else imported++;
        }
      }
      setStatus(errs.length > 0
        ? { type: "warning", msg: `${imported} importados, ${errs.length} erros. Ex: ${errs[0]}` }
        : { type: "success", msg: `${imported} registros importados! Recarregue a página.` });
    } catch (err) {
      setStatus({ type: "error", msg: `Erro ao ler: ${err.message}` });
    }
    setImporting(false);
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

      {/* Cloud banner */}
      <div style={{ padding: "16px 20px", background: "#6C3FB510", borderRadius: 14, border: "1px solid #6C3FB530", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6C3FB5", marginBottom: 6 }}>☁️ Seus dados estão na nuvem</div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          Seus dados ficam salvos no Supabase (banco na nuvem). Você acessa de qualquer dispositivo com seu login.
          Mesmo assim, backups regulares são uma boa prática de segurança.
        </div>
      </div>

      {/* Export / Import */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ padding: "22px 24px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📤</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Exportar</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Baixa um arquivo .json com todos os seus dados.
          </div>
          <Btn onClick={handleExport} disabled={loading} style={{ width: "100%", fontSize: 13 }}>
            {loading ? "Exportando..." : "💾 Exportar Backup"}
          </Btn>
        </div>
        <div style={{ padding: "22px 24px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📥</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Importar</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Restaura dados de um backup .json anterior.
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
          <p style={{ margin: "0 0 8px" }}>O <strong>localStorage</strong> é um espaço dentro do navegador. A versão anterior do SGA salvava dados ali. Problema: se limpar os dados do browser, trocar de PC ou usar outro navegador, perde tudo.</p>
          <p style={{ margin: 0 }}>Na v3.0, seus dados ficam no <strong>Supabase</strong> (banco na nuvem). Acesse de qualquer dispositivo.</p>
        </InfoCard>
        <InfoCard emoji="📤" title="O que o Export faz?">
          <p style={{ margin: "0 0 8px" }}>Lê todas as suas informações do banco e gera um arquivo <strong>.json</strong> — texto estruturado que qualquer sistema pode ler.</p>
          <p style={{ margin: 0 }}>O arquivo é baixado no computador. Guarde no Google Drive, Dropbox, ou onde preferir. É uma foto dos seus dados naquele momento.</p>
        </InfoCard>
        <InfoCard emoji="📥" title="O que o Import faz?">
          <p style={{ margin: "0 0 8px" }}>Lê um arquivo .json e <strong>restaura</strong> os dados. Se um registro já existe (mesmo ID), é atualizado. Se é novo, é criado.</p>
          <p style={{ margin: 0 }}><strong>Não apaga</strong> dados existentes. Só adiciona ou atualiza. Para começar do zero, delete manualmente no Supabase.</p>
        </InfoCard>
      </div>
    </div>
  );
}
