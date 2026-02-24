"use client";
import { C, STATUS } from "@/lib/constants";

// ─── StatusDot ───
export function StatusDot({ status, priority }) {
  const color = status === STATUS.DONE ? C.done
    : status === STATUS.PARTIAL ? C.medium
    : status === STATUS.SKIPPED ? C.textMuted
    : status === STATUS.ACTIVE ? C.active
    : priority === "Alta" ? C.high
    : priority === "Média" ? C.medium
    : C.low;
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

// ─── ProgressBar ───
export function ProgressBar({ pct, color = C.active, height = 6 }) {
  return (
    <div style={{ width: "100%", height, borderRadius: height, background: C.border, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: height, background: color, transition: "width .3s ease" }} />
    </div>
  );
}

// ─── Btn ───
export function Btn({ children, onClick, v = "primary", style: s = {}, disabled, type = "button" }) {
  const base = {
    border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600,
    cursor: disabled ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s", opacity: disabled ? 0.5 : 1, ...s,
  };
  const variants = {
    primary: { background: C.accent, color: "#fff" },
    ghost: { background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted },
    danger: { background: C.overtime, color: "#fff" },
    done: { background: C.done, color: "#fff" },
  };
  return <button type={type} onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[v] }}>{children}</button>;
}

// ─── Card ───
export function Card({ children, style: s = {} }) {
  return <div style={{ background: C.surface, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, ...s }}>{children}</div>;
}

// ─── Input ───
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10,
        fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: C.surface, outline: "none",
        color: C.text, ...props.style,
      }} />
    </div>
  );
}

// ─── Select ───
export function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>{label}</label>}
      <select {...props} style={{
        width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10,
        fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: C.surface, outline: "none",
        color: C.text, ...props.style,
      }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Modal ───
export function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(4px)", animation: "fadeIn .2s ease",
    }}>
      <div style={{
        position: "relative", background: C.surface, borderRadius: 20, padding: 28,
        maxWidth: 440, width: "100%", maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "fadeIn .3s ease",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "'Fraunces', serif" }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: C.bg, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Loading Spinner ───
export function Loading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`,
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
