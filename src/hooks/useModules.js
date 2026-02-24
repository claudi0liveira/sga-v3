"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

// Modules that require explicit permission (admin grants access)
const RESTRICTED_MODULES = ["liberdade"];

export function useModules() {
  const { user } = useAuth();
  const supabase = createClient();
  const [modules, setModules] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Check if admin
    const { data: adminData } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();
    
    const admin = !!adminData;
    setIsAdmin(admin);

    // Get user modules
    const { data: modData } = await supabase
      .from("user_modules")
      .select("*")
      .eq("user_id", user.id);

    const mods = {};
    (modData || []).forEach((m) => {
      mods[m.module] = m.enabled;
    });

    // Admin has access to everything
    if (admin) {
      RESTRICTED_MODULES.forEach((m) => { mods[m] = true; });
    }

    setModules(mods);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Check if user has access to a module
  const hasAccess = useCallback((module) => {
    // Free modules - always accessible
    if (!RESTRICTED_MODULES.includes(module)) return true;
    // Restricted modules - need explicit grant
    return modules[module] === true;
  }, [modules]);

  return { modules, isAdmin, loading, hasAccess, refetch: fetch };
}
