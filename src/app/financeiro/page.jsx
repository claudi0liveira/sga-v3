"use client";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/hooks/useFinance";
import AppShell from "@/components/layout/AppShell";
import ModuleGuard from "@/components/layout/ModuleGuard";
import FinancePageComponent from "@/components/finance/FinancePageComponent";
import { Loading } from "@/components/ui";

export default function FinanceiroPage() {
  const { loading: authLoading } = useAuth();
  const finance = useFinance();

  if (authLoading || finance.loading) return <AppShell><Loading /></AppShell>;

  return (
    <ModuleGuard module="financeiro">
      <AppShell>
        <FinancePageComponent {...finance} />
      </AppShell>
    </ModuleGuard>
  );
}
