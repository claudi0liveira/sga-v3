"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useModules } from "@/hooks/useModules";
import { useAdmin } from "@/hooks/useAdmin";
import AppShell from "@/components/layout/AppShell";
import { C } from "@/lib/constants";
import { Loading } from "@/components/ui";

const ALL_MODULES = [
  { key: "calendario", label: "Calendário", icon: "📅", free: true },
  { key: "financeiro", label: "Gestão Financeira", icon: "💰", free: true },
  { key: "liberdade", label: "Jornada da Liberdade", icon: "🚭", free: false },
  { key: "dados", label: "Dados & Backup", icon: "💾", free: true },
  { key: "docs", label: "Documentação", icon: "📖", free: true },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: modLoading } = useModules();
  const { users, modules, loading: adminLoading, toggleModule, getUserModule } = useAdmin();

  if (authLoading || modLoading) return <AppShell><Loading /></AppShell>;

  if (!isAdmin) {
    return (
      <AppShell>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Acesso Restrito</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Apenas administradores podem acessar este painel.</div>
        </div>
      </AppShell>
    );
  }

  const freeCount = ALL_MODULES.filter((m) => m.free).length;
  const restrictedCount = ALL_MODULES.filter((m) => !m.free).length;
  const grantedCount = modules.filter((m) => m.enabled).length;

  return (
    <AppShell>
      <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeIn .4s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: C.text }}>Painel Admin</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Gerencie acesso aos módulos por usuário</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{users.length}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Usuários</div>
          </div>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#5BA87A" }}>{freeCount}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Módulos Livres</div>
          </div>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.medium }}>{restrictedCount}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Restritos</div>
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 11, color: C.textMuted }}>
          <span>🟢 Livre (todos acessam)</span>
          <span>🔒 Restrito (admin libera)</span>
        </div>

        {/* User list */}
        <div style={{ padding: "20px 22px", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>👥 Usuários & Módulos</div>

          {adminLoading ? (
            <div style={{ textAlign: "center", padding: 20 }}><Loading /></div>
          ) : users.length === 0 ? (
            <div style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: 20 }}>Nenhum usuário encontrado.</div>
          ) : users.map((u) => (
            <div key={u.id} style={{
              padding: "16px 18px", background: C.bg, borderRadius: 14, marginBottom: 10,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                    {u.name || "Sem nome"}
                    {u.id === user.id && (
                      <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, marginLeft: 8, background: C.accent + "20", color: C.accent, fontWeight: 700 }}>VOCÊ</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Courier New',monospace" }}>{u.id.slice(0, 8)}...</div>
                </div>
                <div style={{ fontSize: 10, color: C.textMuted }}>
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* ALL modules listed */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ALL_MODULES.map((mod) => {
                  const isFree = mod.free;
                  const grant = getUserModule(u.id, mod.key);
                  const enabled = isFree ? true : !!grant;
                  return (
                    <div key={mod.key} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", background: enabled ? (isFree ? "#5BA87A08" : "#5BA87A10") : C.surface,
                      borderRadius: 10, border: `1px solid ${enabled ? (isFree ? "#5BA87A15" : "#5BA87A30") : C.border}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{mod.label}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>
                            {isFree ? "🟢 Livre" : (enabled ? "🔓 Liberado" : "🔒 Bloqueado")}
                          </div>
                        </div>
                      </div>
                      {isFree ? (
                        <span style={{ fontSize: 10, color: "#5BA87A", fontWeight: 600, padding: "3px 10px", background: "#5BA87A15", borderRadius: 8 }}>LIVRE</span>
                      ) : (
                        <button
                          onClick={() => toggleModule(u.id, mod.key, !grant)}
                          style={{
                            width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                            background: enabled ? "#5BA87A" : C.border, position: "relative",
                            transition: "background .3s",
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%", background: "#fff",
                            position: "absolute", top: 3,
                            left: enabled ? 25 : 3,
                            transition: "left .3s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: C.accent + "10", borderRadius: 12, border: `1px solid ${C.accent}30` }}>
          <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 4 }}>ℹ️ Como funciona</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
            Módulos livres (🟢) são acessíveis a todos automaticamente.
            Módulos restritos (🔒) precisam ser liberados por toggle.
            O usuário não vê o módulo no menu até ser liberado.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
