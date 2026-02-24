"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { C } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Email ou senha incorretos." : err.message);
      setLoading(false);
    } else {
      router.push("/calendario");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn .4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>SGA</div>
          <div style={{ fontSize: 14, color: C.textMuted, letterSpacing: "0.04em", marginTop: 4 }}>gestão de atividades</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>Senha</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: C.high + "15", border: `1px solid ${C.high}30`, fontSize: 13, color: C.high }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "all .2s" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>Não tem conta? </span>
          <a href="/registro" style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Criar conta</a>
        </div>

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 11, color: C.border }}>
          Este sistema mede tarefas. Não mede caráter.
        </div>
      </div>
    </div>
  );
}
