"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function useQuickLinks() {
  const { user } = useAuth();
  const supabase = createClient();
  const [links, setLinks] = useState([]);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("quick_links").select("*").eq("user_id", user.id).order("sort_order");
    if (data) setLinks(data);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const addLink = async (label, url) => {
    const { data } = await supabase.from("quick_links")
      .insert({ user_id: user.id, label, url, sort_order: links.length })
      .select().single();
    if (data) setLinks((p) => [...p, data]);
  };

  const removeLink = async (id) => {
    await supabase.from("quick_links").delete().eq("id", id);
    setLinks((p) => p.filter((l) => l.id !== id));
  };

  return { links, addLink, removeLink, refetch: fetch };
}
