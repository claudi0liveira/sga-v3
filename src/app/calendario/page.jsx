"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useHistory } from "@/hooks/useHistory";
import { usePriorities } from "@/hooks/usePriorities";
import { useQuickLinks } from "@/hooks/useQuickLinks";
import { useFinance } from "@/hooks/useFinance";
import { useLiberty } from "@/hooks/useLiberty";
import AppShell from "@/components/layout/AppShell";
import OnboardingModal from "@/components/layout/OnboardingModal";
import ReplanModal from "@/components/calendar/ReplanModal";
import CalendarDashboard from "@/components/calendar/CalendarDashboard";
import { Loading } from "@/components/ui";

export default function CalendarioPage() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, addTask, addBatchTasks, updateTask, deleteTask, rescheduleTask, getPendingPastTasks } = useTasks();
  const { history, closeDay } = useHistory();
  const { priorities, phase, savePriorities, savePhase } = usePriorities();
  const { links, addLink, removeLink } = useQuickLinks();
  const { totalReserved } = useFinance();
  const { smokeDate } = useLiberty();

  if (authLoading || tasksLoading) return <AppShell><Loading /></AppShell>;

  const pendingTasks = getPendingPastTasks();

  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("sga_onboarding_done");
      if (!seen) setShowOnboard(true);
    } catch { setShowOnboard(true); }
  }, []);

  const dismissOnboard = () => {
    setShowOnboard(false);
    try { localStorage.setItem("sga_onboarding_done", "1"); } catch {}
  };

  return (
    <AppShell>
      {showOnboard && <OnboardingModal onDismiss={dismissOnboard} />}
      {pendingTasks.length > 0 && <ReplanModal pendingTasks={pendingTasks} onReplan={rescheduleTask} />}
      <CalendarDashboard
        allTasks={tasks}
        history={history}
        priorities={priorities}
        phase={phase}
        quickLinks={links}
        onUpdatePriorities={savePriorities}
        onUpdatePhase={savePhase}
        onAddLink={addLink}
        onRemoveLink={removeLink}
        smokeDate={smokeDate}
        totalReserved={totalReserved}
      />
    </AppShell>
  );
}
