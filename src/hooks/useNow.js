"use client";
import { useState, useEffect } from "react";

export function useNow(intervalMs = 10000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(i);
  }, [intervalMs]);
  return now;
}
