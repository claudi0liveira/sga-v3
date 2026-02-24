"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { fmtBRL, todayKey } from "@/lib/helpers";
import { useLiberty } from "@/hooks/useLiberty";
import { useFinance } from "@/hooks/useFinance";
import { useTasks } from "@/hooks/useTasks";
import { usePriorities } from "@/hooks/usePriorities";
import { useNow } from "@/hooks/useNow";

function StatusItem({ icon, label, color, visible, onToggle, onClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <button onClick={onClick} style={{
        border: "none", background: "none", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans',sans-serif",
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontWeight: 600, color: visible ? color : "transparent", transition: "color .2s", textShadow: visible ? "none" : `0 0 8px ${color}` }}>
          {label}
        </span>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
        border: "none", background: "none", cursor: "pointer", fontSize: 11,
        color: C.textMuted, padding: "0 2px", opacity: 0.6,
      }}>
        👁
      </button>
    </div>
  );
}

export default function StatusBar() {
  const router = useRouter();
  const now = useNow(60000);
  const { smokeDate } = useLiberty();
  const { totalReserved } = useFinance();
  const { allTasks } = useTasks();
  const { priorities } = usePriorities();

  const [hidden, setHidden] = useState({});

  // Load hidden prefs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sga_statusbar_hidden");
      if (saved) setHidden(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleItem = (key) => {
    setHidden((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("sga_statusbar_hidden", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Liberty days
  const libertyDays = smokeDate
    ? Math.floor((now - new Date(smokeDate + "T00:00:00")) / 86400000)
    : null;

  // Active task
  const today = todayKey();
  const todayTasks = allTasks?.[today] || [];
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const nowMinutes = nowH * 60 + nowM;
  // Priority: task with status "active" (user pressed play), then time-based
  const activeTask = todayTasks.find((t) => t.status === "active") || todayTasks.find((t) => {
    if (t.status === "done" || t.status === "skipped") return false;
    const [h, m] = (t.time || "09:00").split(":").map(Number);
    const start = h * 60 + m;
    const end = start + (t.duration || 30);
    return nowMinutes >= start && nowMinutes < end;
  });

  // Focus priority
  const focus = priorities?.[0];

  const items = [];

  if (libertyDays !== null) {
    items.push(
      <StatusItem
        key="liberty"
        icon="🟢"
        label={`~${libertyDays}d livre`}
        color={libertyDays >= 0 ? C.done : C.high}
        visible={!hidden.liberty}
        onToggle={() => toggleItem("liberty")}
        onClick={() => router.push("/liberdade")}
      />
    );
  }

  if (totalReserved !== undefined) {
    items.push(
      <StatusItem
        key="reserved"
        icon="🐷"
        label={fmtBRL(totalReserved)}
        color={C.medium}
        visible={!hidden.reserved}
        onToggle={() => toggleItem("reserved")}
        onClick={() => router.push("/financeiro")}
      />
    );
  }

  if (activeTask) {
    const [h, m] = (activeTask.time || "09:00").split(":").map(Number);
    const end = h * 60 + m + (activeTask.duration || 30);
    const remaining = end - nowMinutes;
    items.push(
      <StatusItem
        key="activity"
        icon="●"
        label={`${activeTask.name?.slice(0, 18)}${activeTask.name?.length > 18 ? "…" : ""} · ${remaining}min`}
        color={C.accent}
        visible={!hidden.activity}
        onToggle={() => toggleItem("activity")}
        onClick={() => router.push(`/dia/${today}`)}
      />
    );
  }

  if (focus) {
    items.push(
      <StatusItem
        key="focus"
        icon={focus.icon || "🎯"}
        label={focus.text}
        color={C.accent}
        visible={!hidden.focus}
        onToggle={() => toggleItem("focus")}
        onClick={() => router.push("/calendario")}
      />
    );
  }

  if (items.length === 0) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      padding: "6px 16px", background: C.done + "10", borderRadius: 10,
      marginBottom: 16, flexWrap: "wrap", border: `1px solid ${C.done}20`,
    }}>
      {items}
    </div>
  );
}
