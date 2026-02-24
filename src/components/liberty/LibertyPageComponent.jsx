"use client";
import { useState, useMemo } from "react";
import { C, MILESTONES } from "@/lib/constants";
import { Btn, Card, Input } from "@/components/ui";
import { useNow } from "@/hooks/useNow";
import MiniCalendar from "@/components/ui/MiniCalendar";

function Counter({ smokeDate, now }) {
  const start = new Date(smokeDate + "T00:00:00");
  const diff = now - start;
  const isNegative = diff < 0;
  const absDiff = Math.abs(diff);
  const totalDays = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);
  const sign = isNegative ? "-" : "";

  const numStyle = { fontSize: 36, fontWeight: 700, lineHeight: 1, color: isNegative ? C.accent : C.text };
  const labStyle = { fontSize: 11, color: C.textMuted, marginTop: 2 };
  const box = { textAlign: "center", flex: 1 };
  const gradient = isNegative
    ? "linear-gradient(135deg, #2e1a2e 0%, #161622 60%)"
    : "linear-gradient(135deg, #1a2e1a 0%, #161622 60%)";
  const borderCol = isNegative ? C.accent + "30" : C.done + "30";
  const labelColor = isNegative ? C.accent : C.done;
  const labelText = isNegative ? "Sua jornada começa em" : "Você está livre há";

  return (
    <div style={{ padding: "28px 20px", background: gradient, borderRadius: 20, border: `1px solid ${borderCol}`, marginBottom: 14, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🚭</div>
      <div style={{ fontSize: 13, color: labelColor, fontWeight: 600, marginBottom: 16 }}>{labelText}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <div style={box}><div style={numStyle}>{sign}{totalDays}</div><div style={labStyle}>dia{totalDays !== 1 ? "s" : ""}</div></div>
        <div style={{ ...numStyle, alignSelf: "center", fontSize: 20, color: C.textMuted }}>:</div>
        <div style={box}><div style={numStyle}>{sign}{hours}</div><div style={labStyle}>hora{hours !== 1 ? "s" : ""}</div></div>
        <div style={{ ...numStyle, alignSelf: "center", fontSize: 20, color: C.textMuted }}>:</div>
        <div style={box}><div style={numStyle}>{sign}{minutes}</div><div style={labStyle}>min</div></div>
      </div>
    </div>
  );
}

function MilestonesSection({ totalDays }) {
  const nextIdx = MILESTONES.findIndex((m) => m.days > totalDays);
  const next = nextIdx >= 0 ? MILESTONES[nextIdx] : null;
  const achieved = MILESTONES.filter((m) => m.days <= totalDays);

  return (
    <div style={{ marginBottom: 20 }}>
      {next && (
        <div style={{ padding: 16, background: C.accent + "12", borderRadius: 14, border: `1px solid ${C.accent}30`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 4 }}>🎯 Próximo marco</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{next.label}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Faltam {next.days - totalDays} dia{(next.days - totalDays) !== 1 ? "s" : ""}</div>
          <div style={{ marginTop: 8, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", background: C.accent, borderRadius: 3, width: `${Math.min(100, (totalDays / next.days) * 100)}%`, transition: "width .5s" }} />
          </div>
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>🏅 Marcos & Benefícios</div>
      {MILESTONES.map((m) => {
        const done = totalDays >= m.days;
        return (
          <div key={m.days} style={{
            display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px",
            background: done ? C.done + "10" : C.surface, borderRadius: 12, marginBottom: 6,
            border: `1px solid ${done ? C.done + "30" : C.border}`, opacity: done ? 1 : 0.5,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? C.done : C.border, fontSize: 13, color: "#fff", fontWeight: 700,
            }}>{done ? "✓" : m.days}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: done ? C.done : C.text }}>{m.label}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{m.benefit}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EntrySection({ title, emoji, entries, type, onAdd, color }) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");

  return (
    <div style={{ padding: "18px 20px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{emoji} {title}</span>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 8, background: color + "15", color, fontWeight: 600 }}>{entries.length}</span>
      </div>
      <button onClick={() => setShow(!show)} style={{
        width: "100%", padding: "10px 14px", border: `1px dashed ${C.border}`, borderRadius: 10,
        background: "transparent", cursor: "pointer", fontSize: 13, color: C.textMuted,
        fontFamily: "'DM Sans',sans-serif", marginBottom: entries.length > 0 ? 10 : 0,
      }}>
        + {type === "craving" ? "Registrar vontade" : "Registrar vitória"}
      </button>
      {show && (
        <div style={{ marginTop: 8, animation: "fadeIn .3s ease" }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={type === "craving" ? "O que sentiu? Qual gatilho?" : "O que conquistou?"} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn v="ghost" onClick={() => { setShow(false); setText(""); }} style={{ fontSize: 12 }}>Cancelar</Btn>
            <Btn onClick={() => { if (text.trim()) { onAdd(type, text.trim()); setText(""); setShow(false); } }} disabled={!text.trim()} style={{ fontSize: 12 }}>Salvar</Btn>
          </div>
        </div>
      )}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
          {entries.slice(0, 10).map((e) => (
            <div key={e.id} style={{ padding: "8px 12px", background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: C.text }}>{e.text}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{new Date(e.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          ))}
          {entries.length > 10 && <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", padding: 4 }}>+{entries.length - 10} registros anteriores</div>}
        </div>
      )}
    </div>
  );
}

function StartScreen({ onStart }) {
  const [showCal, setShowCal] = useState(false);
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div style={{ padding: "40px 24px", background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚭</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: "'Fraunces',serif" }}>Jornada da Liberdade</div>
      <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
        Registre sua jornada sem fumar. Acompanhe marcos, benefícios de saúde desbloqueados e celebre cada vitória.
      </div>
      <Btn onClick={() => onStart(new Date().toISOString().split("T")[0])} style={{ padding: "14px 32px", fontSize: 16, marginBottom: 12 }}>
        🚭 Começo AGORA
      </Btn>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setShowCal(!showCal)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: C.accent, fontFamily: "'DM Sans',sans-serif" }}>
          Já parei antes? Escolher data
        </button>
      </div>
      {showCal && (
        <div style={{ maxWidth: 300, margin: "12px auto 0", animation: "fadeIn .3s ease" }}>
          <MiniCalendar value={selDate} onChange={(d) => setSelDate(d)} />
          <Btn onClick={() => onStart(selDate)} style={{ width: "100%", marginTop: 8 }}>
            Iniciar a partir de {new Date(selDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
          </Btn>
        </div>
      )}
    </div>
  );
}

export default function LibertyPageComponent({ smokeDate, cravings, victories, setStartDate, resetJourney, addEntry }) {
  const now = useNow(60000);
  const [showReset, setShowReset] = useState(false);

  const totalDays = useMemo(() => {
    if (!smokeDate) return 0;
    const diff = now - new Date(smokeDate + "T00:00:00");
    return Math.floor(diff / 86400000);
  }, [smokeDate, now]);

  const handleReset = () => {
    // Log days in cravings before resetting
    if (totalDays > 0) {
      addEntry("craving", `🔄 Recomeço — estava há ${totalDays} dia${totalDays !== 1 ? "s" : ""} livre`);
    }
    resetJourney();
    setShowReset(false);
  };

  if (!smokeDate) {
    return (
      <div style={{ animation: "fadeIn .4s ease", maxWidth: 600, margin: "0 auto" }}>
        <StartScreen onStart={setStartDate} />
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn .4s ease", maxWidth: 700, margin: "0 auto" }}>
      <Counter smokeDate={smokeDate} now={now} />

      {/* Reset button - close to counter, with highlight */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} style={{
            border: `1px solid ${C.overtime}40`, background: C.overtime + "10", cursor: "pointer",
            fontSize: 12, color: C.overtime, fontFamily: "'DM Sans',sans-serif", padding: "8px 20px",
            borderRadius: 10, fontWeight: 600, transition: "all .2s",
          }}>
            🔄 Recomeçar jornada
          </button>
        ) : (
          <div style={{ padding: 16, background: C.overtime + "10", borderRadius: 12, border: `1px solid ${C.overtime}30`, animation: "fadeIn .3s ease", maxWidth: 400, margin: "0 auto" }}>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>
              {totalDays > 0
                ? `Registrar que estava há ${totalDays} dia${totalDays !== 1 ? "s" : ""} e recomeçar?`
                : "Tem certeza? Isso reiniciará a jornada."}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Btn v="danger" onClick={handleReset} style={{ fontSize: 12 }}>Sim, recomeçar</Btn>
              <Btn v="ghost" onClick={() => setShowReset(false)} style={{ fontSize: 12 }}>Cancelar</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Motivation */}
      <div style={{ padding: "12px 16px", background: C.done + "10", borderRadius: 12, marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: C.done, fontStyle: "italic" }}>
          💪 {totalDays < 0 ? "A contagem regressiva começou. Você já tomou a decisão." :
               totalDays < 3 ? "O começo é o mais difícil. Você já está fazendo." :
               totalDays < 7 ? "Uma semana se aproxima. Cada hora conta." :
               totalDays < 30 ? "Seu corpo já sente a diferença. Continue." :
               totalDays < 90 ? "Mais de um mês. Isso é disciplina real." :
               "Você é prova viva de que é possível. Inspire outros."}
        </div>
      </div>

      <MilestonesSection totalDays={totalDays} />

      {/* Vontades e Vitórias - SIDE BY SIDE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <EntrySection title="Vontades" emoji="⚡" entries={cravings} type="craving" onAdd={addEntry} color={C.medium} />
        <EntrySection title="Vitórias" emoji="🏆" entries={victories} type="victory" onAdd={addEntry} color={C.done} />
      </div>
    </div>
  );
}
