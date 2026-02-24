"use client";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import DataManagementComponent from "@/components/data/DataManagementComponent";
import { Loading } from "@/components/ui";

export default function DadosPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <AppShell><Loading /></AppShell>;

  return (
    <AppShell>
      <DataManagementComponent />
    </AppShell>
  );
}
