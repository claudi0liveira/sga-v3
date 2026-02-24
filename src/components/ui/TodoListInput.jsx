"use client";
import { useState } from "react";
import { C } from "@/lib/constants";

export default function TodoListInput({ todos, onChange }) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...todos, { id: Math.random().toString(36).slice(2, 9), text: newItem.trim(), done: false }]);
    setNewItem("");
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>
        To-do (micro-tarefas)
      </label>
      {todos.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {todos.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{t.text}</span>
              <button
                onClick={() => onChange(todos.filter((x) => x.id !== t.id))}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: C.overtime }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder="Adicionar item..."
          style={{
            flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: C.bg, outline: "none", color: C.text,
          }}
        />
        <button
          onClick={addItem}
          disabled={!newItem.trim()}
          style={{
            border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
            cursor: newItem.trim() ? "pointer" : "default",
            background: newItem.trim() ? C.accent : C.border, color: newItem.trim() ? "#fff" : C.textMuted,
          }}
        >+</button>
      </div>
    </div>
  );
}
