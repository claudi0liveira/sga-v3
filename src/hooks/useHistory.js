"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function useHistory() {
  const { user } = useAuth();
  const supabase = createClient();
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("day_history").select("*").eq("user_id", user.id);
    if (data) {
      const h = {};
      data.forEach((row) => {
        const snap = typeof row.snapshot === "string" ? (() => { try { return JSON.parse(row.snapshot); } catch { return []; } })() : row.snapshot;
        h[row.date] = { snapshot: snap, note: row.note };
      });
      setHistory(h);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const closeDay = async (date, snapshot, note) => {
    await supabase.from("day_history").upsert({
      user_id: user.id,
      date,
      snapshot,
      note: note || null,
    }, { onConflict: "user_id,date" });
    setHistory((p) => ({ ...p, [date]: { snapshot, note } }));
  };

  return { history, loading, closeDay, refetch: fetch };
}
