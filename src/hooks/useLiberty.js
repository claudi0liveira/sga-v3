"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function useLiberty() {
  const { user } = useAuth();
  const supabase = createClient();
  const [smokeDate, setSmokeDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [lib, ent] = await Promise.all([
      supabase.from("liberty").select("*").eq("user_id", user.id).single(),
      supabase.from("liberty_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (lib.data) setSmokeDate(lib.data.smoke_date);
    if (ent.data) setEntries(ent.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const setStartDate = async (date) => {
    const { data: existing } = await supabase.from("liberty").select("id").eq("user_id", user.id).single();
    if (existing) {
      await supabase.from("liberty").update({ smoke_date: date }).eq("user_id", user.id);
    } else {
      await supabase.from("liberty").insert({ user_id: user.id, smoke_date: date });
    }
    setSmokeDate(date);
  };

  const resetJourney = async () => {
    await supabase.from("liberty").update({ smoke_date: null }).eq("user_id", user.id);
    await supabase.from("liberty_entries").delete().eq("user_id", user.id);
    setSmokeDate(null);
    setEntries([]);
  };

  const addEntry = async (type, text) => {
    const { data } = await supabase
      .from("liberty_entries")
      .insert({ user_id: user.id, type, text })
      .select()
      .single();
    if (data) setEntries((p) => [data, ...p]);
  };

  const cravings = entries.filter((e) => e.type === "craving");
  const victories = entries.filter((e) => e.type === "victory");

  return {
    smokeDate, cravings, victories, loading,
    setStartDate, resetJourney, addEntry,
    refetch: fetch,
  };
}
