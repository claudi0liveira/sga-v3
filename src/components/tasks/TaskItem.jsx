"use client";
import { useState, useEffect, useRef } from "react";
import { C, STATUS, FEEDBACK_DONE, FEEDBACK_PARTIAL, FEEDBACK_SKIP } from "@/lib/constants";
import { randomFrom } from "@/lib/helpers";
import { StatusDot, ProgressBar, Btn } from "@/components/ui";

export default function TaskItem({ task, now, onUpdate, onEdit, onReschedule, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [fb, setFb] = useState(null);
  const timerRef = useRef(null);

  const [h, m] = task.startTime.split(":").map(Number);
  const sMin = h * 60 + m;
  const eMin = sMin + task.duration;
  const nMin = now.getHours() * 60 + now.getMinutes();

  const fin = [STATUS.DONE, STATUS.PARTIAL, STATUS.SKIPPED].includes(task.status);
  const run = task.timerRunning;
  const wasStarted = task.status === STATUS.ACTIVE || task.status === STATUS.PAUSED || (task.accumulatedTime || 0) > 0;
  const needs = !fin && (nMin >= sMin || wasStarted);

  const accM = (task.accumulatedTime || 0) / 60;
  const pct = task.duration > 0 ? (accM / task.duration) * 100 : 0;
  const rem = Math.max(0, Math.round(task.duration - accM));

  // Timer tick
  useEffect(() => {
    if (run && !fin) {
      timerRef.current = setInterval(() => {
        onUpdate(task.id, { accumulatedTime: (task.accumulatedTime || 0) + 1 });
      }, 1000);
      return () => clearInterval(timerRef.current);
    } else if (timerRef.current) clearInterval(timerRef.current);
  }, [run, fin]);

  const toggle = () => {
    if (fin) return;
    if (run) onUpdate(task.id, { timerRunning: false, status: STATUS.PAUSED });
    else onUpdate(task.id, { timerRunning: true, status: STATUS.ACTIVE });
  };

  const complete = (st) => {
    const pool = st === STATUS.DONE ? FEEDBACK_DONE : st === STATUS.PARTIAL ? FEEDBACK_PARTIAL : FEEDBACK_SKIP;
    setFb(randomFrom(pool));
    onUpdate(task.id, { status: st, timerRunning: false });
    setTimeout(() => setFb(null), 3500);
  };

  const pc = task.priority === "Alta" ? C.high : task.priority === "Média" ? C.medium : C.low;
  const eff = fin ? task.status : run ? STATUS.ACTIVE : task.status === STATUS.PAUSED ? STATUS.PAUSED : (wasStarted || nMin >= eMin) ? STATUS.PAUSED : task.status;

  return (
    <div style={{
      padding: "16px 18px", borderRadius: 14, background: C.surface,
      border: `1px solid ${eff === STATUS.ACTIVE ? C.active + "60" : C.border}`,
      marginBottom: 10, transition: "all .3s",
      boxShadow: eff === STATUS.ACTIVE ? `0 0 0 2px ${C.active}20` : "none",
      opacity: fin ? 0.65 : 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 8 }}>
          <StatusDot status={eff} priority={task.priority} />
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text, textDecoration: task.status === STATUS.DONE ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600, background: pc + "18", color: pc }}>{task.priority}</span>
          <span style={{ fontSize: 12, color: C.textMuted }}>{task.startTime}·{task.duration}m</span>
          {!fin && (
            <>
              <button onClick={() => onEdit(task)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, padding: 2, color: C.textMuted }}>✏️</button>
              <button onClick={() => onReschedule(task)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, padding: 2, color: C.textMuted }}>📅</button>
              <button onClick={() => setConfirmDel(true)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, padding: 2, color: C.textMuted }}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {/* Replan badge */}
      {task.replanCount > 0 && (
        <div style={{ fontSize: 11, color: C.overtime, marginBottom: 6, paddingLeft: 18 }}>
          ↻ Replanejada{task.replanCount > 1 ? ` ${task.replanCount}x` : ""}
          {task.replanFrom ? ` do dia ${new Date(task.replanFrom + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}` : ""}
        </div>
      )}

      {/* Range badge */}
      {task.rangeTotal > 0 && (
        <div style={{ display: "inline-flex", fontSize: 11, color: C.accent, marginBottom: 6, marginLeft: 18, padding: "2px 8px", background: C.accent + "12", borderRadius: 6, fontWeight: 600 }}>
          📋 {task.rangeIndex}/{task.rangeTotal}
        </div>
      )}

      {/* Note */}
      {task.note && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, paddingLeft: 18 }}>{task.note}</div>}

      {/* Todos checklist */}
      {task.todos?.length > 0 && (
        <div style={{ marginBottom: 8, paddingLeft: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {task.todos.map((td) => (
              <button key={td.id} onClick={() => {
                const up = task.todos.map((t) => t.id === td.id ? { ...t, done: !t.done } : t);
                onUpdate(task.id, { todos: up });
              }} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", border: "none",
                borderRadius: 8, background: td.done ? C.done + "10" : C.bg, cursor: "pointer",
                textAlign: "left", fontFamily: "'DM Sans',sans-serif",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, border: `2px solid ${td.done ? C.done : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: td.done ? C.done : "transparent", flexShrink: 0,
                }}>
                  {td.done ? <span style={{ color: "#fff", fontSize: 12 }}>✓</span> : <span style={{ color: C.overtime, fontSize: 10 }}>✕</span>}
                </span>
                <span style={{ fontSize: 12, color: td.done ? C.done : C.text, textDecoration: td.done ? "line-through" : "none" }}>{td.text}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, paddingLeft: 4 }}>
            {task.todos.filter((t) => t.done).length} de {task.todos.length} concluído{task.todos.filter((t) => t.done).length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Progress + Timer */}
      {needs && (
        <div style={{ marginTop: 8 }}>
          <ProgressBar pct={pct} color={pct > 100 ? C.overtime : C.active} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggle} style={{
                border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                background: run ? C.accent + "20" : C.done + "20", color: run ? C.accent : C.done,
              }}>{run ? "⏸ Pausar" : "▶ Retomar"}</button>
              <span style={{ fontSize: 11, color: run ? C.active : C.textMuted }}>{run ? "Em andamento" : "Pausado"}</span>
            </div>
            <span style={{ fontSize: 11, color: C.textMuted }}>{rem > 0 ? `${rem}m restantes` : "Tempo encerrado"}</span>
          </div>
        </div>
      )}

      {/* Complete buttons */}
      {needs && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: C.bg, borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>Você concluiu essa tarefa?</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn v="done" onClick={() => complete(STATUS.DONE)} style={{ fontSize: 13 }}>✅ Sim</Btn>
            <Btn v="ghost" onClick={() => complete(STATUS.PARTIAL)} style={{ fontSize: 13, background: C.medium + "20", color: C.medium, border: "none" }}>◐ Parcialmente</Btn>
            <Btn v="ghost" onClick={() => complete(STATUS.SKIPPED)} style={{ fontSize: 13 }}>○ Não</Btn>
          </div>
        </div>
      )}

      {/* Feedback */}
      {fb && <div style={{ marginTop: 10, padding: "10px 14px", background: C.done + "12", borderRadius: 10, fontSize: 13, color: C.done, fontStyle: "italic", animation: "fadeIn .4s ease" }}>{fb}</div>}

      {/* Finished status */}
      {fin && !fb && <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted, paddingLeft: 18 }}>{task.status === STATUS.DONE ? "✓ Concluída" : task.status === STATUS.PARTIAL ? "◐ Parcial" : "○ Não realizada"}</div>}

      {/* Confirm delete */}
      {confirmDel && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: C.overtime + "10", borderRadius: 10, animation: "fadeIn .3s ease" }}>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>Remover esta tarefa?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="danger" onClick={() => onDelete(task.id)} style={{ fontSize: 13 }}>Remover</Btn>
            <Btn v="ghost" onClick={() => setConfirmDel(false)} style={{ fontSize: 13 }}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
