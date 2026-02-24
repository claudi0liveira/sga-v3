"use client";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import ModuleGuard from "@/components/layout/ModuleGuard";
import DocsPageComponent from "@/components/layout/DocsPageComponent";
import { Loading } from "@/components/ui";

export default function DocsPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <AppShell><Loading /></AppShell>;

  return (
    <ModuleGuard module="docs">
      <AppShell>
        <DocsPageComponent />
      </AppShell>
    </ModuleGuard>
  );
}
