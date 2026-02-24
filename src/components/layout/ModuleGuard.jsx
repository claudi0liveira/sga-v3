"use client";
import { useModules } from "@/hooks/useModules";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Loading } from "@/components/ui";
import { C } from "@/lib/constants";

export default function ModuleGuard({ module, children }) {
  const { hasAccess, loading } = useModules();
  const router = useRouter();

  if (loading) return <AppShell><Loading /></AppShell>;

  if (!hasAccess(module)) {
    return (
      <AppShell>
        <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn .4s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Módulo Restrito</div>
          <div style={{ fontSize: 14, color: C.textMuted, maxWidth: 400, margin: "0 auto", marginBottom: 20 }}>
            Este módulo precisa ser liberado por um administrador.
          </div>
          <button onClick={() => router.push("/calendario")} style={{
            border: `1px solid ${C.border}`, background: C.surface, borderRadius: 10,
            padding: "10px 24px", fontSize: 13, color: C.text, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
          }}>
            ← Voltar
          </button>
        </div>
      </AppShell>
    );
  }

  return children;
}
