"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";
import { todayKey, dateKey, timeFromDb, timeToDb } from "@/lib/helpers";
import { STATUS, getBlock } from "@/lib/constants";

// Transform DB row → frontend task object
function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    priority: row.priority,
    block: row.block,
    startTime: timeFromDb(row.start_time),
    duration: row.duration,
    status: row.status,
    date: row.date,
    timerRunning: row.timer_running,
    accumulatedTime: row.accumulated_time,
    note: row.note,
    todos: typeof row.todos === "string" ? (() => { try { return JSON.parse(row.todos); } catch { return []; } })() : Array.isArray(row.todos) ? row.todos : [],
    replanCount: row.replan_count,
    replanFrom: row.replan_from,
    rangeGroup: row.range_group,
    rangeIndex: row.range_index,
    rangeTotal: row.range_total,
    weeklyTag: row.weekly_tag,
  };
}

// Transform frontend task → DB row
function toDb(task, userId) {
  return {
    user_id: userId,
    date: task.date || todayKey(),
    name: task.name,
    priority: task.priority,
    block: task.block || getBlock(task.priority),
    start_time: timeToDb(task.startTime),
    duration: task.duration || 30,
    status: task.status || STATUS.SCHEDULED,
    timer_running: task.timerRunning || false,
    accumulated_time: task.accumulatedTime || 0,
    note: task.note || null,
    todos: task.todos || [],
    replan_count: task.replanCount || 0,
    replan_from: task.replanFrom || null,
    range_group: task.rangeGroup || null,
    range_index: task.rangeIndex || null,
    range_total: task.rangeTotal || null,
    weekly_tag: task.weeklyTag || null,
  };
}


// ============================================================
// FIX: Supabase retorna no máximo 1000 rows por query.
// Com 2657+ tasks, a query antiga cortava os dados.
// Essa função pagina automaticamente para buscar TUDO.
// ============================================================
async function fetchAllRows(supabase, table, userId) {
  const PAGE_SIZE = 1000;
  let allData = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allData;
}

export function useTasks() {
  const { user } = useAuth();
  const supabase = createClient();
  const [tasks, setTasks] = useState({}); // { "2026-02-23": [task, task], ... }
  const [loading, setLoading] = useState(true);

  // Fetch all tasks for user
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchAllRows(supabase, "tasks", user.id);

    if (data.length > 0) {
      const grouped = {};
      data.forEach((row) => {
        const dk = row.date;
        if (!grouped[dk]) grouped[dk] = [];
        grouped[dk].push(fromDb(row));
      });
      setTasks(grouped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Add single task
  const addTask = async (task) => {
    if (!user) return;
    const dbRow = toDb(task, user.id);
    const { data, error } = await supabase.from("tasks").insert(dbRow).select().single();
    if (!error && data) {
      const t = fromDb(data);
      setTasks((prev) => ({
        ...prev,
        [t.date]: [...(prev[t.date] || []), t].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }));
      return t;
    }
    return null;
  };

  // Add batch tasks
  const addBatchTasks = async (taskList) => {
    if (!user) return;
    const rows = taskList.map((t) => toDb(t, user.id));
    const { data, error } = await supabase.from("tasks").insert(rows).select();
    if (!error && data) {
      setTasks((prev) => {
        const n = { ...prev };
        data.forEach((row) => {
          const t = fromDb(row);
          n[t.date] = [...(n[t.date] || []), t].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return n;
      });
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    if (!user) return;
    const dbUpdates = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.timerRunning !== undefined) dbUpdates.timer_running = updates.timerRunning;
    if (updates.accumulatedTime !== undefined) dbUpdates.accumulated_time = updates.accumulatedTime;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.todos !== undefined) dbUpdates.todos = updates.todos;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.priority !== undefined) {
      dbUpdates.priority = updates.priority;
      dbUpdates.block = getBlock(updates.priority);
    }
    if (updates.startTime !== undefined) dbUpdates.start_time = timeToDb(updates.startTime);
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.replanCount !== undefined) dbUpdates.replan_count = updates.replanCount;
    if (updates.replanFrom !== undefined) dbUpdates.replan_from = updates.replanFrom;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.block !== undefined) dbUpdates.block = updates.block;

    const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", taskId);
    if (!error) {
      setTasks((prev) => {
        const n = { ...prev };
        Object.keys(n).forEach((dk) => {
          const idx = n[dk].findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            n[dk] = [...n[dk]];
            n[dk][idx] = { ...n[dk][idx], ...updates };
            // If date changed, move to new date
            if (updates.date && updates.date !== dk) {
              const task = n[dk][idx];
              n[dk] = n[dk].filter((_, i) => i !== idx);
              n[updates.date] = [...(n[updates.date] || []), task].sort((a, b) => a.startTime.localeCompare(b.startTime));
            }
          }
        });
        return n;
      });
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!user) return;
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (!error) {
      setTasks((prev) => {
        const n = { ...prev };
        Object.keys(n).forEach((dk) => {
          n[dk] = n[dk].filter((t) => t.id !== taskId);
          if (n[dk].length === 0) delete n[dk];
        });
        return n;
      });
    }
  };

  // Reschedule task
  const rescheduleTask = async (taskId, newDate, fromDate) => {
    if (!user) return;
    // Find task
    let task = null;
    Object.values(tasks).flat().forEach((t) => { if (t.id === taskId) task = t; });
    if (!task) return;

    await updateTask(taskId, {
      date: newDate,
      status: STATUS.SCHEDULED,
      timerRunning: false,
      accumulatedTime: 0,
      replanCount: (task.replanCount || 0) + 1,
      replanFrom: fromDate || task.replanFrom || task.date,
    });
  };

  // Get pending tasks from past days (for replan)
  const getPendingPastTasks = () => {
    const pending = [];
    const today = todayKey();
    Object.entries(tasks).forEach(([dk, dayTasks]) => {
      if (dk >= today) return;
      dayTasks.forEach((t) => {
        if ([STATUS.SCHEDULED, STATUS.ACTIVE, STATUS.PAUSED].includes(t.status)) {
          pending.push(t);
        }
      });
    });
    return pending;
  };

  return {
    tasks,
    loading,
    addTask,
    addBatchTasks,
    updateTask,
    deleteTask,
    rescheduleTask,
    getPendingPastTasks,
    refetch: fetchTasks,
  };
}
