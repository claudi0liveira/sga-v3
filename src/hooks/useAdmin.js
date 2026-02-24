"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function useAdmin() {
  const { user } = useAuth();
  const supabase = createClient();
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    // Get all module grants
    const { data: mods } = await supabase
      .from("user_modules")
      .select("*");

    setUsers(profiles || []);
    setModules(mods || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleModule = async (userId, module, enabled) => {
    if (enabled) {
      await supabase.from("user_modules").upsert({
        user_id: userId,
        module,
        enabled: true,
        granted_by: user.id,
      }, { onConflict: "user_id,module" });
    } else {
      await supabase.from("user_modules")
        .delete()
        .eq("user_id", userId)
        .eq("module", module);
    }
    await fetch();
  };

  const getUserModule = (userId, module) => {
    return modules.find((m) => m.user_id === userId && m.module === module);
  };

  return { users, modules, loading, toggleModule, getUserModule, refetch: fetch };
}
