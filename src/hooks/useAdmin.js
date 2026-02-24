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

    // Get all profiles (admin can see all via policy)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, role, created_at")
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

  // Toggle a module for a user
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

  // Change user role
  const setUserRole = async (userId, role) => {
    await supabase.from("profiles")
      .update({ role })
      .eq("id", userId);
    
    // If promoting to admin, grant all modules
    if (role === "admin") {
      const allMods = ["calendario", "financeiro", "liberdade", "dados", "docs"];
      for (const mod of allMods) {
        await supabase.from("user_modules").upsert({
          user_id: userId,
          module: mod,
          enabled: true,
          granted_by: user.id,
        }, { onConflict: "user_id,module" });
      }
    }
    await fetch();
  };

  const getUserModule = (userId, module) => {
    return modules.find((m) => m.user_id === userId && m.module === module);
  };

  const getUserModuleCount = (userId) => {
    return modules.filter((m) => m.user_id === userId && m.enabled).length;
  };

  return { users, modules, loading, toggleModule, setUserRole, getUserModule, getUserModuleCount, refetch: fetch };
}
