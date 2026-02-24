"use client";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useHistory } from "@/hooks/useHistory";
import AppShell from "@/components/layout/AppShell";
import DayViewComponent from "@/components/calendar/DayViewComponent";
import { Loading } from "@/components/ui";

export default function DiaPage() {
  const { date } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, addTask, addBatchTasks, updateTask, deleteTask, rescheduleTask } = useTasks();
  const { history, closeDay } = useHistory();

  if (authLoading || tasksLoading) return <AppShell><Loading /></AppShell>;

  const dayTasks = tasks[date] || [];

  return (
    <AppShell>
      <DayViewComponent
        selectedDate={date}
        tasks={dayTasks}
        allTasks={tasks}
        onAddTask={addTask}
        onAddBatch={addBatchTasks}
        onUpdate={updateTask}
        onCloseDay={(note) => closeDay(date, dayTasks, note)}
        onDelete={deleteTask}
        onReschedule={rescheduleTask}
      />
    </AppShell>
  );
}
