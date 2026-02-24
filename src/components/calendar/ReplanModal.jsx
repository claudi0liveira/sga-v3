"use client";
import { useState, useEffect } from "react";
import { C } from "@/lib/constants";
import { Btn } from "@/components/ui";
import { todayKey, fmtDateShort } from "@/lib/helpers";

export default function ReplanModal({ pendingTasks, onReplan, onDismiss }) {
  const [tasks, setTasks] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem("sga_replan_date");
      if (last === todayKey()) { setDismissed(true); return; }
    } catch {}
    setTasks(pendingTasks.map((t) => ({ ...t, action: "replan" })));
  }, [pendingTasks]);

  if (dismissed || tasks.length === 0) return null;

  const handleConfirm = async () => {
    const today = todayKey();
    for (const t of tasks) {
      if (t.action === "replan") {
        await onReplan(t.id, today, t.date);
      }
    }
    try { localStorage.setItem("sga_replan_date", today); } catch {}
    setDismissed(true);
  };

  const handleDismiss = () => {
    try { localStorage.setItem("sga_replan_date", todayKey()); } catch {}
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const toggleAction = (id) => {
    setTasks((prev) => prev.map((t) =>
      t.id === id ? { ...t, action: t.action === "replan" ? "archive" : "replan" } : t
    ));
  };

  const replanCount = tasks.filter((t) => t.action === "replan").length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={handleDismiss} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 500, maxHeight: "80vh", overflow: "auto",
        background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`,
        padding: 24, animation: "fadeIn .3s ease", boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Fraunces',serif" }}>Replanejamento</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""} pendente{tasks.length !== 1 ? "s" : ""} de dias anteriores
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          {tasks.map((t) => {
            const isReplan = t.action === "replan";
            const priorityColor = t.priority === "Alta" ? C.high : t.priority === "Média" ? C.medium : "#5B8FB5";
            return (
              <button key={t.id} onClick={() => toggleAction(t.id)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px",
                background: isReplan ? C.done + "10" : C.bg, borderRadius: 12, marginBottom: 6,
                border: `1px solid ${isReplan ? C.done + "30" : C.border}`, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all .2s",
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: isReplan ? C.done : C.border, color: "#fff", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{isReplan ? "↻" : "—"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: isReplan ? C.text : C.textMuted, textDecoration: isReplan ? "none" : "line-through", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, display: "flex", gap: 8 }}>
                    <span style={{ color: priorityColor }}>● {t.priority}</span>
                    <span>de {fmtDateShort(t.date)}</span>
                    {t.replanCount > 0 && <span>↻ {t.replanCount}x</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: isReplan ? C.done : C.textMuted, fontWeight: 600, flexShrink: 0 }}>
                  {isReplan ? "Mover p/ hoje" : "Ignorar"}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginBottom: 14 }}>
          Toque em uma tarefa para alternar entre mover e ignorar
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="ghost" onClick={handleDismiss} style={{ flex: 1 }}>Depois</Btn>
          <Btn onClick={handleConfirm} style={{ flex: 2 }}>
            {replanCount > 0 ? `Mover ${replanCount} tarefa${replanCount !== 1 ? "s" : ""} para hoje` : "Confirmar"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
