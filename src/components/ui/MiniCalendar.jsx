"use client";
import { useState, useMemo } from "react";
import { C } from "@/lib/constants";
import { pad, todayKey, isToday } from "@/lib/helpers";

export default function MiniCalendar({ value, onChange, minDate }) {
  const selected = value || todayKey();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selected + "T12:00:00");
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const days = useMemo(() => {
    const first = new Date(viewMonth.y, viewMonth.m, 1);
    const startDay = first.getDay();
    const dim = new Date(viewMonth.y, viewMonth.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= dim; i++) cells.push(i);
    return cells;
  }, [viewMonth]);

  const monthName = new Date(viewMonth.y, viewMonth.m).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const prev = () => setViewMonth((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { ...p, m: p.m - 1 }));
  const next = () => setViewMonth((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { ...p, m: p.m + 1 }));

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={prev} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: C.textMuted, padding: "4px 8px" }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{monthName}</span>
        <button onClick={next} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: C.textMuted, padding: "4px 8px" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: C.textMuted, padding: 4 }}>{d}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const dk = `${viewMonth.y}-${pad(viewMonth.m + 1)}-${pad(d)}`;
          const isDisabled = minDate && dk < minDate;
          const isSel = dk === selected;
          const isTod = isToday(dk);
          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => onChange(dk)}
              style={{
                border: "none", borderRadius: 8, padding: "6px 2px", fontSize: 12,
                cursor: isDisabled ? "default" : "pointer",
                background: isSel ? C.accent : isTod ? C.accent + "20" : "transparent",
                color: isSel ? "#fff" : isDisabled ? C.border : C.text,
                fontWeight: isSel || isTod ? 600 : 400,
                fontFamily: "'DM Sans',sans-serif", opacity: isDisabled ? 0.4 : 1,
              }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}
