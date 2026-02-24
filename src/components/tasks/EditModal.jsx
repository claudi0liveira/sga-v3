"use client";
import { useState } from "react";
import { C, getBlock } from "@/lib/constants";
import { Btn, Input, Select, Modal } from "@/components/ui";
import TodoListInput from "@/components/ui/TodoListInput";

export default function EditModal({ task, onSave, onClose }) {
  const [name, setName] = useState(task.name);
  const [priority, setPriority] = useState(task.priority);
  const [hour, setHour] = useState(task.startTime.split(":")[0]);
  const [minute, setMinute] = useState(task.startTime.split(":")[1]);
  const [duration, setDuration] = useState(String(task.duration));
  const [note, setNote] = useState(task.note || "");
  const [todos, setTodos] = useState(task.todos || []);

  const timeInput = {
    padding: "10px 8px", border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: C.surface,
    textAlign: "center", color: C.text, outline: "none",
  };

  return (
    <Modal open onClose={onClose} title="Editar tarefa">
      <div style={{ marginBottom: 14 }}><Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div style={{ marginBottom: 14 }}><Select label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value)} options={["Alta", "Média", "Baixa"]} /></div>
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
      <TodoListInput todos={todos} onChange={setTodos} />
      <div style={{ marginBottom: 14 }}><Input label="Observação" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => {
          onSave(task.id, {
            name, priority, startTime: `${hour}:${minute}`,
            duration: parseInt(duration) || 30, note, todos, block: getBlock(priority),
          });
          onClose();
        }}>Salvar</Btn>
      </div>
    </Modal>
  );
}
