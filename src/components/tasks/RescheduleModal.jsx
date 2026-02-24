"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import { todayKey, addDays } from "@/lib/helpers";
import { Btn, Modal } from "@/components/ui";
import MiniCalendar from "@/components/ui/MiniCalendar";

export default function RescheduleModal({ task, onReschedule, onClose }) {
  const [showCal, setShowCal] = useState(false);
  const [selDate, setSelDate] = useState(addDays(todayKey(), 1));

  const quickDates = [
    { label: "Amanhã", date: addDays(todayKey(), 1) },
    { label: "Em 2 dias", date: addDays(todayKey(), 2) },
    { label: "Em 3 dias", date: addDays(todayKey(), 3) },
    { label: "Próxima semana", date: addDays(todayKey(), 7) },
  ];

  const doIt = (date) => {
    onReschedule(task.id, date, task.date);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Reagendar tarefa">
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{task.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {quickDates.map((q) => (
          <Btn key={q.label} v="ghost" onClick={() => doIt(q.date)} style={{ fontSize: 13 }}>{q.label}</Btn>
        ))}
      </div>
      <Btn v="ghost" onClick={() => setShowCal(!showCal)} style={{ width: "100%", textAlign: "center", marginBottom: 8 }}>
        📅 Escolher no calendário
      </Btn>
      {showCal && (
        <div style={{ marginBottom: 12 }}>
          <MiniCalendar value={selDate} onChange={(d) => setSelDate(d)} minDate={addDays(todayKey(), 1)} />
          <Btn onClick={() => doIt(selDate)} style={{ width: "100%", marginTop: 8 }}>
            Reagendar para {new Date(selDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
          </Btn>
        </div>
      )}
    </Modal>
  );
}
