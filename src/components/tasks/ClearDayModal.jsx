"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import { Btn, Modal } from "@/components/ui";

export default function ClearDayModal({ tasks, onDelete, onClose }) {
  const [exc, setExc] = useState(() => {
    const e = {};
    tasks.forEach((t) => { e[t.id] = false; }); // false = will delete
    return e;
  });

  const toDelete = tasks.filter((t) => !exc[t.id]);
  const toKeep = tasks.filter((t) => exc[t.id]);

  return (
    <Modal open onClose={onClose} title="🗑 Limpar dia">
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
        Selecione as tarefas que deseja <strong style={{ color: C.overtime }}>remover</strong>. Desmarque para manter.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        {tasks.map((t) => {
          const willDel = !exc[t.id];
          const pc = t.priority === "Alta" ? C.high : t.priority === "Média" ? C.medium : C.low;
          return (
            <button key={t.id} onClick={() => setExc((p) => ({ ...p, [t.id]: !p[t.id] }))} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
              border: `1px solid ${willDel ? C.overtime + "40" : C.done + "40"}`, cursor: "pointer",
              background: willDel ? C.overtime + "06" : C.done + "06",
              fontFamily: "'DM Sans',sans-serif", textAlign: "left", width: "100%",
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${willDel ? C.overtime : C.done}`,
                background: willDel ? C.overtime : C.done,
              }}>
                <span style={{ color: "#fff", fontSize: 11 }}>{willDel ? "✕" : "✓"}</span>
              </span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: pc, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: willDel ? C.overtime : C.text, flex: 1, textDecoration: willDel ? "line-through" : "none", fontWeight: 500 }}>{t.name}</span>
              <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>{t.startTime}·{t.duration}m</span>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, padding: "8px 12px", background: C.bg, borderRadius: 8 }}>
        {toDelete.length} tarefa{toDelete.length !== 1 ? "s" : ""} será{toDelete.length !== 1 ? "ão" : ""} removida{toDelete.length !== 1 ? "s" : ""} · {toKeep.length} mantida{toKeep.length !== 1 ? "s" : ""}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="danger" onClick={() => { toDelete.forEach((t) => onDelete(t.id)); onClose(); }} disabled={toDelete.length === 0}>
          Remover {toDelete.length} tarefa{toDelete.length !== 1 ? "s" : ""}
        </Btn>
      </div>
    </Modal>
  );
}
