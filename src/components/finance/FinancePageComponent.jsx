"use client";
import { useState, useMemo } from "react";
import { C, DEFAULT_CATEGORIES } from "@/lib/constants";
import { fmtBRL, pad, monthKey } from "@/lib/helpers";
import { Card, Btn, Input, Select } from "@/components/ui";

function MonthNav({ current, onChange }) {
  const [y, m] = current.split("-").map(Number);
  const label = new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const prev = () => { const d = new Date(y, m - 2); onChange(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };
  const next = () => { const d = new Date(y, m); onChange(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
      <button onClick={prev} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: C.accent, padding: "4px 10px" }}>‹</button>
      <span style={{ fontSize: 16, fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{label}</span>
      <button onClick={next} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: C.accent, padding: "4px 10px" }}>›</button>
    </div>
  );
}

function DashCard({ label, value, color, emoji }) {
  return (
    <div style={{ padding: 16, background: "#1E1E2E", borderRadius: 14, border: "1px solid #2A2A3E", position: "relative" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{fmtBRL(value)}</div>
      {emoji && <span style={{ position: "absolute", top: 12, right: 14, fontSize: 18, opacity: 0.6 }}>{emoji}</span>}
    </div>
  );
}

function IncomeForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [day, setDay] = useState("5");
  return (
    <div style={{ padding: 14, background: C.bg, borderRadius: 12, marginTop: 10, animation: "fadeIn .3s ease" }}>
      <Input label="Nome da renda" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Salário" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Input label="Valor mensal" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
        <Input label="Dia recebimento" type="number" min="1" max="28" value={day} onChange={(e) => setDay(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
        <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={() => { if (name && value) onAdd({ name, value: parseFloat(value), pay_day: parseInt(day) || 5 }); }} disabled={!name || !value}>✓ Salvar</Btn>
      </div>
    </div>
  );
}

function ExpenseForm({ onAdd, onCancel, currentMonth }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("Outros");
  return (
    <div style={{ padding: 14, background: C.bg, borderRadius: 12, marginTop: 10, animation: "fadeIn .3s ease" }}>
      <Input label="Nome da despesa" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aluguel" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Input label="Valor" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
        <Select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} options={DEFAULT_CATEGORIES} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
        <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={() => { if (name && value) onAdd({ name, value: parseFloat(value), category, paid: false, month_key: currentMonth }); }} disabled={!name || !value}>✓ Salvar</Btn>
      </div>
    </div>
  );
}

function ReserveItemForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  return (
    <div style={{ padding: 12, background: C.bg, borderRadius: 10, marginTop: 8, animation: "fadeIn .3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
        <Input label="Descrição" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Depósito mensal" />
        <Input label="Valor" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn v="ghost" onClick={onCancel} style={{ fontSize: 12 }}>Cancelar</Btn>
        <Btn onClick={() => { if (label && value) onAdd(label, parseFloat(value)); }} disabled={!label || !value} style={{ fontSize: 12 }}>Adicionar</Btn>
      </div>
    </div>
  );
}

export default function FinancePageComponent({
  incomes, expenses, reserves, totalReserved,
  addIncome, deleteIncome, addExpense, updateExpense, deleteExpense,
  addReserve, deleteReserve, addReserveItem, deleteReserveItem,
}) {
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [showIncForm, setShowIncForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showResForm, setShowResForm] = useState(false);
  const [newResName, setNewResName] = useState("");
  const [openReserve, setOpenReserve] = useState(null);
  const [addingItem, setAddingItem] = useState(null);

  const monthExpenses = useMemo(() =>
    (expenses || []).filter((e) => (e.month_key || monthKey(e.created_at)) === month),
    [expenses, month]
  );

  const totalIncome = (incomes || []).reduce((s, i) => s + Number(i.value), 0);
  const totalPaid = monthExpenses.filter((e) => e.paid).reduce((s, e) => s + Number(e.value), 0);
  const totalProjected = monthExpenses.reduce((s, e) => s + Number(e.value), 0);
  const balance = totalIncome - totalPaid;

  const cs = {
    card: { padding: "20px 22px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 16 },
    hdr: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    title: { fontSize: 16, fontWeight: 700, color: C.text },
    empty: { fontSize: 13, color: C.textMuted, textAlign: "center", padding: "20px 0" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: C.bg, borderRadius: 12, marginBottom: 6 },
  };

  return (
    <div style={{ animation: "fadeIn .4s ease", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: C.text, marginBottom: 16 }}>Gestão Financeira</div>
      <MonthNav current={month} onChange={setMonth} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <DashCard label="Renda Total" value={totalIncome} color="#5BA87A" emoji="📈" />
        <DashCard label="Total Gasto" value={totalPaid} color={C.high} emoji="📉" />
        <DashCard label="Saldo do Mês" value={balance} color={balance >= 0 ? "#5BA87A" : C.high} emoji="💳" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <DashCard label="Desp. Projetadas" value={totalProjected} color={C.medium} emoji="📊" />
        <DashCard label="Reservado" value={totalReserved} color={C.medium} emoji="🐷" />
      </div>

      {/* Rendas */}
      <div style={cs.card}>
        <div style={cs.hdr}>
          <span style={cs.title}>Rendas</span>
          <button onClick={() => setShowIncForm(!showIncForm)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: C.accent, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>+ Renda</button>
        </div>
        {showIncForm && <IncomeForm onAdd={(inc) => { addIncome(inc); setShowIncForm(false); }} onCancel={() => setShowIncForm(false)} />}
        {(incomes || []).length === 0 && !showIncForm ? (
          <div style={cs.empty}>Nenhuma renda neste mês. <button onClick={() => setShowIncForm(true)} style={{ border: "none", background: "none", color: C.accent, cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>Adicionar</button></div>
        ) : (incomes || []).map((inc) => (
          <div key={inc.id} style={cs.row}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{inc.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Dia {inc.pay_day || "—"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#5BA87A" }}>{fmtBRL(inc.value)}</span>
              <button onClick={() => deleteIncome(inc.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: C.overtime, padding: 2 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Despesas */}
      <div style={cs.card}>
        <div style={cs.hdr}>
          <span style={cs.title}>Despesas</span>
          <Btn onClick={() => setShowExpForm(!showExpForm)} style={{ fontSize: 12, padding: "6px 14px" }}>+ Despesa</Btn>
        </div>
        {showExpForm && <ExpenseForm onAdd={(exp) => { addExpense(exp); setShowExpForm(false); }} onCancel={() => setShowExpForm(false)} currentMonth={month} />}
        {monthExpenses.length === 0 && !showExpForm ? (
          <div style={cs.empty}>Nenhuma despesa neste mês.</div>
        ) : monthExpenses.map((exp) => (
          <div key={exp.id} style={{ ...cs.row, borderLeft: `3px solid ${exp.paid ? C.done : C.medium}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <button onClick={() => updateExpense(exp.id, { paid: !exp.paid })} style={{
                width: 24, height: 24, borderRadius: 8, border: `2px solid ${exp.paid ? C.done : C.border}`,
                background: exp.paid ? C.done : "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{exp.paid && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}</button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text, textDecoration: exp.paid ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{exp.category || "Outros"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: exp.paid ? C.done : C.text }}>{fmtBRL(exp.value)}</span>
              <button onClick={() => deleteExpense(exp.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: C.overtime, padding: 2 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Reservas */}
      <div style={cs.card}>
        <div style={cs.hdr}>
          <span style={cs.title}>🐷 Reservas</span>
          <button onClick={() => setShowResForm(!showResForm)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: C.medium, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>+ Reserva</button>
        </div>
        {showResForm && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12, animation: "fadeIn .3s ease" }}>
            <Input value={newResName} onChange={(e) => setNewResName(e.target.value)} placeholder="Nome da reserva (ex: Emergência)" style={{ flex: 1 }} />
            <Btn onClick={() => { if (newResName.trim()) { addReserve(newResName.trim()); setNewResName(""); setShowResForm(false); } }} disabled={!newResName.trim()} style={{ fontSize: 12 }}>Criar</Btn>
            <Btn v="ghost" onClick={() => setShowResForm(false)} style={{ fontSize: 12 }}>✕</Btn>
          </div>
        )}
        {(reserves || []).length === 0 && !showResForm ? (
          <div style={cs.empty}>Nenhuma reserva criada. Crie para guardar valores.</div>
        ) : (reserves || []).map((res) => {
          const total = (res.items || []).reduce((s, i) => s + Number(i.value), 0);
          const isOpen = openReserve === res.id;
          return (
            <div key={res.id} style={{ background: C.bg, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              <button onClick={() => setOpenReserve(isOpen ? null : res.id)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
                padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{res.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{(res.items || []).length} depósito{(res.items || []).length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.medium }}>{fmtBRL(total)}</span>
                  <span style={{ fontSize: 12, color: C.textMuted, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: "0 16px 14px", animation: "fadeIn .2s ease" }}>
                  {(res.items || []).map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.text }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{new Date(item.created_at).toLocaleDateString("pt-BR")}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#5BA87A" }}>{fmtBRL(item.value)}</span>
                        <button onClick={() => deleteReserveItem(res.id, item.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: C.overtime }}>✕</button>
                      </div>
                    </div>
                  ))}
                  {addingItem === res.id ? (
                    <ReserveItemForm onAdd={(l, v) => { addReserveItem(res.id, l, v); setAddingItem(null); }} onCancel={() => setAddingItem(null)} />
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      <button onClick={() => setAddingItem(res.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>+ Adicionar valor</button>
                      <button onClick={() => deleteReserve(res.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11, color: C.overtime, fontFamily: "'DM Sans',sans-serif" }}>Excluir reserva</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
