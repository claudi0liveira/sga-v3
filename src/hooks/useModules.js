"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

// ALL controllable modules
const ALL_MODULES = ["calendario", "financeiro", "liberdade", "dados", "docs"];

export function useModules() {
  const { user } = useAuth();
  const supabase = createClient();
  const [modules, setModules] = useState({});
  const [role, setRole] = useState("colaborador");
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get user profile with role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "colaborador";
    setRole(userRole);

    // Admin has access to everything
    if (userRole === "admin") {
      const mods = {};
      ALL_MODULES.forEach((m) => { mods[m] = true; });
      setModules(mods);
      setLoading(false);
      return;
    }

    // Get user modules from DB
    const { data: modData } = await supabase
      .from("user_modules")
      .select("*")
      .eq("user_id", user.id);

    const mods = {};
    (modData || []).forEach((m) => {
      mods[m.module] = m.enabled;
    });

    setModules(mods);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Check if user has access to a module
  const hasAccess = useCallback((module) => {
    if (role === "admin") return true;
    return modules[module] === true;
  }, [modules, role]);

  return { modules, role, isAdmin, loading, hasAccess, refetch: fetch, ALL_MODULES };
}
