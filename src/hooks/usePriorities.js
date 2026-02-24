"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function usePriorities() {
  const { user } = useAuth();
  const supabase = createClient();
  const [priorities, setPriorities] = useState([]);
  const [phase, setPhase] = useState({ title: "", quote: "" });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [pri, ph] = await Promise.all([
      supabase.from("priorities").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("phase").select("*").eq("user_id", user.id).single(),
    ]);
    if (pri.data) setPriorities(pri.data);
    if (ph.data) setPhase({ title: ph.data.title || "", quote: ph.data.quote || "" });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const savePriorities = async (list) => {
    // Delete existing, insert new
    await supabase.from("priorities").delete().eq("user_id", user.id);
    if (list.length > 0) {
      const rows = list.map((p, i) => ({
        user_id: user.id,
        text: p.text,
        icon: p.icon || "🎯",
        description: p.desc || null,
        sort_order: i,
      }));
      await supabase.from("priorities").insert(rows);
    }
    setPriorities(list);
  };

  const savePhase = async (phaseData) => {
    const { data: existing } = await supabase.from("phase").select("id").eq("user_id", user.id).single();
    if (existing) {
      await supabase.from("phase").update({ title: phaseData.title, quote: phaseData.quote }).eq("user_id", user.id);
    } else {
      await supabase.from("phase").insert({ user_id: user.id, title: phaseData.title, quote: phaseData.quote });
    }
    setPhase(phaseData);
  };

  return {
    priorities, phase, loading,
    savePriorities, savePhase,
    refetch: fetch,
  };
}
