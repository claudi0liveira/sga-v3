"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { C } from "@/lib/constants";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Senha deve ter no mínimo 6 caracteres."); return; }
    setLoading(true);
    const { error: err } = await signUp(email, password, name);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }}>
        <div style={{ textAlign: "center", maxWidth: 400, animation: "fadeIn .4s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Verifique seu email</div>
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
            Enviamos um link de confirmação para <strong style={{ color: C.text }}>{email}</strong>. 
            Clique no link para ativar sua conta.
          </div>
          <a href="/login" style={{ fontSize: 14, color: C.accent, fontWeight: 600 }}>← Voltar para login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn .4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 700, color: C.text }}>SGA</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Criar conta</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>Nome</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome" required
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
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
              placeholder="Mínimo 6 caracteres" required
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
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>Já tem conta? </span>
          <a href="/login" style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Entrar</a>
        </div>
      </div>
    </div>
  );
}
