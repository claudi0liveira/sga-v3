"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, ProgressBar } from "@/components/ui";
import PrioritiesPanel from "@/components/priorities/PrioritiesPanel";
import { C, STATUS, INSIGHTS } from "@/lib/constants";
import { pad, todayKey, isToday, isFuture, isPast, dateKey, fmtTime, randomFrom } from "@/lib/helpers";
import { useNow } from "@/hooks/useNow";

export default function CalendarDashboard({ allTasks, history, priorities, phase, quickLinks, onUpdatePriorities, onUpdatePhase, onAddLink, onRemoveLink }) {
  const now = useNow(10000);
  const router = useRouter();
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const monthName = new Date(viewMonth.y, viewMonth.m).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const prev = () => setViewMonth((p) => p.m === 0 ? { y: p.y - 1, m: 11 } : { ...p, m: p.m - 1 });
  const next = () => setViewMonth((p) => p.m === 11 ? { y: p.y + 1, m: 0 } : { ...p, m: p.m + 1 });

  const days = useMemo(() => {
    const first = new Date(viewMonth.y, viewMonth.m, 1);
    const startDay = first.getDay();
    const dim = new Date(viewMonth.y, viewMonth.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= dim; i++) cells.push(i);
    return cells;
  }, [viewMonth]);

  const getDayTasks = (day) => {
    if (!day) return [];
    const dk = `${viewMonth.y}-${pad(viewMonth.m + 1)}-${pad(day)}`;
    const a = allTasks[dk] || [];
    const h = history[dk]?.snapshot || [];
    const combined = [...h];
    a.forEach((t) => { if (!combined.find((x) => x.id === t.id)) combined.push(t); });
    return combined;
  };

  const insight = useMemo(() => randomFrom(INSIGHTS), []);
  const totalDays = Object.keys(history).length;
  const monthDays = Object.keys(history).filter((k) => k.startsWith(`${viewMonth.y}-${pad(viewMonth.m + 1)}`)).length;

  // Live activity
  const todayTasks = useMemo(() => {
    const tk = todayKey();
    return (allTasks[tk] || []).filter((t) => [STATUS.SCHEDULED, STATUS.ACTIVE, STATUS.PAUSED].includes(t.status))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [allTasks, now]);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const currentTask = useMemo(() => todayTasks.find((t) => {
    const [h, m] = t.startTime.split(":").map(Number);
    return nowMin >= (h * 60 + m) && nowMin < (h * 60 + m + t.duration);
  }) || null, [todayTasks, nowMin]);

  const nextTask = useMemo(() => todayTasks.find((t) => {
    const [h, m] = t.startTime.split(":").map(Number);
    return (h * 60 + m) > nowMin;
  }) || null, [todayTasks, nowMin]);

  const currentPct = currentTask ? (() => {
    const [h, m] = currentTask.startTime.split(":").map(Number);
    return currentTask.duration > 0 ? ((nowMin - (h * 60 + m)) / currentTask.duration) * 100 : 0;
  })() : 0;
  const currentRemaining = currentTask ? (() => {
    const [h, m] = currentTask.startTime.split(":").map(Number);
    return Math.max(0, currentTask.duration - (nowMin - (h * 60 + m)));
  })() : 0;
  const hasLiveContent = currentTask || nextTask;

  // Today data
  const allToday = useMemo(() => (allTasks[todayKey()] || []).sort((a, b) => a.startTime.localeCompare(b.startTime)), [allTasks]);
  const todayDone = allToday.filter((t) => t.status === STATUS.DONE).length;
  const todayTotal = allToday.length;
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
  const weekdayName = new Date().toLocaleDateString("pt-BR", { weekday: "long" });

  // Quick links
  const [addingLink, setAddingLink] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    onAddLink(newLinkLabel.trim(), url);
    setNewLinkLabel(""); setNewLinkUrl(""); setAddingLink(false);
  };

  // Active ranges
  const activeRanges = useMemo(() => {
    const ranges = {};
    Object.values(allTasks).flat().forEach((t) => {
      if (t.rangeGroup && t.rangeTotal > 1) {
        if (!ranges[t.rangeGroup]) ranges[t.rangeGroup] = { name: t.name, priority: t.priority, total: t.rangeTotal, tasks: [] };
        ranges[t.rangeGroup].tasks.push(t);
      }
    });
    return Object.values(ranges).filter((r) => r.tasks.some((t) => !isPast(t.date) || isToday(t.date)));
  }, [allTasks]);

  const DCard = ({ children, style: s = {}, onClick }) => (
    <div onClick={onClick} style={{ background: C.surface, borderRadius: 14, padding: 16, border: `1px solid ${C.border}`, cursor: onClick ? "pointer" : "default", transition: "all .2s", ...s }}>{children}</div>
  );

  const goDay = (dk, taskId) => {
    const url = taskId ? `/dia/${dk}?focus=${taskId}` : `/dia/${dk}`;
    router.push(url);
  };

  return (
    <div style={{ animation: "fadeIn .4s ease" }}>

      {/* ROW 1: Live + Progress */}
      <div style={{ display: "grid", gridTemplateColumns: hasLiveContent ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 12 }}>
        {hasLiveContent && (
          <DCard style={{ border: `1px solid ${C.active}30` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Agora</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>{fmtTime(now.getHours(), now.getMinutes())}</span>
            </div>
            {currentTask && (
              <div onClick={() => goDay(todayKey(), currentTask.id)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.active, animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTask.name}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{currentTask.startTime} · {currentRemaining}min restantes</div>
                <ProgressBar pct={currentPct} color={currentPct > 100 ? C.overtime : C.active} height={4} />
              </div>
            )}
            {!currentTask && nextTask && (
              <div onClick={() => goDay(todayKey(), nextTask.id)} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Próxima</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{nextTask.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{nextTask.startTime} · {nextTask.duration}min</div>
              </div>
            )}
          </DCard>
        )}
        <DCard onClick={() => goDay(todayKey())} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="28" cy="28" r="24" fill="none" stroke={C.border} strokeWidth="5" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={todayPct >= 70 ? C.done : todayPct >= 30 ? C.accent : C.textMuted} strokeWidth="5" strokeDasharray={`${(todayPct / 100) * 151} 151`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.text }}>{todayPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Progresso</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{todayDone}/{todayTotal} tarefas</div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "capitalize", marginTop: 2 }}>{weekdayName}</div>
          </div>
        </DCard>
      </div>

      {/* ROW 2: Today Schedule */}
      {todayTotal > 0 && (
        <DCard style={{ marginBottom: 12, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>📋 Hoje</span>
            <span style={{ fontSize: 10, color: C.textMuted }}>{todayTotal} tarefa{todayTotal > 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {allToday.map((t) => {
              const pColor = t.priority === "Alta" ? C.high : t.priority === "Média" ? C.medium : C.low;
              const isDone = t.status === STATUS.DONE;
              const isAct = t.status === STATUS.ACTIVE;
              return (
                <div key={t.id} onClick={() => goDay(todayKey(), t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 8, cursor: "pointer", background: isDone ? C.done + "06" : isAct ? C.accent + "06" : "transparent" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: pColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: isDone ? C.done : C.text, fontWeight: isAct ? 600 : 400, textDecoration: isDone ? "line-through" : "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>{t.startTime}</span>
                  {isDone && <span style={{ fontSize: 9, color: C.done }}>✓</span>}
                  {isAct && <span style={{ fontSize: 7, color: C.accent, animation: "pulse 1.5s infinite" }}>●</span>}
                </div>
              );
            })}
          </div>
        </DCard>
      )}

      {/* ROW 3: Links + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <DCard style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>🔗 Links</span>
            {(quickLinks || []).length < 10 && !addingLink && (
              <button onClick={() => setAddingLink(true)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11, color: C.accent, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>+</button>
            )}
          </div>
          {(!quickLinks || quickLinks.length === 0) && !addingLink && (
            <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>Este sistema mede tarefas. Não mede caráter.</div>
          )}
          {quickLinks && quickLinks.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {quickLinks.map((l) => (
                <span key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 7px" }}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}>{l.label}</a>
                  <button onClick={() => onRemoveLink(l.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 8, color: C.textMuted, padding: 0 }}>✕</button>
                </span>
              ))}
            </div>
          )}
          {addingLink && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} placeholder="Nome" style={{ padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: "'DM Sans',sans-serif", background: C.bg, outline: "none", color: C.text }} />
              <input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL" onKeyDown={(e) => { if (e.key === "Enter") addLink(); }} style={{ padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: "'DM Sans',sans-serif", background: C.bg, outline: "none", color: C.text }} />
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={addLink} style={{ flex: 1, border: "none", borderRadius: 6, padding: "5px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: C.accent, color: "#fff" }}>+</button>
                <button onClick={() => { setAddingLink(false); setNewLinkLabel(""); setNewLinkUrl(""); }} style={{ border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: C.border, color: C.textMuted }}>✕</button>
              </div>
            </div>
          )}
        </DCard>
        <DCard style={{ padding: 14, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>📊 Constância</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>{totalDays}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>dias total</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.done }}>{monthDays}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>este mês</div>
            </div>
          </div>
        </DCard>
      </div>

      {/* ROW 4: Priorities */}
      <PrioritiesPanel priorities={priorities} onUpdate={onUpdatePriorities} phaseData={phase} onUpdatePhase={onUpdatePhase} />

      {/* ROW 5: Calendar */}
      <DCard style={{ marginBottom: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={prev} style={{ border: "none", background: C.bg, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text, textTransform: "capitalize", fontFamily: "'Fraunces',serif" }}>{monthName}</span>
          <button onClick={next} style={{ border: "none", background: C.bg, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center", marginBottom: 4 }}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (<div key={i} style={{ fontSize: 10, color: C.textMuted, padding: "4px 0", fontWeight: 600 }}>{d}</div>))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {days.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ aspectRatio: "1" }} />;
            const dk = `${viewMonth.y}-${pad(viewMonth.m + 1)}-${pad(day)}`;
            const tasks = getDayTasks(day);
            const isTod = isToday(dk);
            const hasTasks = tasks.length > 0;
            const hasHigh = tasks.some((t) => t.priority === "Alta");
            const hasMed = tasks.some((t) => t.priority === "Média");
            const hasLow = tasks.some((t) => t.priority === "Baixa");
            const allDone = hasTasks && tasks.every((t) => t.status === STATUS.DONE);
            return (
              <button key={i} onClick={() => goDay(dk)} style={{
                border: isTod ? `2px solid ${C.accent}` : `1px solid ${hasTasks ? C.border : "transparent"}`,
                borderRadius: 10, padding: "4px 1px", cursor: "pointer", aspectRatio: "1",
                background: allDone ? C.done + "10" : isTod ? C.accent + "08" : C.surface,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                fontFamily: "'DM Sans',sans-serif", position: "relative", transition: "all .2s",
              }}>
                <span style={{ fontSize: 12, fontWeight: isTod ? 700 : 500, color: isTod ? C.accent : C.text, lineHeight: 1 }}>{day}</span>
                {hasTasks && (
                  <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {hasHigh && <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.high }} />}
                    {hasMed && <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.medium }} />}
                    {hasLow && <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.low }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DCard>

      {/* ROW 6: Ranges */}
      {activeRanges.length > 0 && (
        <DCard style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>📋 Ranges ativos</div>
          <div style={{ display: "grid", gridTemplateColumns: activeRanges.length > 3 ? "1fr 1fr" : "1fr", gap: 6 }}>
            {activeRanges.map((r, i) => {
              const done = r.tasks.filter((t) => t.status === STATUS.DONE).length;
              const pct = r.total > 0 ? (done / r.total) * 100 : 0;
              const pColor = r.priority === "Alta" ? C.high : r.priority === "Média" ? C.medium : C.low;
              return (
                <div key={i} style={{ padding: "8px 10px", background: C.bg, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r.name}</span>
                    <span style={{ fontSize: 10, color: C.accent, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{done}/{r.total}</span>
                  </div>
                  <ProgressBar pct={pct} color={pColor} height={3} />
                </div>
              );
            })}
          </div>
        </DCard>
      )}

      {/* ROW 7: Weekly Chart */}
      <DCard style={{ padding: 14, marginBottom: 12, maxWidth: 480, margin: "0 auto 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8, textAlign: "center" }}>📈 Últimos 7 dias</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, textAlign: "center", maxWidth: 360, margin: "0 auto" }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const dk = dateKey(d);
            const tasks = history[dk]?.snapshot || allTasks[dk] || [];
            const label = d.toLocaleDateString("pt-BR", { weekday: "narrow" });
            const total = tasks.length;
            const done = tasks.filter((t) => t.status === STATUS.DONE).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={dk}>
                <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{label}</div>
                <div style={{ width: "100%", height: 40, borderRadius: 6, background: C.border + "40", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${pct}%`, background: pct >= 70 ? C.done : pct >= 30 ? C.accent : C.textMuted + "60", borderRadius: "6px 6px 0 0", minHeight: pct > 0 ? 2 : 0, transition: "height .3s" }} />
                </div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 3, fontWeight: 600 }}>{pct > 0 ? `${pct}%` : ""}</div>
              </div>
            );
          })}
        </div>
      </DCard>

      {/* ROW 8: Insight */}
      <div style={{ padding: "10px 16px", background: C.accent + "06", borderRadius: 12, border: `1px dashed ${C.accent}20`, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{insight}</span>
      </div>
    </div>
  );
}
