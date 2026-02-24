"use client";
import { useState } from "react";
import { C, PRIORITY_COLORS } from "@/lib/constants";
import { Btn, Input } from "@/components/ui";

const ICONS = ["🎯","🔥","💪","🧠","📚","💰","🏃","🚭","❤️","⚡","🌱","🏠","💼","🎨","🧘","📈","🔧","✨","🎓","🌍","💎","🏆","🛡️","⏰","🎵"];

function IconPicker({ value, onChange, onClose }) {
  return (
    <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, padding: 12, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.5)", animation: "fadeIn .2s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
        {ICONS.map((icon) => (
          <button key={icon} onClick={() => { onChange(icon); onClose(); }} style={{
            width: 36, height: 36, border: value === icon ? `2px solid ${C.accent}` : "1px solid transparent",
            borderRadius: 8, background: value === icon ? C.accent + "20" : "transparent",
            cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{icon}</button>
        ))}
      </div>
    </div>
  );
}

function PriorityCard({ item, index, color, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [showIcons, setShowIcons] = useState(false);

  return (
    <div style={{
      padding: "14px 18px", background: C.bg, borderRadius: 14,
      border: `1px solid ${color}30`, marginBottom: 8,
      display: "flex", alignItems: "center", gap: 12, position: "relative",
    }}>
      {/* Icon */}
      <button onClick={() => setShowIcons(!showIcons)} style={{
        width: 40, height: 40, borderRadius: 10, border: "none",
        background: color + "20", cursor: "pointer", fontSize: 20,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{item.icon || "🎯"}</button>
      {showIcons && <IconPicker value={item.icon} onChange={(icon) => onUpdate({ ...item, icon })} onClose={() => setShowIcons(false)} />}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.text}</div>
        <div style={{ fontSize: 11, color: color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>PRIORIDADE #{index + 1}</div>
      </div>

      {/* Reorder + Delete */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        {!isFirst && <button onClick={onMoveUp} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 10, color: C.textMuted, padding: 2 }}>▲</button>}
        {!isLast && <button onClick={onMoveDown} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 10, color: C.textMuted, padding: 2 }}>▼</button>}
      </div>
      <button onClick={onRemove} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: C.textMuted, padding: 2, flexShrink: 0 }}>✕</button>
    </div>
  );
}

function EditMode({ priorities, phase, onSave, onCancel }) {
  const [title, setTitle] = useState(phase.title || "");
  const [quote, setQuote] = useState(phase.quote || "");
  const [items, setItems] = useState(priorities.length > 0 ? [...priorities] : []);
  const [newText, setNewText] = useState("");
  const [newIcon, setNewIcon] = useState("🎯");

  const addItem = () => {
    if (!newText.trim() || items.length >= 5) return;
    setItems([...items, { text: newText.trim(), icon: newIcon, desc: "" }]);
    setNewText("");
    setNewIcon("🎯");
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, updated) => setItems(items.map((it, idx) => idx === i ? updated : it));
  const moveUp = (i) => { if (i === 0) return; const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setItems(n); };
  const moveDown = (i) => { if (i === items.length - 1) return; const n = [...items]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; setItems(n); };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Phase */}
      <div style={{ marginBottom: 16 }}>
        <Input label="Nome da fase" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Fase 1 - Limpar Terreno" />
        <div style={{ marginTop: 8 }}>
          <Input label="Citação / Mantra (opcional)" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Ex: Não dá pra construir em cima de entulho." />
        </div>
      </div>

      {/* Priority items */}
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>Prioridades ({items.length}/5)</div>
      {items.map((item, i) => (
        <PriorityCard
          key={i} item={item} index={i}
          color={PRIORITY_COLORS[i % PRIORITY_COLORS.length]}
          onUpdate={(u) => updateItem(i, u)}
          onRemove={() => removeItem(i)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
          isFirst={i === 0} isLast={i === items.length - 1}
        />
      ))}

      {/* Add new */}
      {items.length < 5 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16 }}>
          <input value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
            placeholder="Nova prioridade..."
            style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: C.bg, color: C.text, outline: "none" }}
          />
          <Btn onClick={addItem} disabled={!newText.trim()} style={{ fontSize: 12 }}>+ Adicionar</Btn>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={() => onSave(items, { title, quote })}>Salvar</Btn>
      </div>
    </div>
  );
}

export default function PrioritiesPanel({ priorities = [], onUpdate, phaseData = {}, onUpdatePhase }) {
  const [editing, setEditing] = useState(false);
  const [hidden, setHidden] = useState(false);

  const hasPriorities = priorities.length > 0;
  const hasPhase = phaseData.title;

  const handleSave = async (items, phase) => {
    await onUpdate(items);
    await onUpdatePhase(phase);
    setEditing(false);
  };

  // Empty state — first time setup
  if (!hasPriorities && !hasPhase && !editing) {
    return (
      <div style={{ padding: 24, background: C.accent, borderRadius: 16, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Defina sua fase e prioridades atuais</div>
        <div style={{ fontSize: 13, color: "#ffffffaa", marginBottom: 14 }}>Até 5 prioridades para guiar suas decisões</div>
        <Btn onClick={() => setEditing(true)} style={{ background: "#fff", color: C.accent, fontWeight: 700 }}>Definir prioridades</Btn>
      </div>
    );
  }

  if (editing) {
    return (
      <div style={{ padding: 20, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <EditMode priorities={priorities} phase={phaseData} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Phase header */}
      <div style={{ padding: "18px 22px", background: C.accent, borderRadius: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Fraunces',serif", fontStyle: "italic" }}>
            {phaseData.title || "Minha Fase Atual"}
          </div>
          {phaseData.quote && (
            <div style={{ fontSize: 13, color: "#ffffffaa", fontStyle: "italic", marginTop: 4 }}>"{phaseData.quote}"</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={() => setHidden(!hidden)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#ffffffaa", padding: 4 }}>
            {hidden ? "👁" : "👁‍🗨"}
          </button>
          <button onClick={() => setEditing(true)} style={{
            border: "1px solid #ffffff40", background: "transparent", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, color: "#fff", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
          }}>Editar</button>
        </div>
      </div>

      {/* Priority cards */}
      {!hidden && priorities.map((p, i) => (
        <div key={i} style={{
          padding: "14px 18px", background: C.surface, borderRadius: 14,
          border: `1px solid ${C.border}`, marginBottom: 6,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10,
            background: (PRIORITY_COLORS[i % PRIORITY_COLORS.length]) + "20",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>{p.icon || "🎯"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.text}</div>
            <div style={{ fontSize: 11, color: PRIORITY_COLORS[i % PRIORITY_COLORS.length], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              PRIORIDADE #{i + 1}
            </div>
          </div>
          <span style={{ fontSize: 12, color: C.textMuted }}>▼</span>
        </div>
      ))}
    </div>
  );
}
