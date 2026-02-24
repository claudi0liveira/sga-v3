"use client";
import { useAuth } from "@/hooks/useAuth";
import { useLiberty } from "@/hooks/useLiberty";
import AppShell from "@/components/layout/AppShell";
import LibertyPageComponent from "@/components/liberty/LibertyPageComponent";
import { Loading } from "@/components/ui";

export default function LiberdadePage() {
  const { loading: authLoading } = useAuth();
  const liberty = useLiberty();

  if (authLoading || liberty.loading) return <AppShell><Loading /></AppShell>;

  return (
    <AppShell>
      <LibertyPageComponent {...liberty} />
    </AppShell>
  );
}
