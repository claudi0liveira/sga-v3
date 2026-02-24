"use client";
import { useAuth } from "@/hooks/useAuth";
import { useLiberty } from "@/hooks/useLiberty";
import { useModules } from "@/hooks/useModules";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import LibertyPageComponent from "@/components/liberty/LibertyPageComponent";
import { Loading } from "@/components/ui";
import { C } from "@/lib/constants";

export default function LiberdadePage() {
  const { loading: authLoading } = useAuth();
  const liberty = useLiberty();
  const { hasAccess, loading: modLoading } = useModules();
  const router = useRouter();

  if (authLoading || liberty.loading || modLoading) return <AppShell><Loading /></AppShell>;

  if (!hasAccess("liberdade")) {
    return (
      <AppShell>
        <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn .4s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Módulo Restrito</div>
          <div style={{ fontSize: 14, color: C.textMuted, maxWidth: 400, margin: "0 auto" }}>
            A Jornada da Liberdade precisa ser liberada por um administrador.
            Entre em contato para solicitar acesso.
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LibertyPageComponent {...liberty} />
    </AppShell>
  );
}
