"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useModules } from "@/hooks/useModules";
import { C } from "@/lib/constants";

const NAV_ITEMS = [
  { key: "/calendario", label: "Gestão de Tarefas", icon: "📅", module: null },
  { key: "/financeiro", label: "Gestão Financeira", icon: "💰", module: null },
  { key: "/liberdade", label: "Jornada da Liberdade", icon: "🚭", module: "liberdade" },
  { key: "/dados", label: "Dados & Backup", icon: "💾", module: null },
  { key: "/docs", label: "Documentação", icon: "📖", module: null },
];

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { hasAccess, isAdmin } = useModules();

  const navigate = (path) => {
    router.push(path);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.25)", zIndex: 998, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: C.surface, zIndex: 999,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .3s ease",
        boxShadow: sidebarOpen ? "4px 0 30px rgba(0,0,0,.1)" : "none", display: "flex", flexDirection: "column",
        padding: "24px 0",
      }}>
        <div style={{ padding: "0 20px", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: C.text }}>SGA</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>gestão de atividades</div>
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.filter((item) => !item.module || hasAccess(item.module)).map((item) => {
            const isActive = pathname.startsWith(item.key);
            return (
              <button key={item.key} onClick={() => navigate(item.key)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 20px",
                border: "none", background: isActive ? C.accent + "12" : "transparent",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                color: isActive ? C.accent : C.text, transition: "all .2s",
                borderRight: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: C.border, margin: "8px 20px" }} />
              <button onClick={() => navigate("/admin")} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 20px",
                border: "none", background: pathname === "/admin" ? C.accent + "12" : "transparent",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                color: pathname === "/admin" ? C.accent : C.textMuted, transition: "all .2s",
                borderRight: pathname === "/admin" ? `3px solid ${C.accent}` : "3px solid transparent",
              }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                Painel Admin
              </button>
            </>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={async () => { await signOut(); router.push("/login"); }}
            style={{
              width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Sair da conta
          </button>
          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6, textAlign: "center", marginTop: 12 }}>
            Este sistema mede tarefas.<br />Não mede caráter.
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px 100px", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            border: "none", background: C.bg, borderRadius: 10, width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: C.textMuted,
          }}>
            ☰
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>SGA</div>
            <div style={{ fontSize: 12, color: C.textMuted, letterSpacing: "0.04em" }}>gestão de atividades</div>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {children}
      </div>
    </>
  );
}
