"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "./useAuth";

export function useFinance() {
  const { user } = useAuth();
  const supabase = createClient();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [inc, exp, res, resItems] = await Promise.all([
      supabase.from("incomes").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("reserves").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("reserve_items").select("*, reserves!inner(user_id)").eq("reserves.user_id", user.id),
    ]);

    if (inc.data) setIncomes(inc.data);
    if (exp.data) setExpenses(exp.data);
    if (res.data && resItems.data) {
      const items = resItems.data;
      setReserves(res.data.map((r) => ({
        ...r,
        items: items.filter((i) => i.reserve_id === r.id),
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Incomes
  const addIncome = async (income) => {
    const { data } = await supabase.from("incomes").insert({ ...income, user_id: user.id }).select().single();
    if (data) setIncomes((p) => [...p, data]);
  };
  const deleteIncome = async (id) => {
    await supabase.from("incomes").delete().eq("id", id);
    setIncomes((p) => p.filter((i) => i.id !== id));
  };

  // Expenses
  const addExpense = async (expense) => {
    const { data } = await supabase.from("expenses").insert({ ...expense, user_id: user.id }).select().single();
    if (data) setExpenses((p) => [...p, data]);
  };
  const updateExpense = async (id, updates) => {
    await supabase.from("expenses").update(updates).eq("id", id);
    setExpenses((p) => p.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };
  const deleteExpense = async (id) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((p) => p.filter((e) => e.id !== id));
  };

  // Reserves
  const addReserve = async (name) => {
    const { data } = await supabase.from("reserves").insert({ name, user_id: user.id }).select().single();
    if (data) setReserves((p) => [...p, { ...data, items: [] }]);
  };
  const deleteReserve = async (id) => {
    await supabase.from("reserves").delete().eq("id", id);
    setReserves((p) => p.filter((r) => r.id !== id));
  };
  const addReserveItem = async (reserveId, label, value) => {
    const { data } = await supabase.from("reserve_items").insert({ reserve_id: reserveId, label, value }).select().single();
    if (data) setReserves((p) => p.map((r) => r.id === reserveId ? { ...r, items: [...r.items, data] } : r));
  };
  const deleteReserveItem = async (reserveId, itemId) => {
    await supabase.from("reserve_items").delete().eq("id", itemId);
    setReserves((p) => p.map((r) => r.id === reserveId ? { ...r, items: r.items.filter((i) => i.id !== itemId) } : r));
  };

  // Calculated
  const totalReserved = reserves.reduce((sum, r) => sum + (r.items || []).reduce((s, i) => s + Number(i.value), 0), 0);

  return {
    incomes, expenses, reserves, loading, totalReserved,
    addIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    addReserve, deleteReserve, addReserveItem, deleteReserveItem,
    refetch: fetch,
  };
}
