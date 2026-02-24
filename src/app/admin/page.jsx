"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useModules } from "@/hooks/useModules";
import { useAdmin } from "@/hooks/useAdmin";
import AppShell from "@/components/layout/AppShell";
import { C } from "@/lib/constants";
import { Loading, Modal, Btn } from "@/components/ui";

const ALL_MODULES = [
  { key: "calendario", label: "Gestão de Tarefas", icon: "📅" },
  { key: "financeiro", label: "Gestão Financeira", icon: "💰" },
  { key: "liberdade", label: "Jornada da Liberdade", icon: "🚭" },
  { key: "dados", label: "Dados & Backup", icon: "💾" },
  { key: "docs", label: "Documentação", icon: "📖" },
];

const ROLES = [
  { key: "admin", label: "Admin", icon: "👑", color: C.accent, desc: "Acesso total + painel admin" },
  { key: "colaborador", label: "Colaborador", icon: "👤", color: "#5BA87A", desc: "Acesso só aos módulos liberados" },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: modLoading } = useModules();
  const { users, modules, loading: adminLoading, toggleModule, setUserRole, getUserModule, getUserModuleCount } = useAdmin();
  const [confirmRole, setConfirmRole] = useState(null);

  if (authLoading || modLoading) return <AppShell><Loading /></AppShell>;

  if (!isAdmin) {
    return (
      <AppShell>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Acesso Restrito</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Apenas administradores.</div>
        </div>
      </AppShell>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const colabCount = users.filter((u) => u.role !== "admin").length;
  const totalMods = modules.filter((m) => m.enabled).length;

  return (
    <AppShell>
      <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeIn .4s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: C.text }}>Painel Admin</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Usuários, roles e módulos</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{users.length}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Usuários</div>
          </div>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#D4A843" }}>{adminCount}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Admins</div>
          </div>
          <div style={{ padding: 16, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#5BA87A" }}>{totalMods}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Módulos ativos</div>
          </div>
        </div>

        {/* User list */}
        {adminLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Loading /></div>
        ) : users.map((u) => {
          const isMe = u.id === user.id;
          const isUserAdmin = u.role === "admin";
          const modCount = isUserAdmin ? ALL_MODULES.length : getUserModuleCount(u.id);

          return (
            <div key={u.id} style={{
              padding: "18px 20px", background: C.surface, borderRadius: 16, marginBottom: 12,
              border: `1px solid ${isUserAdmin ? C.accent + "30" : C.border}`,
            }}>
              {/* User header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                    {u.name || "Sem nome"}
                    {isMe && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: C.accent + "20", color: C.accent, fontWeight: 700 }}>VOCÊ</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Courier New',monospace" }}>{u.id.slice(0, 12)}...</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{new Date(u.created_at).toLocaleDateString("pt-BR")}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{modCount}/{ALL_MODULES.length} módulos</div>
                </div>
              </div>

              {/* Role selector */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {ROLES.map((r) => {
                  const active = u.role === r.key;
                  return (
                    <button key={r.key}
                      onClick={() => {
                        if (!active && !(isMe && r.key !== "admin")) {
                          setConfirmRole({ userId: u.id, userName: u.name, role: r.key, currentRole: u.role });
                        }
                      }}
                      disabled={isMe && u.role === "admin" && r.key !== "admin"}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 10, cursor: active ? "default" : "pointer",
                        border: `1px solid ${active ? r.color + "50" : C.border}`,
                        background: active ? r.color + "12" : "transparent",
                        fontFamily: "'DM Sans',sans-serif", transition: "all .2s",
                        opacity: (isMe && u.role === "admin" && r.key !== "admin") ? 0.3 : 1,
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{r.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? r.color : C.text }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{r.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Module toggles - only for colaboradores */}
              {!isUserAdmin && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>MÓDULOS LIBERADOS</div>
                  {ALL_MODULES.map((mod) => {
                    const grant = getUserModule(u.id, mod.key);
                    const enabled = !!grant;
                    return (
                      <div key={mod.key} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", background: enabled ? "#5BA87A08" : C.bg,
                        borderRadius: 10, border: `1px solid ${enabled ? "#5BA87A25" : C.border}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{mod.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{mod.label}</span>
                        </div>
                        <button
                          onClick={() => toggleModule(u.id, mod.key, !enabled)}
                          style={{
                            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                            background: enabled ? "#5BA87A" : C.border, position: "relative",
                            transition: "background .3s",
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%", background: "#fff",
                            position: "absolute", top: 3,
                            left: enabled ? 23 : 3,
                            transition: "left .3s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Admin badge - show all access */}
              {isUserAdmin && (
                <div style={{ padding: "10px 14px", background: C.accent + "08", borderRadius: 10, border: `1px solid ${C.accent}20` }}>
                  <div style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>👑 Acesso total a todos os módulos</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Confirm role change modal */}
        {confirmRole && (
          <Modal onClose={() => setConfirmRole(null)}>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{confirmRole.role === "admin" ? "👑" : "👤"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                Alterar role de {confirmRole.userName || "usuário"}?
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
                {confirmRole.currentRole} → <strong>{confirmRole.role}</strong>
                {confirmRole.role === "admin" && <><br />Terá acesso total + painel admin</>}
                {confirmRole.role === "colaborador" && <><br />Perderá acesso ao painel admin. Módulos atuais mantidos.</>}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <Btn v="ghost" onClick={() => setConfirmRole(null)} style={{ fontSize: 13 }}>Cancelar</Btn>
                <Btn onClick={async () => {
                  await setUserRole(confirmRole.userId, confirmRole.role);
                  setConfirmRole(null);
                }} style={{ fontSize: 13 }}>
                  Confirmar
                </Btn>
              </div>
            </div>
          </Modal>
        )}

        {/* Info */}
        <div style={{ marginTop: 8, padding: "14px 18px", background: C.accent + "08", borderRadius: 12, border: `1px solid ${C.accent}20` }}>
          <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 6 }}>ℹ️ Como funciona</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
            <strong>Admin</strong>: acesso total a todos os módulos + este painel.<br />
            <strong>Colaborador</strong>: só vê os módulos que você ativar nos toggles.<br />
            Novos usuários entram como colaborador sem nenhum módulo. Ative o que cada um precisa.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
