"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { C, STATUS, BLOCKS, getBlock } from "@/lib/constants";
import { todayKey, isToday, isFuture, isPast, addDays, fmtTime } from "@/lib/helpers";
import { ProgressBar, Btn, Card, Modal } from "@/components/ui";
import { useNow } from "@/hooks/useNow";
import TaskForm from "@/components/tasks/TaskForm";
import TaskItem from "@/components/tasks/TaskItem";
import EditModal from "@/components/tasks/EditModal";
import RescheduleModal from "@/components/tasks/RescheduleModal";
import ClearDayModal from "@/components/tasks/ClearDayModal";
import WeekendReviewModal from "@/components/tasks/WeekendReviewModal";

export default function DayViewComponent({ selectedDate, tasks, allTasks, onAddTask, onAddBatch, onUpdate, onCloseDay, onDelete, onReschedule }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useNow(5000);

  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const taskRefs = useRef({});
  const [editingTask, setEditingTask] = useState(null);
  const [reschedulingTask, setReschedulingTask] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [dayNote, setDayNote] = useState("");
  const [showClearDay, setShowClearDay] = useState(false);
  const [showWeekendReview, setShowWeekendReview] = useState(false);

  const focusId = searchParams?.get("focus") || null;

  // Scroll to focused task
  useEffect(() => {
    if (focusId && taskRefs.current[focusId]) {
      setTimeout(() => {
        taskRefs.current[focusId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        const el = taskRefs.current[focusId];
        if (el) {
          el.style.boxShadow = `0 0 0 3px ${C.accent}60`;
          setTimeout(() => { el.style.boxShadow = "none"; }, 2000);
        }
      }, 300);
    }
  }, [focusId]);

  const isTod = isToday(selectedDate);
  const isFut = isFuture(selectedDate);
  const isPst = isPast(selectedDate);
  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const isFriday = new Date(selectedDate + "T12:00:00").getDay() === 5;

  // Weekend tasks for Friday review
  const weekendTasks = useMemo(() => {
    if (!isFriday || !allTasks || !isTod) return [];
    const sat = addDays(selectedDate, 1);
    const sun = addDays(selectedDate, 2);
    return [
      ...(allTasks[sat] || []).map((t) => ({ ...t, _day: "Sábado" })),
      ...(allTasks[sun] || []).map((t) => ({ ...t, _day: "Domingo" })),
    ];
  }, [isFriday, allTasks, selectedDate, isTod]);

  const handleCloseDay = () => {
    if (isFriday && weekendTasks.length > 0) setShowWeekendReview(true);
    else setShowCloseModal(true);
  };

  const finishWeekendReview = (decisions) => {
    Object.entries(decisions).forEach(([id, dec]) => {
      if (dec === "remove") onDelete(id);
    });
    setShowWeekendReview(false);
    setShowCloseModal(true);
  };

  // ── SEPARAR ATIVAS vs CONCLUÍDAS ──────────────────────
  const finishedStatuses = [STATUS.DONE, STATUS.PARTIAL, STATUS.SKIPPED];
  const activeTasks = tasks.filter((t) => !finishedStatuses.includes(t.status));
  const doneTasks = tasks.filter((t) => finishedStatuses.includes(t.status));

  // Group ACTIVE tasks by block (concluídas ficam separadas)
  const grouped = useMemo(() => {
    const g = {};
    BLOCKS.forEach((b) => { g[b.key] = []; });
    activeTasks.forEach((t) => {
      const block = t.block || getBlock(t.priority);
      if (!g[block]) g[block] = [];
      g[block].push(t);
    });
    Object.keys(g).forEach((k) => g[k].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return g;
  }, [activeTasks]);

  const allResolved = tasks.length > 0 && tasks.every((t) => finishedStatuses.includes(t.status));
  const doneCount = tasks.filter((t) => t.status === STATUS.DONE).length;
  const resolvedCount = tasks.filter((t) => finishedStatuses.includes(t.status)).length;
  const pct = tasks.length > 0 ? (resolvedCount / tasks.length) * 100 : 0;

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  };

  const handleAdd = async (t) => { await onAddTask({ ...t, date: selectedDate }); setShowForm(false); };
  const handleBatch = async (ts) => { await onAddBatch(ts); setShowForm(false); };

  return (
    <div style={{ animation: "fadeIn .4s ease", paddingBottom: 80 }}>
      {/* ─── Header ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.push("/calendario")} style={{ border: "none", background: C.bg, borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{dateLabel}</div>
            {isTod && <div style={{ fontSize: 12, color: C.accent }}>{fmtTime(now.getHours(), now.getMinutes())} · Hoje</div>}
            {isFut && <div style={{ fontSize: 12, color: C.accent }}>Dia futuro · Agendamento</div>}
            {isPst && <div style={{ fontSize: 12, color: C.textMuted }}>Dia passado · Histórico</div>}
          </div>
        </div>
        {isTod && tasks.length > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setShowClearDay(true)} style={{ border: `1px solid ${C.overtime}40`, background: "transparent", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: C.overtime }}>
              🗑 Limpar
            </button>
            <button onClick={handleCloseDay} style={{
              border: "none", background: allResolved ? C.done : C.accent, borderRadius: 10,
              padding: "8px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: `0 2px 8px ${allResolved ? C.done : C.accent}40`,
            }}>
              {allResolved ? "✓ Fechar o dia" : "Encerrar dia"}
            </button>
          </div>
        )}
        {!isTod && !isPst && tasks.length > 0 && (
          <button onClick={() => setShowClearDay(true)} style={{ border: `1px solid ${C.overtime}40`, background: "transparent", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: C.overtime }}>
            🗑 Limpar
          </button>
        )}
      </div>

      {/* ─── Progress bar ─── */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>{doneCount} de {tasks.length} concluídas</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>{Math.round(pct)}%</span>
          </div>
          <ProgressBar pct={pct} color={C.done} height={4} />
        </div>
      )}

      {/* ─── Empty state ─── */}
      {tasks.length === 0 && !showForm && (
        <Card style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 14 }}>
            {isFut ? "Agende tarefas para este dia." : isPst ? "Nenhuma tarefa registrada." : "Nenhuma tarefa ainda. Comece adicionando."}
          </div>
          {!isPst && <Btn onClick={openForm}>Adicionar tarefa</Btn>}
        </Card>
      )}

      {/* ─── Task Form ─── */}
      <div ref={formRef}>
        {showForm && (
          <TaskForm
            onAdd={handleAdd}
            onAddBatch={handleBatch}
            onCancel={() => setShowForm(false)}
            defaultDate={selectedDate}
            existingTasks={tasks}
          />
        )}
      </div>

      {/* ─── Task Blocks (ATIVAS apenas) ─── */}
      {BLOCKS.map((block) => {
        const bt = grouped[block.key] || [];
        if (!bt.length) return null;
        return (
          <div key={block.key} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingLeft: 4 }}>
              {block.label}
            </div>
            {bt.map((t) => (
              <div key={t.id} ref={(el) => { taskRefs.current[t.id] = el; }}>
                <TaskItem
                  task={t} now={now} onUpdate={onUpdate}
                  onEdit={setEditingTask} onReschedule={setReschedulingTask}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        );
      })}

      {/* ─── SEÇÃO CONCLUÍDAS ─── */}
      {doneTasks.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {/* Separator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 14px", padding: "0 4px" }}>
            <div style={{ flex: 1, height: 1, background: C.done + "30" }} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: C.done,
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}>
              ✓ Concluídas ({doneTasks.length})
            </span>
            <div style={{ flex: 1, height: 1, background: C.done + "30" }} />
          </div>
          {/* Done tasks sorted by time */}
          {[...doneTasks].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((t) => (
            <div key={t.id} ref={(el) => { taskRefs.current[t.id] = el; }}>
              <TaskItem
                task={t} now={now} onUpdate={onUpdate}
                onEdit={setEditingTask} onReschedule={setReschedulingTask}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* ─── Floating + button ─── */}
      {!isPst && !showForm && tasks.length > 0 && (
        <button onClick={openForm} style={{
          position: "fixed", bottom: 24, right: "50%", transform: "translateX(50%)",
          border: "none", borderRadius: 14, padding: "14px 28px",
          background: C.text, color: C.bg, fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,.4)", zIndex: 100,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Tarefa
        </button>
      )}

      {/* ─── Modals ─── */}
      {showClearDay && <ClearDayModal tasks={tasks} onDelete={onDelete} onClose={() => setShowClearDay(false)} />}
      {showWeekendReview && <WeekendReviewModal weekendTasks={weekendTasks} onFinish={finishWeekendReview} onClose={() => { setShowWeekendReview(false); setShowCloseModal(true); }} />}
      {editingTask && <EditModal task={editingTask} onSave={onUpdate} onClose={() => setEditingTask(null)} />}
      {reschedulingTask && <RescheduleModal task={reschedulingTask} onReschedule={onReschedule} onClose={() => setReschedulingTask(null)} />}

      {/* ─── Close Day Note Modal ─── */}
      {showCloseModal && (
        <Modal open onClose={() => setShowCloseModal(false)} title="Encerrar o dia">
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
            Quer deixar uma nota sobre como foi seu dia? (opcional)
          </div>
          <textarea
            value={dayNote} onChange={(e) => setDayNote(e.target.value)}
            placeholder="Como foi seu dia? O que aprendeu? Como se sentiu?"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13,
              fontFamily: "'DM Sans',sans-serif", background: C.bg, color: C.text,
              outline: "none", resize: "vertical", marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => { onCloseDay(""); setShowCloseModal(false); }}>Pular</Btn>
            <Btn onClick={() => { onCloseDay(dayNote.trim()); setShowCloseModal(false); }}>Encerrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
