"use client";
import { useState, useMemo } from "react";
import { C, STATUS, getBlock } from "@/lib/constants";
import { pad, todayKey, isToday, addDays } from "@/lib/helpers";
import { Btn, Card, Input, Select } from "@/components/ui";
import MiniCalendar from "@/components/ui/MiniCalendar";
import TodoListInput from "@/components/ui/TodoListInput";

const WS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WN = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const isWd = (dk) => { const d = new Date(dk + "T12:00:00").getDay(); return d !== 0 && d !== 6; };
const fmtD = (dk) => new Date(dk + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

export default function TaskForm({ onAdd, onAddBatch, onCancel, defaultDate, existingTasks }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("Alta");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [duration, setDuration] = useState("30");
  const [note, setNote] = useState("");
  const [todos, setTodos] = useState([]);
  const [taskDate, setTaskDate] = useState(defaultDate || todayKey());
  const [showCal, setShowCal] = useState(false);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState(defaultDate || todayKey());
  const [rangeEnd, setRangeEnd] = useState(addDays(defaultDate || todayKey(), 6));
  const [showRS, setShowRS] = useState(false);
  const [showRE, setShowRE] = useState(false);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [weeklyMode, setWeeklyMode] = useState(false);
  const [weeklyDay, setWeeklyDay] = useState(1);
  const [weeklyWeeks, setWeeklyWeeks] = useState("4");
  const [conflictWarning, setConflictWarning] = useState(null);

  const rangeDays = useMemo(() => {
    if (!rangeMode) return 0;
    const total = Math.round((new Date(rangeEnd + "T12:00:00") - new Date(rangeStart + "T12:00:00")) / 86400000) + 1;
    let c = 0;
    for (let i = 0; i < total; i++) { if (!weekdaysOnly || isWd(addDays(rangeStart, i))) c++; }
    return c;
  }, [rangeMode, rangeStart, rangeEnd, weekdaysOnly]);

  const weeklyDays = useMemo(() => {
    if (!weeklyMode) return [];
    const w = parseInt(weeklyWeeks) || 4;
    const ds = [];
    const s = new Date(todayKey() + "T12:00:00");
    while (s.getDay() !== weeklyDay) s.setDate(s.getDate() + 1);
    for (let i = 0; i < w; i++) {
      const d = new Date(s); d.setDate(d.getDate() + i * 7);
      ds.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
    return ds;
  }, [weeklyMode, weeklyDay, weeklyWeeks]);

  const submit = () => {
    if (!name.trim()) return;
    const base = {
      name: name.trim(), priority, startTime: `${hour}:${minute}`,
      duration: parseInt(duration) || 30, note, todos: todos.map((t) => ({ ...t, done: false })),
      status: STATUS.SCHEDULED, block: getBlock(priority),
      accumulatedTime: 0, timerRunning: false, replanCount: 0, replanFrom: null,
    };

    if (weeklyMode && weeklyDays.length > 0) {
      const gid = Math.random().toString(36).slice(2, 9);
      onAddBatch(weeklyDays.map((dk, i) => ({ ...base, date: dk, rangeGroup: gid, rangeIndex: i + 1, rangeTotal: weeklyDays.length, weeklyTag: WS[weeklyDay] })));
    } else if (rangeMode && rangeDays > 0) {
      const gid = Math.random().toString(36).slice(2, 9);
      const ts = [];
      const total = Math.round((new Date(rangeEnd + "T12:00:00") - new Date(rangeStart + "T12:00:00")) / 86400000) + 1;
      let idx = 0;
      for (let i = 0; i < total; i++) {
        const dk = addDays(rangeStart, i);
        if (weekdaysOnly && !isWd(dk)) continue;
        idx++;
        ts.push({ ...base, date: dk, rangeGroup: gid, rangeIndex: idx, rangeTotal: rangeDays });
      }
      onAddBatch(ts);
    } else {
      // Conflict check
      const dayTasks = existingTasks || [];
      const [h, m] = `${hour}:${minute}`.split(":").map(Number);
      const ns = h * 60 + m, ne = ns + (parseInt(duration) || 30);
      const conf = dayTasks.filter((t) => {
        const [th, tm] = t.startTime.split(":").map(Number);
        const ts = th * 60 + tm;
        return ns < ts + t.duration && ne > ts;
      });
      if (conf.length > 0 && !conflictWarning) { setConflictWarning(conf); return; }
      onAdd({ ...base, date: taskDate });
    }
    setName(""); setNote(""); setTodos([]); setConflictWarning(null);
  };

  const dl = isToday(taskDate) ? "Hoje" : fmtD(taskDate);

  const cbx = (active) => ({
    display: "flex", alignItems: "center", gap: 6, flex: 1,
    border: `1px solid ${active ? C.accent : C.border}`, borderRadius: 10, padding: "8px 12px",
    background: active ? C.accent + "10" : "transparent", cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: active ? C.accent : C.textMuted, fontWeight: 500,
  });

  const tick = (active) => (
    <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${active ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: active ? C.accent : "transparent", flexShrink: 0 }}>
      {active && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
    </span>
  );

  const timeInput = { padding: "10px 8px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: C.surface, textAlign: "center", color: C.text, outline: "none" };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: C.text }}>Nova tarefa</div>

      <div style={{ marginBottom: 14 }}>
        <Input label="Nome da tarefa" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Revisar relatório" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Select label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value)} options={["Alta", "Média", "Baixa"]} />
        {!rangeMode && !weeklyMode && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Dia</label>
            <button onClick={() => setShowCal(!showCal)} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: C.surface, color: C.text, cursor: "pointer", textAlign: "left" }}>
              📅 {dl}
            </button>
          </div>
        )}
      </div>

      {!rangeMode && !weeklyMode && showCal && (
        <div style={{ marginBottom: 14 }}><MiniCalendar value={taskDate} onChange={(d) => { setTaskDate(d); setShowCal(false); }} minDate={todayKey()} /></div>
      )}

      {/* Repetition toggles */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => { setRangeMode(!rangeMode); setWeeklyMode(false); }} style={cbx(rangeMode)}>{tick(rangeMode)} Range (dias seguidos)</button>
        <button onClick={() => { setWeeklyMode(!weeklyMode); setRangeMode(false); }} style={cbx(weeklyMode)}>{tick(weeklyMode)} Semanal (toda X)</button>
      </div>

      {/* Range config */}
      {rangeMode && (
        <div style={{ padding: 14, background: C.bg, borderRadius: 12, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Início</label>
              <button onClick={() => { setShowRS(!showRS); setShowRE(false); }} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif" }}>📅 {fmtD(rangeStart)}</button>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Fim</label>
              <button onClick={() => { setShowRE(!showRE); setShowRS(false); }} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif" }}>📅 {fmtD(rangeEnd)}</button>
            </div>
          </div>
          {showRS && <div style={{ marginBottom: 8 }}><MiniCalendar value={rangeStart} onChange={(d) => { setRangeStart(d); setShowRS(false); if (d > rangeEnd) setRangeEnd(d); }} minDate={todayKey()} /></div>}
          {showRE && <div style={{ marginBottom: 8 }}><MiniCalendar value={rangeEnd} onChange={(d) => { setRangeEnd(d); setShowRE(false); }} minDate={rangeStart} /></div>}
          <button onClick={() => setWeekdaysOnly(!weekdaysOnly)} style={{ ...cbx(weekdaysOnly), marginBottom: 8, width: "100%" }}>{tick(weekdaysOnly)} Só dias úteis (seg-sex)</button>
          {rangeDays > 0 && <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, textAlign: "center" }}>{rangeDays} dia{rangeDays > 1 ? "s" : ""} selecionado{rangeDays > 1 ? "s" : ""}</div>}
        </div>
      )}

      {/* Weekly config */}
      {weeklyMode && (
        <div style={{ padding: 14, background: C.bg, borderRadius: 12, marginBottom: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Dia da semana</label>
            <div style={{ display: "flex", gap: 4 }}>
              {WS.map((d, i) => (
                <button key={i} onClick={() => setWeeklyDay(i)} style={{ flex: 1, padding: "6px 2px", borderRadius: 6, fontSize: 10, fontWeight: weeklyDay === i ? 700 : 400, border: `1px solid ${weeklyDay === i ? C.accent : C.border}`, background: weeklyDay === i ? C.accent + "15" : "transparent", color: weeklyDay === i ? C.accent : C.textMuted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{d}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><Input label="Semanas" type="number" min="1" max="52" value={weeklyWeeks} onChange={(e) => setWeeklyWeeks(e.target.value)} /></div>
          {weeklyDays.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>Toda {WN[weeklyDay]} por {weeklyWeeks} semanas ({weeklyDays.length} tarefas)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                {weeklyDays.map((dk) => <span key={dk} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.accent + "12", color: C.accent, fontWeight: 500 }}>{fmtD(dk)}</span>)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Time + Duration */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Horário</label>
          <div style={{ display: "flex", gap: 4 }}>
            <input type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value.padStart(2, "0"))} style={{ width: "50%", ...timeInput }} />
            <span style={{ alignSelf: "center", color: C.textMuted }}>:</span>
            <input type="number" min="0" max="59" step="5" value={minute} onChange={(e) => setMinute(e.target.value.padStart(2, "0"))} style={{ width: "50%", ...timeInput }} />
          </div>
        </div>
        <Input label="Duração (min)" type="number" min="5" step="5" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>

      {/* Conflict warning */}
      {conflictWarning && (
        <div style={{ padding: 10, background: C.medium + "12", border: `1px solid ${C.medium}40`, borderRadius: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.medium, marginBottom: 4 }}>⚠ Conflito de horário</div>
          {conflictWarning.map((c) => <div key={c.id} style={{ fontSize: 12, color: C.text }}>Colide com <strong>{c.name}</strong> ({c.startTime} · {c.duration}min)</div>)}
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Clique "Adicionar" novamente para confirmar.</div>
        </div>
      )}

      <TodoListInput todos={todos} onChange={setTodos} />

      <div style={{ marginBottom: 14 }}>
        <Input label="Observação (opcional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Algo que queira anotar..." />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onCancel && <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>}
        <Btn onClick={submit} disabled={!name.trim() || (rangeMode && rangeDays < 1) || (weeklyMode && weeklyDays.length < 1)}>
          {weeklyMode && weeklyDays.length > 1 ? `Adicionar ${weeklyDays.length}x` : rangeMode && rangeDays > 1 ? `Adicionar ${rangeDays}x` : conflictWarning ? "Adicionar mesmo assim" : "Adicionar"}
        </Btn>
      </div>
    </Card>
  );
}
