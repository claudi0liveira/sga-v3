"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

// ============================================================
// useLiberty v2.0
// REGRA DE OURO: liberty_entries NUNCA são apagadas.
// Reset = registra tentativa + reseta smoke_date. Sem deletes.
// ============================================================

export function useLiberty() {
  const { user } = useAuth();
  const supabase = createClient();

  const [smokeDate, setSmokeDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [lib, ent] = await Promise.all([
      supabase.from("liberty").select("*").eq("user_id", user.id).single(),
      supabase.from("liberty_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (lib.data) {
      setSmokeDate(lib.data.smoke_date);
      setProfile(lib.data.usage_profile || null);
    }
    if (ent.data) setEntries(ent.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Iniciar/atualizar data de início ───────────────────
  const setStartDate = async (date, usageProfile) => {
    const record = { smoke_date: date };
    if (usageProfile) record.usage_profile = usageProfile;

    const { data: existing } = await supabase
      .from("liberty").select("id").eq("user_id", user.id).single();

    if (existing) {
      await supabase.from("liberty").update(record).eq("user_id", user.id);
    } else {
      await supabase.from("liberty").insert({ user_id: user.id, ...record });
    }
    setSmokeDate(date);
    if (usageProfile) setProfile(usageProfile);
  };

  // ── RESET CORRIGIDO — NUNCA apaga entries ──────────────
  const resetJourney = async (relapseData = {}) => {
    if (!user) return;

    // 1) Se tinha jornada ativa, registrar como tentativa
    if (smokeDate) {
      const startMs = new Date(smokeDate).getTime();
      const nowMs = Date.now();
      const durationMs = nowMs - startMs;
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      // INSERT tentativa — PERMANENTE
      const { data: attemptData } = await supabase
        .from("liberty_entries")
        .insert({
          user_id: user.id,
          type: "attempt",
          text: `Tentativa: ${durationDays}d ${durationHours}h livre`,
          metadata: {
            started_at: smokeDate,
            ended_at: new Date().toISOString(),
            duration_days: durationDays,
            duration_hours: durationHours,
            duration_ms: durationMs,
          },
        })
        .select().single();

      if (attemptData) setEntries((p) => [attemptData, ...p]);
    }

    // 2) Se tem dados de recaída, registrar
    if (relapseData.quantity || relapseData.note) {
      const { data: relapseResult } = await supabase
        .from("liberty_entries")
        .insert({
          user_id: user.id,
          type: "relapse",
          text: relapseData.note || `Recaída: ${relapseData.quantity || "?"} unidades`,
          metadata: {
            quantity: relapseData.quantity || null,
            frequency: relapseData.frequency || null,
            context: relapseData.context || null,
            date: new Date().toISOString(),
          },
        })
        .select().single();

      if (relapseResult) setEntries((p) => [relapseResult, ...p]);
    }

    // 3) Resetar smoke_date — nova jornada começa agora
    const newDate = new Date().toISOString();
    await supabase.from("liberty").update({ smoke_date: newDate }).eq("user_id", user.id);
    setSmokeDate(newDate);

    // ❌ REMOVIDO: delete de liberty_entries
    // ❌ REMOVIDO: setEntries([])
  };

  // ── Adicionar entry (craving/victory) ──────────────────
  const addEntry = async (type, text) => {
    const { data } = await supabase
      .from("liberty_entries")
      .insert({ user_id: user.id, type, text })
      .select()
      .single();
    if (data) setEntries((p) => [data, ...p]);
  };

  // ── Atualizar perfil de uso ────────────────────────────
  const updateUsageProfile = async (usageProfile) => {
    if (!user) return;
    const { error } = await supabase
      .from("liberty").update({ usage_profile: usageProfile }).eq("user_id", user.id);
    if (!error) setProfile(usageProfile);
    return !error;
  };

  // ── Stats de redução gradual ───────────────────────────
  const reductionStats = useMemo(() => {
    if (!profile || !profile.quantity) return null;
    const baselineDaily = profile.quantity;
    const baselineFreq = profile.frequency || "diário";
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentRelapses = entries.filter(
      (e) => e.type === "relapse" && e.metadata &&
        new Date(e.metadata?.date || e.created_at).getTime() > weekAgo
    );
    const totalConsumedThisWeek = recentRelapses.reduce(
      (sum, r) => sum + (r.metadata?.quantity || 0), 0
    );
    const baselineWeekly = baselineFreq === "diário" ? baselineDaily * 7
      : baselineFreq === "semanal" ? baselineDaily : baselineDaily * 3.5;
    const reductionPct = baselineWeekly > 0
      ? Math.round(((baselineWeekly - totalConsumedThisWeek) / baselineWeekly) * 100) : 0;

    return {
      baselineDaily, baselineWeekly, totalConsumedThisWeek,
      reductionPct: Math.max(0, Math.min(100, reductionPct)),
      isMilestone: reductionPct >= 20,
      recentRelapses: recentRelapses.length,
    };
  }, [entries, profile]);

  // ── Marcos de saúde ────────────────────────────────────
  const milestones = useMemo(() => {
    if (!smokeDate) return [];
    const diffDays = (Date.now() - new Date(smokeDate).getTime()) / (1000 * 60 * 60 * 24);
    return [
      { days: 0.04, label: "1 hora", desc: "Frequência cardíaca normaliza", icon: "💓" },
      { days: 0.5, label: "12 horas", desc: "Monóxido de carbono normaliza", icon: "🫁" },
      { days: 1, label: "1 dia", desc: "Risco de infarto diminui", icon: "❤️" },
      { days: 2, label: "2 dias", desc: "Olfato e paladar melhoram", icon: "👃" },
      { days: 3, label: "3 dias", desc: "Respiração mais fácil", icon: "🌬️" },
      { days: 7, label: "1 semana", desc: "Sono melhora", icon: "😴" },
      { days: 14, label: "2 semanas", desc: "Circulação melhora", icon: "🩸" },
      { days: 30, label: "1 mês", desc: "Função pulmonar melhora", icon: "🏃" },
      { days: 90, label: "3 meses", desc: "Capacidade respiratória +30%", icon: "🧘" },
      { days: 180, label: "6 meses", desc: "Tosse e falta de ar diminuem", icon: "🌿" },
      { days: 365, label: "1 ano", desc: "Risco cardíaco cai 50%", icon: "🏆" },
    ].map((m) => ({ ...m, reached: diffDays >= m.days, progress: Math.min(100, (diffDays / m.days) * 100) }));
  }, [smokeDate]);

  // ── Computed: separar por tipo ─────────────────────────
  const cravings = entries.filter((e) => e.type === "craving");
  const victories = entries.filter((e) => e.type === "victory");
  const attempts = entries.filter((e) => e.type === "attempt");
  const relapses = entries.filter((e) => e.type === "relapse");

  return {
    // === INTERFACE ORIGINAL (compatível) ===
    smokeDate, cravings, victories, loading,
    setStartDate, resetJourney, addEntry,
    refetch: fetch,
    // === NOVOS ===
    entries, profile, attempts, relapses,
    milestones, reductionStats,
    updateUsageProfile,
  };
}
