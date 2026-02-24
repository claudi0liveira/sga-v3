"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import { Btn, Modal } from "@/components/ui";

export default function WeekendReviewModal({ weekendTasks, onFinish, onClose }) {
  const [dec, setDec] = useState(() => {
    const d = {};
    weekendTasks.forEach((t) => { d[t.id] = "keep"; });
    return d;
  });

  return (
    <Modal open onClose={onClose} title="📅 Review do Fim de Semana">
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
        Sexta encerrada! Revise suas atividades do fim de semana:
      </div>
      {weekendTasks.map((t) => {
        const pc = t.priority === "Alta" ? C.high : t.priority === "Média" ? C.medium : C.low;
        return (
          <div key={t.id} style={{ padding: 12, background: C.bg, borderRadius: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{t._day} · {t.startTime} · {t.duration}min</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: pc + "15", color: pc, fontWeight: 600 }}>{t.priority}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["keep", "remove"].map((v) => (
                <button key={v} onClick={() => setDec((p) => ({ ...p, [t.id]: v }))} style={{
                  flex: 1, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  border: `1px solid ${dec[t.id] === v ? (v === "keep" ? C.done : C.overtime) : C.border}`,
                  background: dec[t.id] === v ? (v === "keep" ? C.done : C.overtime) + "12" : "transparent",
                  color: dec[t.id] === v ? (v === "keep" ? C.done : C.overtime) : C.textMuted,
                }}>
                  {v === "keep" ? "✓ Manter" : "✕ Remover"}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <Btn v="ghost" onClick={onClose}>Pular</Btn>
        <Btn onClick={() => onFinish(dec)}>Confirmar</Btn>
      </div>
    </Modal>
  );
}
