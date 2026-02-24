"use client";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import ModuleGuard from "@/components/layout/ModuleGuard";
import DataManagementComponent from "@/components/data/DataManagementComponent";
import { Loading } from "@/components/ui";

export default function DadosPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <AppShell><Loading /></AppShell>;

  return (
    <ModuleGuard module="dados">
      <AppShell>
        <DataManagementComponent />
      </AppShell>
    </ModuleGuard>
  );
}
