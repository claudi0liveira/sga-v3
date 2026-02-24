"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { Btn } from "@/components/ui";

const STEPS = [
  {
    emoji: "👋",
    title: "Bem-vindo ao SGA!",
    subtitle: "Sistema de Gestão de Atividades",
    text: "Seu sistema pessoal para organizar tarefas, finanças e hábitos — tudo num só lugar.",
  },
  {
    emoji: "📋",
    title: "Planeje seu dia",
    subtitle: null,
    text: "Crie tarefas com horário, duração e prioridade. Agrupe em blocos, acompanhe o progresso em tempo real e encerre o dia com uma reflexão.",
  },
  {
    emoji: "💰",
    title: "Controle financeiro",
    subtitle: null,
    text: "Registre rendas (globais ou por mês), despesas por categoria e reservas. Acompanhe saldo, projeções e metas de economia.",
  },
  {
    emoji: "🚭",
    title: "Jornada da Liberdade",
    subtitle: null,
    text: "Acompanhe sua jornada livre de vícios com contador em tempo real, marcos de saúde, registro de vontades e vitórias.",
  },
  {
    emoji: "☁️",
    title: "Seus dados na nuvem",
    subtitle: null,
    text: "Diferente de apps que usam localStorage, seus dados ficam salvos na nuvem. Acesse de qualquer dispositivo sem perder nada.",
  },
];

export default function OnboardingModal({ onDismiss }) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleFinish = () => {
    onDismiss();
  };

  const handleDocs = () => {
    onDismiss();
    router.push("/docs");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onDismiss} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "relative", width: "90%", maxWidth: 440, padding: "32px 28px",
        background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`,
        animation: "fadeIn .4s ease", textAlign: "center",
      }}>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? C.accent : C.border, transition: "all .3s",
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ animation: "fadeIn .3s ease" }} key={step}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{current.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4, fontFamily: "'Fraunces',serif" }}>
            {current.title}
          </div>
          {current.subtitle && (
            <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 12 }}>{current.subtitle}</div>
          )}
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, marginTop: 12, marginBottom: 28, maxWidth: 360, margin: "12px auto 28px" }}>
            {current.text}
          </div>
        </div>

        {/* Actions */}
        {!isLast ? (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={onDismiss} style={{
              border: "none", background: "none", cursor: "pointer", fontSize: 13,
              color: C.textMuted, fontFamily: "'DM Sans',sans-serif", padding: "10px 16px",
            }}>Pular</button>
            <Btn onClick={() => setStep(step + 1)} style={{ padding: "12px 32px", fontSize: 14 }}>
              Próximo →
            </Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <Btn onClick={handleFinish} style={{ padding: "14px 40px", fontSize: 15, width: "100%" }}>
              🚀 Começar a usar!
            </Btn>
            <button onClick={handleDocs} style={{
              border: `1px solid ${C.accent}40`, background: C.accent + "10", cursor: "pointer",
              fontSize: 13, color: C.accent, fontFamily: "'DM Sans',sans-serif",
              padding: "10px 24px", borderRadius: 10, fontWeight: 600, width: "100%",
            }}>
              📖 Ver documentação completa
            </button>
          </div>
        )}

        {/* Step counter */}
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 16 }}>
          {step + 1} de {STEPS.length}
        </div>
      </div>
    </div>
  );
}
